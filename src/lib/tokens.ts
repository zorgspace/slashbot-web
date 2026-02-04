/**
 * Token Counting Utilities
 * Uses proper tokenizer for accurate LLM token counting
 */

import { encode } from 'gpt-tokenizer';

/**
 * Token count result with breakdown
 */
export interface TokenCountResult {
  total: number;
  text: number;
  images: number;
  overhead: number;
}

/**
 * Token usage from API response
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens?: number;
  reasoningTokens?: number;
}

/**
 * Detailed token breakdown for billing
 */
export interface DetailedTokenUsage extends TokenUsage {
  inputBreakdown?: {
    text: number;
    images: number;
    system: number;
    cached: number;
  };
  outputBreakdown?: {
    text: number;
    reasoning: number;
  };
  estimatedVsActual?: {
    estimatedInput: number;
    actualInput: number;
    estimatedOutput: number;
    actualOutput: number;
    accuracy: number;
  };
}

/**
 * Image size categories and their token costs
 * Based on OpenAI/xAI vision model token pricing
 */
const IMAGE_TOKEN_COSTS = {
  // Low detail: fixed 85 tokens
  low: 85,
  // High detail: base + tiles
  high: {
    base: 85,
    perTile: 170,
    tileSize: 512,
    maxDimension: 2048,
  },
};

/**
 * Count tokens using proper BPE tokenizer
 */
export function countTokens(text: string): number {
  if (!text) return 0;
  try {
    return encode(text).length;
  } catch {
    // Fallback to estimate if tokenizer fails
    return Math.ceil(text.length / 4);
  }
}

/**
 * Estimate token cost for an image based on dimensions
 */
export function countImageTokens(
  width?: number,
  height?: number,
  detail: 'low' | 'high' | 'auto' = 'auto'
): number {
  // Default to high detail estimate if no dimensions
  if (!width || !height) {
    return IMAGE_TOKEN_COSTS.high.base + IMAGE_TOKEN_COSTS.high.perTile * 4;
  }

  // Low detail mode
  if (detail === 'low') {
    return IMAGE_TOKEN_COSTS.low;
  }

  // Auto or high detail - calculate based on tiles
  const { base, perTile, tileSize, maxDimension } = IMAGE_TOKEN_COSTS.high;

  // Scale down if larger than max dimension
  let scaledWidth = width;
  let scaledHeight = height;

  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    scaledWidth = Math.floor(width * scale);
    scaledHeight = Math.floor(height * scale);
  }

  // Further scale to fit within 768px on shortest side
  const shortSide = Math.min(scaledWidth, scaledHeight);
  if (shortSide > 768) {
    const scale = 768 / shortSide;
    scaledWidth = Math.floor(scaledWidth * scale);
    scaledHeight = Math.floor(scaledHeight * scale);
  }

  // Calculate number of tiles
  const tilesWide = Math.ceil(scaledWidth / tileSize);
  const tilesHigh = Math.ceil(scaledHeight / tileSize);
  const totalTiles = tilesWide * tilesHigh;

  return base + perTile * totalTiles;
}

/**
 * Message content part types
 */
interface TextPart {
  type: 'text';
  text: string;
}

interface ImagePart {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

type ContentPart = TextPart | ImagePart | { type: string; [key: string]: unknown };

interface Message {
  role: string;
  content: string | ContentPart[];
  name?: string;
}

/**
 * Count tokens for an array of chat messages with detailed breakdown
 */
export function countMessageTokens(messages: Message[]): TokenCountResult {
  let textTokens = 0;
  let imageTokens = 0;
  let overheadTokens = 0;

  for (const message of messages) {
    // Message overhead (role, formatting)
    overheadTokens += 4;

    // Add name tokens if present
    if (message.name) {
      textTokens += countTokens(message.name);
      overheadTokens += 1; // name separator
    }

    if (typeof message.content === 'string') {
      textTokens += countTokens(message.content);
    } else if (Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === 'text' && 'text' in part) {
          textTokens += countTokens(part.text as string);
        } else if (part.type === 'image_url' && 'image_url' in part) {
          const imgPart = part as ImagePart;
          imageTokens += countImageTokens(
            undefined,
            undefined,
            imgPart.image_url?.detail || 'auto'
          );
        }
      }
    }
  }

  // Conversation footer overhead
  overheadTokens += 3;

  return {
    total: textTokens + imageTokens + overheadTokens,
    text: textTokens,
    images: imageTokens,
    overhead: overheadTokens,
  };
}

/**
 * Simple token count (total only, for backward compatibility)
 */
export function countMessageTokensSimple(messages: Message[]): number {
  return countMessageTokens(messages).total;
}

/**
 * Parse detailed usage from API response
 */
export function parseUsageFromResponse(response: {
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    prompt_tokens_details?: {
      cached_tokens?: number;
      audio_tokens?: number;
    };
    completion_tokens_details?: {
      reasoning_tokens?: number;
      audio_tokens?: number;
    };
  };
}): TokenUsage | null {
  if (!response.usage) return null;

  const usage = response.usage;

  return {
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    totalTokens: usage.total_tokens || 0,
    cachedTokens: usage.prompt_tokens_details?.cached_tokens,
    reasoningTokens: usage.completion_tokens_details?.reasoning_tokens,
  };
}

/**
 * Streaming token counter with accumulation
 */
export class StreamingTokenCounter {
  private chunks: string[] = [];
  private inputTokens: number;
  private inputBreakdown: TokenCountResult;

  constructor(inputTokens: number, inputBreakdown?: TokenCountResult) {
    this.inputTokens = inputTokens;
    this.inputBreakdown = inputBreakdown || {
      total: inputTokens,
      text: inputTokens,
      images: 0,
      overhead: 0,
    };
  }

  addChunk(content: string): void {
    this.chunks.push(content);
  }

  getCompletionText(): string {
    return this.chunks.join('');
  }

  getUsage(): TokenUsage {
    const completionText = this.getCompletionText();
    const completionTokens = countTokens(completionText);

    return {
      promptTokens: this.inputTokens,
      completionTokens,
      totalTokens: this.inputTokens + completionTokens,
    };
  }

  getDetailedUsage(): DetailedTokenUsage {
    const baseUsage = this.getUsage();

    return {
      ...baseUsage,
      inputBreakdown: {
        text: this.inputBreakdown.text,
        images: this.inputBreakdown.images,
        system: this.inputBreakdown.overhead,
        cached: 0,
      },
      outputBreakdown: {
        text: baseUsage.completionTokens,
        reasoning: 0,
      },
    };
  }
}

/**
 * Estimate output tokens based on input and model type
 */
export function estimateOutputTokens(
  inputTokens: number,
  model: string,
  maxTokens?: number
): number {
  // Reasoning models tend to generate more tokens
  const isReasoningModel = model.includes('reasoning') || model.includes('grok-3');

  // Base estimate ratios
  const baseRatio = isReasoningModel ? 2.0 : 1.0;
  const estimated = Math.ceil(inputTokens * baseRatio);

  // Cap at common defaults
  const defaultMax = isReasoningModel ? 4096 : 2048;
  const cappedEstimate = Math.min(estimated, maxTokens || defaultMax);

  // Minimum reasonable output
  return Math.max(cappedEstimate, 100);
}

/**
 * Calculate estimation accuracy
 */
export function calculateAccuracy(estimated: number, actual: number): number {
  if (actual === 0) return estimated === 0 ? 100 : 0;
  const diff = Math.abs(estimated - actual);
  const accuracy = Math.max(0, 100 - (diff / actual) * 100);
  return Math.round(accuracy * 100) / 100;
}
