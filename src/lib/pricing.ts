/**
 * Dynamic Pricing Service
 * Calculates API call costs at xAI prices (no markup)
 * Exchange rates are fetched from Solana DEXes and cached for 15 minutes
 */

import { Redis } from '@upstash/redis';
import {
  CREDITS_PER_USD_FALLBACK,
  EXCHANGE_RATE_CACHE_TTL,
  SOL_MINT,
  SLASHBOT_TOKEN_MINT,
} from './constants';

// Redis client for persistent caching
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Redis key for exchange rates
const EXCHANGE_RATES_KEY = 'slashbot:exchange_rates';

/**
 * Model pricing structure (prices per million tokens)
 */
interface ModelPricing {
  model: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  cachedInputPricePerMillion?: number; // Discounted price for cached tokens
  supportsReasoningTokens?: boolean;
}

/**
 * Exchange rates for currency conversion
 */
export interface ExchangeRates {
  solUsd: number;
  slashbotSol: number;
  updatedAt: number;
}

/**
 * Detailed cost breakdown for an API call
 */
export interface ApiCallCost {
  // Total costs
  usd: number;
  sol: number;
  slashbot: number;
  credits: number;

  // Request info
  model: string;
  inputTokens: number;
  outputTokens: number;

  // Detailed breakdown
  breakdown: {
    inputCostUsd: number;
    outputCostUsd: number;
    cachedInputCostUsd: number;
    totalCostUsd: number;
  };

  // Token details
  tokenDetails: {
    inputTokens: number;
    outputTokens: number;
    cachedTokens: number;
    reasoningTokens: number;
    totalBillableTokens: number;
  };

  // Prices used
  pricing: {
    inputPricePerMillion: number;
    outputPricePerMillion: number;
    cachedPricePerMillion: number;
  };
}

/**
 * Quick cost estimate (for balance checks before request)
 */
export interface CostEstimate {
  credits: number;
  usd: number;
  estimatedOutputTokens: number;
  model: string;
}

/**
 * xAI model pricing table
 */
const XAI_MODEL_PRICING: ModelPricing[] = [
  {
    model: 'grok-4-1-fast-reasoning',
    inputPricePerMillion: 0.2,
    outputPricePerMillion: 0.5,
    cachedInputPricePerMillion: 0.05,
    supportsReasoningTokens: true,
  },
  {
    model: 'grok-4-1-fast-non-reasoning',
    inputPricePerMillion: 0.2,
    outputPricePerMillion: 0.5,
    cachedInputPricePerMillion: 0.05,
  },
  {
    model: 'grok-code-fast-1',
    inputPricePerMillion: 0.2,
    outputPricePerMillion: 1.5,
    cachedInputPricePerMillion: 0.05,
  },
  // Note: grok-2 and grok-3 models are disabled
];

const DEFAULT_MODEL_PRICING: ModelPricing = {
  model: 'default',
  inputPricePerMillion: 1.0,
  outputPricePerMillion: 3.0,
  cachedInputPricePerMillion: 0.25,
};

// In-memory cache for fast access (backed by Redis)
let cachedRates: ExchangeRates | null = null;

/**
 * Get exchange rates from Redis cache
 */
async function getRedisRates(): Promise<ExchangeRates | null> {
  try {
    const rates = await redis.get<ExchangeRates>(EXCHANGE_RATES_KEY);
    return rates;
  } catch (error) {
    console.error('[Pricing] Failed to get rates from Redis:', error);
    return null;
  }
}

/**
 * Save exchange rates to Redis cache
 */
async function setRedisRates(rates: ExchangeRates): Promise<void> {
  try {
    // Store with TTL slightly longer than refresh interval to handle edge cases
    const ttlSeconds = Math.ceil(EXCHANGE_RATE_CACHE_TTL / 1000) + 60;
    await redis.set(EXCHANGE_RATES_KEY, rates, { ex: ttlSeconds });
    console.log(`[Pricing] Cached exchange rates: SOL=$${rates.solUsd}, SLASHBOT=${rates.slashbotSol} SOL`);
  } catch (error) {
    console.error('[Pricing] Failed to cache rates in Redis:', error);
  }
}

/**
 * Get pricing for a model
 */
export function getModelPricing(model: string): ModelPricing {
  const exactMatch = XAI_MODEL_PRICING.find((p) => p.model === model);
  if (exactMatch) return exactMatch;

  const partialMatch = XAI_MODEL_PRICING.find(
    (p) =>
      model.toLowerCase().includes(p.model.toLowerCase()) ||
      p.model.toLowerCase().includes(model.toLowerCase())
  );
  if (partialMatch) return { ...partialMatch, model };

  return { ...DEFAULT_MODEL_PRICING, model };
}

/**
 * Get all available model pricing
 */
export function getAllModelPricing(): ModelPricing[] {
  return [...XAI_MODEL_PRICING];
}

/**
 * Fetch SOL/USD price from CoinGecko
 */
async function fetchSolUsdPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) throw new Error(`CoinGecko error: ${response.status}`);

    const data = (await response.json()) as { solana?: { usd?: number } };
    return data.solana?.usd || 150;
  } catch (error) {
    console.error('[Pricing] Failed to fetch SOL/USD:', error);
    return 150;
  }
}

/**
 * Fetch SLASHBOT/SOL price from DEX
 */
async function fetchSlashbotSolPrice(): Promise<number> {
  try {
    const response = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${SLASHBOT_TOKEN_MINT}&amount=1000000000&slippageBps=50`,
      { headers: { Accept: 'application/json' } }
    );

    if (response.ok) {
      const data = (await response.json()) as { outAmount?: string; error?: string };
      if (!data.error && data.outAmount) {
        const slashbotPerSol = Number(data.outAmount) / 1e9;
        return 1 / slashbotPerSol;
      }
    }
  } catch {
    // Try fallback
  }

  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${SLASHBOT_TOKEN_MINT}`,
      { headers: { Accept: 'application/json' } }
    );

    if (response.ok) {
      const data = (await response.json()) as {
        pairs?: Array<{
          priceUsd?: string;
          priceNative?: string;
          baseToken?: { symbol?: string };
        }>;
      };

      const solPair = data.pairs?.find(
        (p) => p.baseToken?.symbol === 'SLASHBOT' || p.priceNative
      );

      if (solPair?.priceNative) {
        return parseFloat(solPair.priceNative);
      } else if (solPair?.priceUsd) {
        const solPrice = await fetchSolUsdPrice();
        return parseFloat(solPair.priceUsd) / solPrice;
      }
    }
  } catch (error) {
    console.error('[Pricing] Failed to fetch SLASHBOT/SOL:', error);
  }

  return 0.000001;
}

/**
 * Fetch current exchange rates
 * Uses a 3-tier caching strategy:
 * 1. In-memory cache (fastest, per-instance)
 * 2. Redis cache (persistent, shared across instances)
 * 3. Fresh fetch from DEX APIs (every 15 minutes)
 */
export async function fetchExchangeRates(forceRefresh = false): Promise<ExchangeRates> {
  const now = Date.now();

  // Tier 1: Check in-memory cache
  if (!forceRefresh && cachedRates && now - cachedRates.updatedAt < EXCHANGE_RATE_CACHE_TTL) {
    return cachedRates;
  }

  // Tier 2: Check Redis cache
  if (!forceRefresh) {
    const redisRates = await getRedisRates();
    if (redisRates && now - redisRates.updatedAt < EXCHANGE_RATE_CACHE_TTL) {
      cachedRates = redisRates;
      return redisRates;
    }
  }

  // Tier 3: Fetch fresh rates from DEX APIs
  console.log('[Pricing] Fetching fresh exchange rates from DEX APIs...');
  const [solUsd, slashbotSol] = await Promise.all([fetchSolUsdPrice(), fetchSlashbotSolPrice()]);

  const newRates: ExchangeRates = { solUsd, slashbotSol, updatedAt: now };

  // Update both caches
  cachedRates = newRates;
  await setRedisRates(newRates);

  return newRates;
}

/**
 * Get cached exchange rates (does not fetch new ones)
 * Useful for displaying current rates without triggering a refresh
 */
export async function getCachedExchangeRates(): Promise<ExchangeRates | null> {
  // Check in-memory first
  if (cachedRates) {
    return cachedRates;
  }

  // Check Redis
  const redisRates = await getRedisRates();
  if (redisRates) {
    cachedRates = redisRates;
    return redisRates;
  }

  return null;
}

/**
 * Force refresh exchange rates (called every 15 minutes by cron or on-demand)
 */
export async function refreshExchangeRates(): Promise<ExchangeRates> {
  return fetchExchangeRates(true);
}

/**
 * Calculate dynamic credits per USD based on SLASHBOT token price
 * Since 1 credit = 1 SLASHBOT token:
 * - SLASHBOT price in USD = slashbotSol * solUsd
 * - Credits per USD = 1 / slashbotPriceUsd
 */
export function getCreditsPerUsd(rates: ExchangeRates): number {
  const slashbotPriceUsd = rates.slashbotSol * rates.solUsd;

  // Sanity check - if price is too low or invalid, use fallback
  if (!slashbotPriceUsd || slashbotPriceUsd <= 0 || !isFinite(slashbotPriceUsd)) {
    console.warn('[Pricing] Invalid SLASHBOT price, using fallback CREDITS_PER_USD');
    return CREDITS_PER_USD_FALLBACK;
  }

  const creditsPerUsd = 1 / slashbotPriceUsd;

  // Cap at reasonable bounds (prevent extreme values from bad price data)
  const MIN_CREDITS_PER_USD = 1;        // $1 per credit minimum
  const MAX_CREDITS_PER_USD = 10000000; // $0.0000001 per credit maximum

  return Math.max(MIN_CREDITS_PER_USD, Math.min(MAX_CREDITS_PER_USD, creditsPerUsd));
}

/**
 * Calculate detailed cost for an API call
 */
export async function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  options?: {
    cachedTokens?: number;
    reasoningTokens?: number;
    rates?: ExchangeRates;
  }
): Promise<ApiCallCost> {
  const exchangeRates = options?.rates || (await fetchExchangeRates());
  const pricing = getModelPricing(model);
  const cachedTokens = options?.cachedTokens || 0;
  const reasoningTokens = options?.reasoningTokens || 0;

  // Calculate non-cached input tokens
  const nonCachedInputTokens = Math.max(0, inputTokens - cachedTokens);

  // Calculate individual costs (USD per million tokens) - at cost, no markup
  const inputCostUsd = (nonCachedInputTokens / 1_000_000) * pricing.inputPricePerMillion;
  const cachedInputCostUsd =
    (cachedTokens / 1_000_000) * (pricing.cachedInputPricePerMillion || pricing.inputPricePerMillion * 0.25);
  const outputCostUsd = (outputTokens / 1_000_000) * pricing.outputPricePerMillion;

  // Total cost (at cost, no markup)
  const totalUsd = inputCostUsd + cachedInputCostUsd + outputCostUsd;

  // Convert to other currencies
  const sol = totalUsd / exchangeRates.solUsd;
  const slashbot = sol / exchangeRates.slashbotSol;
  // Dynamic credits based on SLASHBOT token price (1 credit = 1 SLASHBOT)
  const creditsPerUsd = getCreditsPerUsd(exchangeRates);
  const credits = Math.ceil(totalUsd * creditsPerUsd);

  return {
    usd: Math.round(totalUsd * 1_000_000) / 1_000_000,
    sol: Math.round(sol * 1_000_000_000) / 1_000_000_000,
    slashbot: Math.round(slashbot * 100) / 100,
    credits,
    model,
    inputTokens,
    outputTokens,
    breakdown: {
      inputCostUsd: Math.round(inputCostUsd * 1_000_000) / 1_000_000,
      outputCostUsd: Math.round(outputCostUsd * 1_000_000) / 1_000_000,
      cachedInputCostUsd: Math.round(cachedInputCostUsd * 1_000_000) / 1_000_000,
      totalCostUsd: Math.round(totalUsd * 1_000_000) / 1_000_000,
    },
    tokenDetails: {
      inputTokens,
      outputTokens,
      cachedTokens,
      reasoningTokens,
      totalBillableTokens: inputTokens + outputTokens,
    },
    pricing: {
      inputPricePerMillion: pricing.inputPricePerMillion,
      outputPricePerMillion: pricing.outputPricePerMillion,
      cachedPricePerMillion: pricing.cachedInputPricePerMillion || pricing.inputPricePerMillion * 0.25,
    },
  };
}

/**
 * Quick cost estimate for balance checks
 */
export async function estimateCost(
  model: string,
  inputTokens: number,
  estimatedOutputTokens?: number,
  maxTokens?: number
): Promise<CostEstimate> {
  // Smart output estimation based on model type
  let outputEstimate = estimatedOutputTokens;

  if (!outputEstimate) {
    const isReasoningModel = model.includes('reasoning') || model.includes('grok-3');
    const baseRatio = isReasoningModel ? 2.0 : 1.0;
    outputEstimate = Math.ceil(inputTokens * baseRatio);

    // Cap at reasonable defaults
    const defaultMax = isReasoningModel ? 4096 : 2048;
    outputEstimate = Math.min(outputEstimate, maxTokens || defaultMax);

    // Minimum output
    outputEstimate = Math.max(outputEstimate, 100);
  }

  const cost = await calculateCost(model, inputTokens, outputEstimate);

  return {
    credits: cost.credits,
    usd: cost.usd,
    estimatedOutputTokens: outputEstimate,
    model,
  };
}

/**
 * Format cost for display
 */
export function formatCost(cost: ApiCallCost): string {
  const parts: string[] = [];

  if (cost.credits >= 1) {
    parts.push(`${cost.credits} credits`);
  }

  if (cost.usd >= 0.0001) {
    parts.push(`$${cost.usd.toFixed(4)}`);
  } else if (cost.usd > 0) {
    parts.push(`$${cost.usd.toExponential(2)}`);
  }

  return parts.join(' / ') || '$0.00';
}

/**
 * Format token count for display
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  } else if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Get pricing table for display
 */
export function getPricingTable(): Array<{
  model: string;
  inputPrice: string;
  outputPrice: string;
  cachedPrice: string;
  supportsReasoning: boolean;
}> {
  return XAI_MODEL_PRICING.map((p) => ({
    model: p.model,
    inputPrice: `$${p.inputPricePerMillion.toFixed(2)}/M`,
    outputPrice: `$${p.outputPricePerMillion.toFixed(2)}/M`,
    cachedPrice: `$${(p.cachedInputPricePerMillion || p.inputPricePerMillion * 0.25).toFixed(2)}/M`,
    supportsReasoning: p.supportsReasoningTokens || false,
  }));
}
