/**
 * Shared Constants
 * Must be kept in sync with slashbot CLI (src/services/wallet/types.ts)
 */

/** SLASHBOT token mint address on Solana mainnet */
export const SLASHBOT_TOKEN_MINT = 'AtiFyHm6UMNLXCWJGLqhxSwvr3n3MgFKxppkKWUoBAGS';

/** Token decimals for SLASHBOT (standard SPL token) */
export const TOKEN_DECIMALS = 9;

/** Treasury address for receiving deposits */
export const TREASURY_ADDRESS = 'DVGjCZVJ3jMw8gsHAQjuYFMj8xQJyVf17qKrciYCS9u7';

/** Default Solana RPC endpoint */
export const DEFAULT_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

/** Credits per SLASHBOT token (1 token = 1 credit) */
export const CREDITS_PER_TOKEN = 1;

/**
 * Credits per USD - DEPRECATED, use dynamic calculation
 * Since 1 credit = 1 SLASHBOT token, this should be calculated from exchange rates:
 * creditsPerUsd = 1 / (slashbotSol * solUsd)
 */
export const CREDITS_PER_USD_FALLBACK = 1000; // Only used if exchange rates unavailable

/** Balance cache TTL in milliseconds */
export const BALANCE_CACHE_TTL = 30_000; // 30 seconds

/** Exchange rate cache TTL in milliseconds (15 minutes) */
export const EXCHANGE_RATE_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/** SOL mint address (native wrapped SOL) */
export const SOL_MINT = 'So11111111111111111111111111111111111111112';

/** Lamports per SOL */
export const LAMPORTS_PER_SOL = 1_000_000_000;
