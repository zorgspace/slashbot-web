/**
 * Wallet Authentication
 * Verifies ed25519 signatures from slashbot CLI wallet
 */

import { PublicKey } from '@solana/web3.js';
import * as crypto from 'crypto';
import bs58 from 'bs58';

const MAX_SIGNATURE_AGE = 5 * 60 * 1000;

interface WalletAuthHeaders {
  walletAddress: string;
  signature: string;
  timestamp: number;
  bodyHash?: string;
}

function extractAuthHeaders(headers: Headers): WalletAuthHeaders | null {
  const walletAddress = headers.get('X-Wallet-Address');
  const signature = headers.get('X-Wallet-Signature');
  const timestampStr = headers.get('X-Wallet-Timestamp');
  const bodyHash = headers.get('X-Body-Hash') || undefined;

  if (!walletAddress || !signature || !timestampStr) {
    return null;
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return null;
  }

  return { walletAddress, signature, timestamp, bodyHash };
}

function hashBody(body: string): string {
  return crypto.createHash('sha256').update(body).digest('hex');
}

function verifyWalletSignature(
  auth: WalletAuthHeaders,
  expectedBodyHash?: string
): { valid: boolean; error?: string } {
  const now = Date.now();
  const age = now - auth.timestamp;

  if (age > MAX_SIGNATURE_AGE) {
    return { valid: false, error: 'Signature expired' };
  }

  if (age < -60000) {
    return { valid: false, error: 'Invalid timestamp (future)' };
  }

  try {
    new PublicKey(auth.walletAddress);
  } catch {
    return { valid: false, error: 'Invalid wallet address' };
  }

  if (expectedBodyHash && auth.bodyHash !== expectedBodyHash) {
    return { valid: false, error: 'Body hash mismatch - request may have been tampered' };
  }

  const message = auth.bodyHash
    ? `slashbot:${auth.walletAddress}:${auth.timestamp}:${auth.bodyHash}`
    : `slashbot:${auth.walletAddress}:${auth.timestamp}`;

  try {
    const messageBytes = Buffer.from(message, 'utf-8');
    const signatureBytes = Buffer.from(auth.signature, 'base64');
    const publicKeyBytes = bs58.decode(auth.walletAddress);

    const publicKey = crypto.createPublicKey({
      key: Buffer.concat([
        Buffer.from('302a300506032b6570032100', 'hex'),
        Buffer.from(publicKeyBytes),
      ]),
      format: 'der',
      type: 'spki',
    });

    const isValid = crypto.verify(null, messageBytes, publicKey, signatureBytes);

    if (!isValid) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Auth] Signature verification error:', error);
    return { valid: false, error: 'Signature verification failed' };
  }
}

export function authenticateRequest(
  headers: Headers,
  body?: string
): {
  authenticated: boolean;
  walletAddress?: string;
  error?: string;
} {
  const auth = extractAuthHeaders(headers);

  if (!auth) {
    return { authenticated: false, error: 'Missing authentication headers (X-Wallet-Address, X-Wallet-Signature, X-Wallet-Timestamp)' };
  }

  const expectedBodyHash = body ? hashBody(body) : undefined;

  if (body && !auth.bodyHash) {
    return { authenticated: false, error: 'Missing X-Body-Hash header for request with body' };
  }

  const verification = verifyWalletSignature(auth, expectedBodyHash);

  if (!verification.valid) {
    return { authenticated: false, error: verification.error };
  }

  return { authenticated: true, walletAddress: auth.walletAddress };
}
