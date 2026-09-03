/**
 * Platform Breakdown Analytics API Endpoint
 * GET /api/analytics/platforms
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics/analyticsService';
import { ChannelType } from '@/types/sources';
import { AnalyticalMonth } from '@/types/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get('channel') as ChannelType | null;
    const month = (searchParams.get('month') || '2026-08') as AnalyticalMonth;

    const breakdown = analyticsService.getPlatformBreakdown(channel || undefined, month);
    return NextResponse.json({ month, count: breakdown.length, platforms: breakdown }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve platform breakdown analytics',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
