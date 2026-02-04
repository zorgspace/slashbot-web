/**
 * Exchange Rates API
 * Manages SLASHBOT token exchange rate caching
 * Rates are refreshed every 15 minutes
 *
 * Endpoints:
 * - GET /api/rates - Get current exchange rates
 * - POST /api/rates - Force refresh exchange rates (for cron jobs)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchExchangeRates,
  getCachedExchangeRates,
  refreshExchangeRates,
  getCreditsPerUsd,
  ExchangeRates,
} from '@/lib/pricing';
import { EXCHANGE_RATE_CACHE_TTL, SLASHBOT_TOKEN_MINT } from '@/lib/constants';

/**
 * GET /api/rates
 * Returns current exchange rates (from cache if available)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    let rates: ExchangeRates;

    if (forceRefresh) {
      rates = await refreshExchangeRates();
    } else {
      rates = await fetchExchangeRates();
    }

    const cacheAge = Date.now() - rates.updatedAt;
    const nextRefresh = Math.max(0, EXCHANGE_RATE_CACHE_TTL - cacheAge);

    return NextResponse.json({
      success: true,
      rates: {
        solUsd: rates.solUsd,
        slashbotSol: rates.slashbotSol,
        slashbotUsd: rates.slashbotSol * rates.solUsd,
        creditsPerUsd: getCreditsPerUsd(rates),
      },
      meta: {
        tokenMint: SLASHBOT_TOKEN_MINT,
        updatedAt: new Date(rates.updatedAt).toISOString(),
        cacheAgeMs: cacheAge,
        nextRefreshMs: nextRefresh,
        cacheTtlMs: EXCHANGE_RATE_CACHE_TTL,
      },
    });
  } catch (error) {
    console.error('[Rates API] Error fetching rates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch exchange rates',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rates
 * Force refresh exchange rates (called by Vercel cron every 15 minutes)
 *
 * Vercel cron will call this endpoint with:
 * Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Rates API] Unauthorized cron refresh attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Rates API] Cron job triggered - refreshing exchange rates...');

    const rates = await refreshExchangeRates();

    console.log(
      `[Rates API] Rates refreshed: SOL=$${rates.solUsd.toFixed(2)}, SLASHBOT=${rates.slashbotSol.toFixed(9)} SOL`
    );

    return NextResponse.json({
      success: true,
      message: 'Exchange rates refreshed',
      rates: {
        solUsd: rates.solUsd,
        slashbotSol: rates.slashbotSol,
        slashbotUsd: rates.slashbotSol * rates.solUsd,
        creditsPerUsd: getCreditsPerUsd(rates),
      },
      updatedAt: new Date(rates.updatedAt).toISOString(),
    });
  } catch (error) {
    console.error('[Rates API] Error refreshing rates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh exchange rates',
      },
      { status: 500 }
    );
  }
}
