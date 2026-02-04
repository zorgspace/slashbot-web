/**
 * Usage Tracking System
 * Comprehensive tracking of API usage, costs, and statistics
 */

import { Redis } from '@upstash/redis';
import { TokenUsage, DetailedTokenUsage, calculateAccuracy } from './tokens';
import { ApiCallCost } from './pricing';

// Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Key prefixes
const USAGE_PREFIX = 'slashbot:usage:';
const USAGE_LIST_PREFIX = 'slashbot:usage_list:';
const STATS_PREFIX = 'slashbot:stats:';
const DAILY_STATS_PREFIX = 'slashbot:daily:';

/**
 * Single usage record
 */
export interface UsageRecord {
  id: string;
  walletAddress: string;
  timestamp: string;
  model: string;
  endpoint: string;
  streaming: boolean;

  // Token usage
  tokens: {
    input: number;
    output: number;
    total: number;
    cached?: number;
    reasoning?: number;
  };

  // Token breakdown
  inputBreakdown?: {
    text: number;
    images: number;
    system: number;
  };

  // Cost information
  cost: {
    usd: number;
    credits: number;
    inputCost: number;
    outputCost: number;
  };

  // Estimation accuracy
  estimation?: {
    estimatedInput: number;
    estimatedOutput: number;
    inputAccuracy: number;
    outputAccuracy: number;
  };

  // Request metadata
  processingTimeMs: number;
  success: boolean;
  errorCode?: string;
}

/**
 * Aggregated statistics
 */
export interface UsageStats {
  period: 'day' | 'week' | 'month' | 'all';
  startDate: string;
  endDate: string;

  // Summary
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;

  // Token totals
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCachedTokens: number;
  totalReasoningTokens: number;

  // Cost totals
  totalCostUsd: number;
  totalCreditsSpent: number;

  // Averages
  avgInputTokens: number;
  avgOutputTokens: number;
  avgCostCredits: number;
  avgProcessingTimeMs: number;

  // Breakdown by model
  byModel: Record<
    string,
    {
      requests: number;
      inputTokens: number;
      outputTokens: number;
      costCredits: number;
    }
  >;

  // Estimation accuracy
  avgInputAccuracy: number;
  avgOutputAccuracy: number;
}

/**
 * Generate unique usage ID
 */
function generateUsageId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Get date keys for time-based indexing
 */
function getDateKeys(date: Date = new Date()): {
  day: string;
  week: string;
  month: string;
} {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // ISO week number
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);

  return {
    day: `${year}-${month}-${day}`,
    week: `${year}-W${String(week).padStart(2, '0')}`,
    month: `${year}-${month}`,
  };
}

/**
 * Record a usage entry
 */
export async function recordUsage(params: {
  walletAddress: string;
  model: string;
  endpoint?: string;
  streaming: boolean;
  usage: TokenUsage | DetailedTokenUsage;
  cost: ApiCallCost;
  estimation?: {
    estimatedInput: number;
    estimatedOutput: number;
  };
  processingTimeMs: number;
  success: boolean;
  errorCode?: string;
}): Promise<UsageRecord> {
  const {
    walletAddress,
    model,
    endpoint = '/api/grok',
    streaming,
    usage,
    cost,
    estimation,
    processingTimeMs,
    success,
    errorCode,
  } = params;

  const id = generateUsageId();
  const timestamp = new Date().toISOString();
  const dateKeys = getDateKeys();

  // Calculate estimation accuracy if available
  let estimationData: UsageRecord['estimation'];
  if (estimation) {
    estimationData = {
      estimatedInput: estimation.estimatedInput,
      estimatedOutput: estimation.estimatedOutput,
      inputAccuracy: calculateAccuracy(estimation.estimatedInput, usage.promptTokens),
      outputAccuracy: calculateAccuracy(estimation.estimatedOutput, usage.completionTokens),
    };
  }

  // Build usage record
  const record: UsageRecord = {
    id,
    walletAddress,
    timestamp,
    model,
    endpoint,
    streaming,
    tokens: {
      input: usage.promptTokens,
      output: usage.completionTokens,
      total: usage.totalTokens,
      cached: usage.cachedTokens,
      reasoning: usage.reasoningTokens,
    },
    inputBreakdown: (usage as DetailedTokenUsage).inputBreakdown
      ? {
          text: (usage as DetailedTokenUsage).inputBreakdown!.text,
          images: (usage as DetailedTokenUsage).inputBreakdown!.images,
          system: (usage as DetailedTokenUsage).inputBreakdown!.system,
        }
      : undefined,
    cost: {
      usd: cost.usd,
      credits: cost.credits,
      inputCost: (cost.inputTokens / 1_000_000) * getInputPrice(model),
      outputCost: (cost.outputTokens / 1_000_000) * getOutputPrice(model),
    },
    estimation: estimationData,
    processingTimeMs,
    success,
    errorCode,
  };

  // Store the record
  const recordKey = `${USAGE_PREFIX}${id}`;
  await redis.set(recordKey, JSON.stringify(record), { ex: 90 * 24 * 60 * 60 }); // 90 days TTL

  // Add to wallet's usage list
  const walletListKey = `${USAGE_LIST_PREFIX}${walletAddress}`;
  await redis.lpush(walletListKey, id);
  await redis.ltrim(walletListKey, 0, 999); // Keep last 1000 records per wallet

  // Update daily stats
  await updateDailyStats(walletAddress, dateKeys.day, record);

  console.log(
    `[Usage] Recorded ${id} for ${walletAddress}: ${usage.totalTokens} tokens, ${cost.credits} credits`
  );

  return record;
}

/**
 * Get model input price (per million tokens)
 */
function getInputPrice(model: string): number {
  const prices: Record<string, number> = {
    'grok-4-1-fast-reasoning': 0.2,
    'grok-4-1-fast-non-reasoning': 0.2,
    'grok-code-fast-1': 0.2,
    // grok-2 and grok-3 models are disabled
  };
  return prices[model] || 1.0;
}

/**
 * Get model output price (per million tokens)
 */
function getOutputPrice(model: string): number {
  const prices: Record<string, number> = {
    'grok-4-1-fast-reasoning': 0.5,
    'grok-4-1-fast-non-reasoning': 0.5,
    'grok-code-fast-1': 1.5,
    // grok-2 and grok-3 models are disabled
  };
  return prices[model] || 3.0;
}

/**
 * Update daily statistics
 */
async function updateDailyStats(
  walletAddress: string,
  day: string,
  record: UsageRecord
): Promise<void> {
  const key = `${DAILY_STATS_PREFIX}${walletAddress}:${day}`;

  // Get existing stats or create new
  // Note: Upstash Redis automatically parses JSON, no need for JSON.parse
  const existing = await redis.get<DailyStats>(key);
  const stats = existing ?? createEmptyDailyStats(day);

  // Update stats
  stats.totalRequests++;
  if (record.success) {
    stats.successfulRequests++;
  } else {
    stats.failedRequests++;
  }

  stats.totalInputTokens += record.tokens.input;
  stats.totalOutputTokens += record.tokens.output;
  stats.totalTokens += record.tokens.total;
  stats.totalCachedTokens += record.tokens.cached || 0;
  stats.totalReasoningTokens += record.tokens.reasoning || 0;

  stats.totalCostUsd += record.cost.usd;
  stats.totalCreditsSpent += record.cost.credits;
  stats.totalProcessingTimeMs += record.processingTimeMs;

  // Update by model
  if (!stats.byModel[record.model]) {
    stats.byModel[record.model] = {
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      costCredits: 0,
    };
  }
  stats.byModel[record.model].requests++;
  stats.byModel[record.model].inputTokens += record.tokens.input;
  stats.byModel[record.model].outputTokens += record.tokens.output;
  stats.byModel[record.model].costCredits += record.cost.credits;

  // Update estimation accuracy tracking
  if (record.estimation) {
    stats.estimationSamples++;
    stats.totalInputAccuracy += record.estimation.inputAccuracy;
    stats.totalOutputAccuracy += record.estimation.outputAccuracy;
  }

  // Save with 90-day TTL
  await redis.set(key, JSON.stringify(stats), { ex: 90 * 24 * 60 * 60 });
}

interface DailyStats {
  day: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCachedTokens: number;
  totalReasoningTokens: number;
  totalCostUsd: number;
  totalCreditsSpent: number;
  totalProcessingTimeMs: number;
  byModel: Record<
    string,
    {
      requests: number;
      inputTokens: number;
      outputTokens: number;
      costCredits: number;
    }
  >;
  estimationSamples: number;
  totalInputAccuracy: number;
  totalOutputAccuracy: number;
}

function createEmptyDailyStats(day: string): DailyStats {
  return {
    day,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    totalCachedTokens: 0,
    totalReasoningTokens: 0,
    totalCostUsd: 0,
    totalCreditsSpent: 0,
    totalProcessingTimeMs: 0,
    byModel: {},
    estimationSamples: 0,
    totalInputAccuracy: 0,
    totalOutputAccuracy: 0,
  };
}

/**
 * Get usage history for a wallet
 */
export async function getUsageHistory(
  walletAddress: string,
  limit = 50,
  offset = 0
): Promise<{ records: UsageRecord[]; total: number }> {
  const listKey = `${USAGE_LIST_PREFIX}${walletAddress}`;

  // Get total count
  const total = await redis.llen(listKey);

  // Get IDs for requested range
  const ids = await redis.lrange(listKey, offset, offset + limit - 1);

  if (ids.length === 0) {
    return { records: [], total };
  }

  // Fetch all records
  const records: UsageRecord[] = [];
  for (const id of ids) {
    const recordKey = `${USAGE_PREFIX}${id}`;
    const data = await redis.get<UsageRecord>(recordKey);
    if (data) {
      records.push(data);
    }
  }

  return { records, total };
}

/**
 * Get usage statistics for a wallet
 */
export async function getUsageStats(
  walletAddress: string,
  period: 'day' | 'week' | 'month' | 'all' = 'month'
): Promise<UsageStats> {
  const now = new Date();
  const dateKeys = getDateKeys(now);

  // Determine date range
  let startDate: Date;
  let days: number;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      days = 1;
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      days = 7;
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      days = 30;
      break;
    case 'all':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 90); // Max 90 days
      days = 90;
      break;
  }

  // Aggregate daily stats
  const aggregated = createEmptyDailyStats('aggregate');

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dayKey = getDateKeys(date).day;
    const key = `${DAILY_STATS_PREFIX}${walletAddress}:${dayKey}`;

    const dayStats = await redis.get<DailyStats>(key);
    if (dayStats) {

      aggregated.totalRequests += dayStats.totalRequests;
      aggregated.successfulRequests += dayStats.successfulRequests;
      aggregated.failedRequests += dayStats.failedRequests;
      aggregated.totalInputTokens += dayStats.totalInputTokens;
      aggregated.totalOutputTokens += dayStats.totalOutputTokens;
      aggregated.totalTokens += dayStats.totalTokens;
      aggregated.totalCachedTokens += dayStats.totalCachedTokens;
      aggregated.totalReasoningTokens += dayStats.totalReasoningTokens;
      aggregated.totalCostUsd += dayStats.totalCostUsd;
      aggregated.totalCreditsSpent += dayStats.totalCreditsSpent;
      aggregated.totalProcessingTimeMs += dayStats.totalProcessingTimeMs;
      aggregated.estimationSamples += dayStats.estimationSamples;
      aggregated.totalInputAccuracy += dayStats.totalInputAccuracy;
      aggregated.totalOutputAccuracy += dayStats.totalOutputAccuracy;

      // Merge by model
      for (const [model, modelStats] of Object.entries(dayStats.byModel)) {
        if (!aggregated.byModel[model]) {
          aggregated.byModel[model] = {
            requests: 0,
            inputTokens: 0,
            outputTokens: 0,
            costCredits: 0,
          };
        }
        aggregated.byModel[model].requests += modelStats.requests;
        aggregated.byModel[model].inputTokens += modelStats.inputTokens;
        aggregated.byModel[model].outputTokens += modelStats.outputTokens;
        aggregated.byModel[model].costCredits += modelStats.costCredits;
      }
    }
  }

  // Calculate averages
  const reqCount = aggregated.totalRequests || 1;

  return {
    period,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    totalRequests: aggregated.totalRequests,
    successfulRequests: aggregated.successfulRequests,
    failedRequests: aggregated.failedRequests,
    totalInputTokens: aggregated.totalInputTokens,
    totalOutputTokens: aggregated.totalOutputTokens,
    totalTokens: aggregated.totalTokens,
    totalCachedTokens: aggregated.totalCachedTokens,
    totalReasoningTokens: aggregated.totalReasoningTokens,
    totalCostUsd: Math.round(aggregated.totalCostUsd * 10000) / 10000,
    totalCreditsSpent: aggregated.totalCreditsSpent,
    avgInputTokens: Math.round(aggregated.totalInputTokens / reqCount),
    avgOutputTokens: Math.round(aggregated.totalOutputTokens / reqCount),
    avgCostCredits: Math.round((aggregated.totalCreditsSpent / reqCount) * 100) / 100,
    avgProcessingTimeMs: Math.round(aggregated.totalProcessingTimeMs / reqCount),
    byModel: aggregated.byModel,
    avgInputAccuracy:
      aggregated.estimationSamples > 0
        ? Math.round((aggregated.totalInputAccuracy / aggregated.estimationSamples) * 100) / 100
        : 0,
    avgOutputAccuracy:
      aggregated.estimationSamples > 0
        ? Math.round((aggregated.totalOutputAccuracy / aggregated.estimationSamples) * 100) / 100
        : 0,
  };
}

/**
 * Get recent usage summary (quick overview)
 */
export async function getUsageSummary(walletAddress: string): Promise<{
  today: { requests: number; tokens: number; credits: number };
  thisWeek: { requests: number; tokens: number; credits: number };
  thisMonth: { requests: number; tokens: number; credits: number };
}> {
  const [dayStats, weekStats, monthStats] = await Promise.all([
    getUsageStats(walletAddress, 'day'),
    getUsageStats(walletAddress, 'week'),
    getUsageStats(walletAddress, 'month'),
  ]);

  return {
    today: {
      requests: dayStats.totalRequests,
      tokens: dayStats.totalTokens,
      credits: dayStats.totalCreditsSpent,
    },
    thisWeek: {
      requests: weekStats.totalRequests,
      tokens: weekStats.totalTokens,
      credits: weekStats.totalCreditsSpent,
    },
    thisMonth: {
      requests: monthStats.totalRequests,
      tokens: monthStats.totalTokens,
      credits: monthStats.totalCreditsSpent,
    },
  };
}
