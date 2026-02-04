/**
 * Grok API Proxy
 * Proxies requests to xAI with:
 * - Wallet signature authentication
 * - Balance verification before requests
 * - Accurate token counting with proper tokenizer
 * - Detailed billing with cost breakdown
 * - Usage tracking and analytics
 * - Multiple API key rotation for rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyManager } from '@/lib/apiKeys';
import {
  countMessageTokens,
  StreamingTokenCounter,
  parseUsageFromResponse,
  TokenCountResult,
  TokenUsage,
  Message,
} from '@/lib/tokens';
import { verifyBalance, deductCredits, isValidWalletAddress } from '@/lib/balance';
import {
  calculateCost,
  estimateCost,
  fetchExchangeRates,
  getPricingTable,
  formatCost,
  formatTokens,
  getCreditsPerUsd,
  ApiCallCost,
} from '@/lib/pricing';
import { authenticateRequest } from '@/lib/auth';
import { recordUsage } from '@/lib/usage';

const XAI_BASE_URL = 'https://api.x.ai/v1';

/** Available models for selection */
const AVAILABLE_MODELS = [
  'grok-4-1-fast-reasoning',
  'grok-4-1-fast-non-reasoning',
  'grok-code-fast-1',
  // Note: grok-2 and grok-3 models are disabled
];

/** Default model if not specified */
const DEFAULT_MODEL = 'grok-4-1-fast-reasoning';

interface ChatRequest {
  model?: string;
  messages: Message[];
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  wallet_address?: string; // Legacy, prefer auth headers
  [key: string]: unknown;
}

/**
 * Validate and normalize the request model
 */
function normalizeModel(requestedModel?: string): string {
  if (!requestedModel) return DEFAULT_MODEL;

  if (AVAILABLE_MODELS.includes(requestedModel)) {
    return requestedModel;
  }

  const match = AVAILABLE_MODELS.find(
    (m) =>
      requestedModel.toLowerCase().includes(m.toLowerCase()) ||
      m.toLowerCase().includes(requestedModel.toLowerCase())
  );

  return match || DEFAULT_MODEL;
}

/**
 * POST /api/grok - Proxy chat completions with wallet authentication
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Clone request to read body for hash verification
    const bodyText = await request.text();
    let body: ChatRequest;
    try {
      body = JSON.parse(bodyText) as ChatRequest;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { messages, stream = false, max_tokens } = body;

    // Authenticate request using wallet signature (REQUIRED - no legacy mode)
    const auth = authenticateRequest(request.headers, bodyText);

    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || 'Wallet signature authentication required' },
        { status: 401 }
      );
    }

    const walletAddress = auth.walletAddress!;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Normalize model
    const model = normalizeModel(body.model);

    // Count input tokens with detailed breakdown
    const inputTokenBreakdown = countMessageTokens(messages);
    const inputTokens = inputTokenBreakdown.total;

    // Estimate cost for balance check
    const estimate = await estimateCost(model, inputTokens, undefined, max_tokens);

    // Verify balance
    const balanceCheck = await verifyBalance(walletAddress, estimate.credits);
    if (!balanceCheck.sufficient) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          details: {
            currentBalance: balanceCheck.currentBalance,
            estimatedCost: balanceCheck.estimatedCost,
            shortfall: balanceCheck.shortfall,
            estimatedTokens: {
              input: inputTokens,
              estimatedOutput: estimate.estimatedOutputTokens,
            },
          },
        },
        { status: 402 } // Payment Required
      );
    }

    // Get an available API key
    const apiKeyManager = getApiKeyManager();
    const apiKey = apiKeyManager.getNextKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable - all API keys at capacity' },
        { status: 503 }
      );
    }

    // Prepare request to xAI
    const xaiRequest = {
      ...body,
      model,
      stream,
    };
    // Remove our custom fields
    delete xaiRequest.wallet_address;

    // Make request to xAI
    const xaiResponse = await fetch(`${XAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(xaiRequest),
    });

    // Handle rate limit
    if (xaiResponse.status === 429) {
      apiKeyManager.recordRateLimit(apiKey);

      // Try another key
      const retryKey = apiKeyManager.getNextKey();
      if (retryKey && retryKey !== apiKey) {
        const retryResponse = await fetch(`${XAI_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${retryKey}`,
          },
          body: JSON.stringify(xaiRequest),
        });

        if (retryResponse.ok) {
          apiKeyManager.recordSuccess(retryKey);
          return handleXaiResponse(
            retryResponse,
            stream,
            walletAddress,
            model,
            inputTokenBreakdown,
            estimate,
            startTime
          );
        }
      }

      return NextResponse.json({ error: 'Rate limited - please try again shortly' }, { status: 429 });
    }

    // Handle other errors
    if (!xaiResponse.ok) {
      apiKeyManager.recordError(apiKey);
      const errorBody = await xaiResponse.text();
      console.error(`[Grok Proxy] xAI error ${xaiResponse.status}:`, errorBody);
      return NextResponse.json(
        { error: 'Upstream API error', status: xaiResponse.status },
        { status: xaiResponse.status }
      );
    }

    // Record success
    apiKeyManager.recordSuccess(apiKey);

    // Handle response
    return handleXaiResponse(
      xaiResponse,
      stream,
      walletAddress,
      model,
      inputTokenBreakdown,
      estimate,
      startTime
    );
  } catch (error) {
    console.error('[Grok Proxy] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handle xAI response (streaming or non-streaming)
 */
async function handleXaiResponse(
  xaiResponse: Response,
  stream: boolean,
  walletAddress: string,
  model: string,
  inputBreakdown: TokenCountResult,
  estimate: { credits: number; estimatedOutputTokens: number },
  startTime: number
): Promise<NextResponse | Response> {
  if (stream) {
    return handleStreamingResponse(xaiResponse, walletAddress, model, inputBreakdown, estimate, startTime);
  } else {
    return handleNonStreamingResponse(xaiResponse, walletAddress, model, inputBreakdown, estimate, startTime);
  }
}

/**
 * Handle non-streaming response
 */
async function handleNonStreamingResponse(
  xaiResponse: Response,
  walletAddress: string,
  model: string,
  inputBreakdown: TokenCountResult,
  estimate: { credits: number; estimatedOutputTokens: number },
  startTime: number
): Promise<NextResponse> {
  const data = await xaiResponse.json();
  const processingTime = Date.now() - startTime;

  // Get actual token usage from response
  const usage = parseUsageFromResponse(data);
  const actualInputTokens = usage?.promptTokens || inputBreakdown.total;
  const outputTokens = usage?.completionTokens || 0;
  const cachedTokens = usage?.cachedTokens || 0;
  const reasoningTokens = usage?.reasoningTokens || 0;

  // Calculate actual cost with full details
  const cost = await calculateCost(model, actualInputTokens, outputTokens, {
    cachedTokens,
    reasoningTokens,
  });

  // Deduct credits
  const deducted = await deductCredits(walletAddress, cost.credits, `grok-${model}`);

  if (!deducted) {
    console.error(`[Grok Proxy] Failed to deduct credits for ${walletAddress}`);
  }

  // Record usage for analytics
  await recordUsage({
    walletAddress,
    model,
    endpoint: '/api/grok',
    streaming: false,
    usage: usage || {
      promptTokens: actualInputTokens,
      completionTokens: outputTokens,
      totalTokens: actualInputTokens + outputTokens,
      cachedTokens,
      reasoningTokens,
    },
    cost,
    estimation: {
      estimatedInput: inputBreakdown.total,
      estimatedOutput: estimate.estimatedOutputTokens,
    },
    processingTimeMs: processingTime,
    success: true,
  });

  // Build detailed billing response
  const responseWithBilling = {
    ...data,
    billing: {
      // Token summary
      tokens: {
        input: actualInputTokens,
        output: outputTokens,
        total: actualInputTokens + outputTokens,
        cached: cachedTokens,
        reasoning: reasoningTokens,
      },
      // Token breakdown
      inputBreakdown: {
        text: inputBreakdown.text,
        images: inputBreakdown.images,
        overhead: inputBreakdown.overhead,
      },
      // Cost summary
      cost: {
        credits: cost.credits,
        usd: cost.usd,
        formatted: formatCost(cost),
      },
      // Detailed cost breakdown
      costBreakdown: cost.breakdown,
      // Pricing used
      pricing: cost.pricing,
      // Estimation accuracy
      estimation: {
        estimatedInput: inputBreakdown.total,
        actualInput: actualInputTokens,
        estimatedOutput: estimate.estimatedOutputTokens,
        actualOutput: outputTokens,
        inputAccuracy:
          actualInputTokens > 0
            ? Math.round((1 - Math.abs(inputBreakdown.total - actualInputTokens) / actualInputTokens) * 100)
            : 100,
        outputAccuracy:
          outputTokens > 0
            ? Math.round(
                (1 - Math.abs(estimate.estimatedOutputTokens - outputTokens) / outputTokens) * 100
              )
            : 100,
      },
      // Metadata
      model,
      processingTimeMs: processingTime,
    },
  };

  return NextResponse.json(responseWithBilling);
}

/**
 * Handle streaming response
 */
async function handleStreamingResponse(
  xaiResponse: Response,
  walletAddress: string,
  model: string,
  inputBreakdown: TokenCountResult,
  estimate: { credits: number; estimatedOutputTokens: number },
  startTime: number
): Promise<Response> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const tokenCounter = new StreamingTokenCounter(inputBreakdown.total, inputBreakdown);

  let lastUsage: TokenUsage | null = null;

  const transformStream = new TransformStream({
    async transform(chunk, controller) {
      const text = decoder.decode(chunk);

      // Parse SSE events to count tokens and capture usage
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              tokenCounter.addChunk(content);
            }
            // Capture usage from final chunk if available
            if (data.usage) {
              lastUsage = parseUsageFromResponse(data);
            }
          } catch {
            // Ignore parse errors for SSE
          }
        }
      }

      // Pass through to client
      controller.enqueue(chunk);
    },

    async flush(controller) {
      const processingTime = Date.now() - startTime;

      // Use actual usage from API if available, otherwise estimate
      const streamUsage = tokenCounter.getUsage();
      const usage: TokenUsage = lastUsage || streamUsage;

      // Calculate final cost
      const cost = await calculateCost(model, usage.promptTokens, usage.completionTokens, {
        cachedTokens: usage.cachedTokens,
        reasoningTokens: usage.reasoningTokens,
      });

      // Deduct credits
      const deducted = await deductCredits(walletAddress, cost.credits, `grok-${model}-stream`);

      if (!deducted) {
        console.error(`[Grok Proxy] Failed to deduct credits for ${walletAddress}`);
      }

      // Record usage for analytics
      await recordUsage({
        walletAddress,
        model,
        endpoint: '/api/grok',
        streaming: true,
        usage,
        cost,
        estimation: {
          estimatedInput: inputBreakdown.total,
          estimatedOutput: estimate.estimatedOutputTokens,
        },
        processingTimeMs: processingTime,
        success: true,
      });

      // Send final billing event with full details
      const billingEvent = {
        billing: {
          tokens: {
            input: usage.promptTokens,
            output: usage.completionTokens,
            total: usage.totalTokens,
            cached: usage.cachedTokens || 0,
            reasoning: usage.reasoningTokens || 0,
          },
          inputBreakdown: {
            text: inputBreakdown.text,
            images: inputBreakdown.images,
            overhead: inputBreakdown.overhead,
          },
          cost: {
            credits: cost.credits,
            usd: cost.usd,
            formatted: formatCost(cost),
          },
          costBreakdown: cost.breakdown,
          pricing: cost.pricing,
          estimation: {
            estimatedInput: inputBreakdown.total,
            actualInput: usage.promptTokens,
            estimatedOutput: estimate.estimatedOutputTokens,
            actualOutput: usage.completionTokens,
          },
          model,
          processingTimeMs: processingTime,
        },
      };

      controller.enqueue(encoder.encode(`data: ${JSON.stringify(billingEvent)}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    },
  });

  const body = xaiResponse.body;
  if (!body) {
    return new Response('No response body', { status: 500 });
  }

  return new Response(body.pipeThrough(transformStream), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

/**
 * GET /api/grok - Get proxy status and available models
 */
export async function GET() {
  const apiKeyManager = getApiKeyManager();
  const rates = await fetchExchangeRates();
  const pricingTable = getPricingTable();

  return NextResponse.json({
    status: 'operational',
    availableModels: AVAILABLE_MODELS,
    defaultModel: DEFAULT_MODEL,
    keyStatus: {
      totalKeys: apiKeyManager.getKeyCount(),
      hasAvailable: apiKeyManager.hasAvailableKeys(),
    },
    exchangeRates: {
      solUsd: rates.solUsd,
      slashbotSol: rates.slashbotSol,
      updatedAt: new Date(rates.updatedAt).toISOString(),
    },
    pricing: {
      creditsPerUsd: getCreditsPerUsd(rates),
      slashbotPriceUsd: rates.slashbotSol * rates.solUsd,
      models: pricingTable,
    },
    authentication: 'Wallet signature required (X-Wallet-Address, X-Wallet-Signature, X-Wallet-Timestamp)',
    features: {
      tokenCounting: 'BPE tokenizer (gpt-tokenizer)',
      usageTracking: 'Per-request tracking with analytics',
      costBreakdown: 'Input/output/cached token pricing',
    },
  });
}
