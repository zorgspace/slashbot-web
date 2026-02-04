/**
 * Usage API
 * Endpoints for retrieving usage history and statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { isValidWalletAddress } from '@/lib/balance';
import {
  getUsageHistory,
  getUsageStats,
  getUsageSummary,
} from '@/lib/usage';

/**
 * GET /api/usage - Get usage information
 *
 * Query parameters:
 * - wallet: Wallet address (required unless authenticated)
 * - type: 'history' | 'stats' | 'summary' (default: 'summary')
 * - period: 'day' | 'week' | 'month' | 'all' (for stats, default: 'month')
 * - limit: Number of records (for history, default: 50, max: 100)
 * - offset: Offset for pagination (for history, default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletParam = searchParams.get('wallet');
    const type = searchParams.get('type') || 'summary';
    const period = (searchParams.get('period') || 'month') as 'day' | 'week' | 'month' | 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Try to authenticate via headers first
    const auth = authenticateRequest(request.headers, '');
    let walletAddress = walletParam;

    if (auth.authenticated && auth.walletAddress) {
      // Use authenticated wallet if no wallet param or if they match
      if (!walletParam || walletParam === auth.walletAddress) {
        walletAddress = auth.walletAddress;
      } else {
        // User trying to access another wallet's data
        return NextResponse.json(
          { error: 'Cannot access usage data for other wallets' },
          { status: 403 }
        );
      }
    }

    // Require wallet address
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required (provide wallet query param or authenticate)' },
        { status: 400 }
      );
    }

    // Validate wallet address
    if (!isValidWalletAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Handle different types of requests
    switch (type) {
      case 'history': {
        const { records, total } = await getUsageHistory(walletAddress, limit, offset);
        return NextResponse.json({
          walletAddress,
          type: 'history',
          records,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + records.length < total,
          },
        });
      }

      case 'stats': {
        const stats = await getUsageStats(walletAddress, period);
        return NextResponse.json({
          walletAddress,
          type: 'stats',
          ...stats,
        });
      }

      case 'summary':
      default: {
        const summary = await getUsageSummary(walletAddress);
        return NextResponse.json({
          walletAddress,
          type: 'summary',
          ...summary,
        });
      }
    }
  } catch (error) {
    console.error('[Usage API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve usage data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/usage/export - Export usage data
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const auth = authenticateRequest(request.headers, bodyText);

    if (!auth.authenticated || !auth.walletAddress) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let body: { format?: string; period?: string };
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = {};
    }

    const format = body.format || 'json';
    const period = (body.period || 'month') as 'day' | 'week' | 'month' | 'all';

    // Get full stats
    const [stats, { records }] = await Promise.all([
      getUsageStats(auth.walletAddress, period),
      getUsageHistory(auth.walletAddress, 1000, 0),
    ]);

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Timestamp',
        'Model',
        'Input Tokens',
        'Output Tokens',
        'Total Tokens',
        'Cached Tokens',
        'Reasoning Tokens',
        'Cost (USD)',
        'Cost (Credits)',
        'Processing Time (ms)',
        'Success',
      ];

      const rows = records.map((r) => [
        r.timestamp,
        r.model,
        r.tokens.input,
        r.tokens.output,
        r.tokens.total,
        r.tokens.cached || 0,
        r.tokens.reasoning || 0,
        r.cost.usd.toFixed(6),
        r.cost.credits,
        r.processingTimeMs,
        r.success ? 'Yes' : 'No',
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="usage-${auth.walletAddress.slice(0, 8)}-${period}.csv"`,
        },
      });
    }

    // JSON export
    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      walletAddress: auth.walletAddress,
      period,
      stats,
      records,
    });
  } catch (error) {
    console.error('[Usage API] Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export usage data' },
      { status: 500 }
    );
  }
}
