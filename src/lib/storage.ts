/**
 * Persistent Storage for Credits using Upstash Redis
 */

import { Redis } from '@upstash/redis';

const CREDITS_PREFIX = 'slashbot:credits:';
const TX_PREFIX = 'slashbot:tx:';
const TX_LIST_KEY = 'slashbot:transactions';

interface TransactionRecord {
  signature: string;
  walletAddress: string;
  amount: number;
  tokenType: 'SOL' | 'SLASHBOT';
  creditsAwarded: number;
  timestamp: string;
}

// Upstash Redis client (uses REST API, no persistent connection needed)
// Reads from UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCredits(walletAddress: string): Promise<number> {
  const credits = await redis.get<string>(`${CREDITS_PREFIX}${walletAddress}`);
  return credits ? parseInt(credits, 10) : 0;
}

export async function addCredits(walletAddress: string, amount: number): Promise<number> {
  const key = `${CREDITS_PREFIX}${walletAddress}`;
  const newBalance = await redis.incrby(key, amount);
  return newBalance;
}

export async function deductCreditsFromStorage(
  walletAddress: string,
  amount: number
): Promise<{ success: boolean; newBalance: number }> {
  const key = `${CREDITS_PREFIX}${walletAddress}`;

  const current = await redis.get<string>(key);
  const currentBalance = current ? parseInt(current, 10) : 0;

  if (currentBalance < amount) {
    return { success: false, newBalance: currentBalance };
  }

  const newBalance = await redis.decrby(key, amount);
  return { success: true, newBalance };
}

export async function claimTransaction(signature: string): Promise<boolean> {
  const claimed = await redis.setnx(`${TX_PREFIX}${signature}`, 'pending');
  return claimed === 1;
}

export async function releaseTransaction(signature: string): Promise<void> {
  await redis.del(`${TX_PREFIX}${signature}`);
}

export async function finalizeTransaction(
  signature: string,
  walletAddress: string,
  amount: number,
  tokenType: 'SOL' | 'SLASHBOT',
  creditsAwarded: number
): Promise<void> {
  const record: TransactionRecord = {
    signature,
    walletAddress,
    amount,
    tokenType,
    creditsAwarded,
    timestamp: new Date().toISOString(),
  };

  await redis.set(`${TX_PREFIX}${signature}`, JSON.stringify(record));
  await redis.lpush(TX_LIST_KEY, JSON.stringify(record));
  await redis.ltrim(TX_LIST_KEY, 0, 9999);
}
