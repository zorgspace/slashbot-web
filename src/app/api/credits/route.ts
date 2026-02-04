/**
 * Credits API
 * Manages user credit balances and deposit claims
 * Uses Redis persistence for credits across server restarts
 *
 * Endpoints:
 * - GET /api/credits?wallet=<address> - Get credit balance
 * - POST /api/credits - Claim credits from deposit transaction
 * - PUT /api/credits - Deduct credits (internal use)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  SLASHBOT_TOKEN_MINT,
  TREASURY_ADDRESS,
  DEFAULT_RPC_URL,
  CREDITS_PER_TOKEN,
  LAMPORTS_PER_SOL,
} from '@/lib/constants';
import { fetchExchangeRates } from '@/lib/pricing';
import {
  getCredits,
  addCredits,
  deductCreditsFromStorage,
  claimTransaction,
  releaseTransaction,
  finalizeTransaction,
} from '@/lib/storage';

/**
 * Validate Solana wallet address
 */
function isValidWalletAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate credits per SOL based on exchange rate
 * 1 SOL = X SLASHBOT tokens, so credits = X * CREDITS_PER_TOKEN
 */
async function getCreditsPerSol(): Promise<number> {
  const rates = await fetchExchangeRates();
  const slashbotPerSol = 1 / rates.slashbotSol;
  return slashbotPerSol * CREDITS_PER_TOKEN;
}

/**
 * GET /api/credits?wallet=<address> - Get credit balance
 */
export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'wallet parameter required' }, { status: 400 });
  }

  if (!isValidWalletAddress(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
  }

  const credits = await getCredits(wallet);

  return NextResponse.json({
    walletAddress: wallet,
    credits,
    lastUpdated: new Date().toISOString(),
  });
}

/**
 * POST /api/credits - Claim credits from a deposit transaction
 *
 * Request body:
 * - wallet_address: string - User's wallet address
 * - transaction_signature: string - Solana transaction signature
 * - token_type: 'SOL' | 'SLASHBOT' (optional, auto-detected)
 *
 * Response (matches slashbot CLI's ClaimResult):
 * - success: boolean
 * - creditsAwarded: number
 * - newBalance: number
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, transaction_signature, token_type } = body as {
      wallet_address: string;
      transaction_signature: string;
      token_type?: 'SOL' | 'SLASHBOT';
    };

    // Validate inputs
    if (!wallet_address || !transaction_signature) {
      return NextResponse.json(
        { success: false, error: 'wallet_address and transaction_signature required' },
        { status: 400 }
      );
    }

    if (!isValidWalletAddress(wallet_address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Atomically claim the transaction (prevents race conditions)
    const claimed = await claimTransaction(transaction_signature);
    if (!claimed) {
      return NextResponse.json(
        { success: false, error: 'Transaction already claimed' },
        { status: 400 }
      );
    }

    // From here, we have exclusive access to this transaction
    // If anything fails, we must release the claim

    let connection: Connection;
    try {
      connection = new Connection(DEFAULT_RPC_URL, 'confirmed');
    } catch (error) {
      await releaseTransaction(transaction_signature);
      throw error;
    }

    try {
      const tx = await connection.getParsedTransaction(transaction_signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) {
        await releaseTransaction(transaction_signature);
        return NextResponse.json(
          { success: false, error: 'Transaction not found. It may still be processing.' },
          { status: 404 }
        );
      }

      if (tx.meta?.err) {
        await releaseTransaction(transaction_signature);
        return NextResponse.json(
          { success: false, error: 'Transaction failed on-chain' },
          { status: 400 }
        );
      }

      // Verify the transaction is a transfer to treasury
      let transferAmount = 0;
      let isSlashbotTransfer = false;

      // Check for SOL transfer
      const postBalances = tx.meta?.postBalances || [];
      const preBalances = tx.meta?.preBalances || [];
      const accountKeys = tx.transaction.message.accountKeys;

      for (let i = 0; i < accountKeys.length; i++) {
        const account = accountKeys[i];
        const pubkey = typeof account === 'string' ? account : account.pubkey.toString();

        if (pubkey === TREASURY_ADDRESS) {
          const received = (postBalances[i] || 0) - (preBalances[i] || 0);
          if (received > 0) {
            transferAmount = received / LAMPORTS_PER_SOL;
            isSlashbotTransfer = false;
          }
        }
      }

      // Check for SPL token (SLASHBOT) transfer
      const tokenTransfers = tx.meta?.postTokenBalances || [];
      const preTokenBalances = tx.meta?.preTokenBalances || [];

      for (const postBalance of tokenTransfers) {
        if (postBalance.owner === TREASURY_ADDRESS && postBalance.mint === SLASHBOT_TOKEN_MINT) {
          const preBalance = preTokenBalances.find(
            (b) => b.accountIndex === postBalance.accountIndex
          );
          const preAmount = preBalance?.uiTokenAmount?.uiAmount || 0;
          const postAmount = postBalance.uiTokenAmount?.uiAmount || 0;
          const received = postAmount - preAmount;

          if (received > 0) {
            transferAmount = received;
            isSlashbotTransfer = true;
          }
        }
      }

      if (transferAmount <= 0) {
        await releaseTransaction(transaction_signature);
        return NextResponse.json(
          { success: false, error: 'No valid transfer to treasury found in transaction' },
          { status: 400 }
        );
      }

      // Calculate credits
      let creditsAwarded: number;

      if (isSlashbotTransfer) {
        creditsAwarded = Math.floor(transferAmount * CREDITS_PER_TOKEN);
      } else {
        // SOL transfer - convert to credits based on exchange rate
        const creditsPerSol = await getCreditsPerSol();
        creditsAwarded = Math.floor(transferAmount * creditsPerSol);
      }

      // Update balance (persistent)
      const newBalance = await addCredits(wallet_address, creditsAwarded);

      // Finalize transaction record (persistent)
      await finalizeTransaction(
        transaction_signature,
        wallet_address,
        transferAmount,
        isSlashbotTransfer ? 'SLASHBOT' : 'SOL',
        creditsAwarded
      );

      console.log(
        `[Credits] Claimed: ${wallet_address} deposited ${transferAmount.toFixed(6)} ${isSlashbotTransfer ? 'SLASHBOT' : 'SOL'} = ${creditsAwarded} credits (balance: ${newBalance})`
      );

      // Response format matches slashbot CLI's ClaimResult
      return NextResponse.json({
        success: true,
        creditsAwarded,
        newBalance,
        walletAddress: wallet_address,
        transactionSignature: transaction_signature,
        tokenType: isSlashbotTransfer ? 'SLASHBOT' : 'SOL',
        amountDeposited: transferAmount,
      });
    } catch (error) {
      // Release the claim on any error during verification
      await releaseTransaction(transaction_signature);
      throw error;
    }
  } catch (error) {
    console.error('[Credits] Claim error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process claim' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/credits - Deduct credits (internal use)
 * Called by the Grok proxy after successful API calls
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, amount, reason } = body as {
      wallet_address: string;
      amount: number;
      reason: string;
    };

    if (!wallet_address || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Deduct from persistent storage
    const result = await deductCreditsFromStorage(wallet_address, amount);

    if (!result.success) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    console.log(`[Credits] Used: ${wallet_address} spent ${amount} credits (${reason}), balance: ${result.newBalance}`);

    return NextResponse.json({
      success: true,
      walletAddress: wallet_address,
      amountUsed: amount,
      reason,
      newBalance: result.newBalance,
    });
  } catch (error) {
    console.error('[Credits] Use error:', error);
    return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 });
  }
}
