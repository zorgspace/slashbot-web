/**
 * Balance Verification Service
 */

import { PublicKey } from '@solana/web3.js';
import { TREASURY_ADDRESS } from './constants';
import { getCredits, deductCreditsFromStorage } from './storage';

export { TREASURY_ADDRESS };

export async function getCreditBalance(walletAddress: string): Promise<number> {
  return await getCredits(walletAddress);
}

export async function deductCredits(
  walletAddress: string,
  amount: number,
  reason: string
): Promise<boolean> {
  const result = await deductCreditsFromStorage(walletAddress, amount);
  if (result.success) {
    console.log(`[Balance] Deducted ${amount} credits from ${walletAddress} (${reason}), new balance: ${result.newBalance}`);
  } else {
    console.error(`[Balance] Failed to deduct ${amount} credits from ${walletAddress}: insufficient balance`);
  }
  return result.success;
}

export async function verifyBalance(
  walletAddress: string,
  estimatedCost: number
): Promise<{
  sufficient: boolean;
  currentBalance: number;
  estimatedCost: number;
  shortfall: number;
}> {
  const currentBalance = await getCreditBalance(walletAddress);
  const sufficient = currentBalance >= estimatedCost;

  return {
    sufficient,
    currentBalance,
    estimatedCost,
    shortfall: sufficient ? 0 : estimatedCost - currentBalance,
  };
}

export function isValidWalletAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
