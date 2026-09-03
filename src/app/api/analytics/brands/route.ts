/**
 * Brand Comparison Analytics API Endpoint
 * GET /api/analytics/brands
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics/analyticsService';
import { MetricId, AnalyticalMonth } from '@/types/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const metricId = (searchParams.get('metric') || 'TOTAL_VISIBILITY_TOUCHPOINTS') as MetricId;
    const month = (searchParams.get('month') || '2026-08') as AnalyticalMonth;

    const comparison = analyticsService.getBrandComparison(metricId, month);
    return NextResponse.json({ metric_id: metricId, month, comparison }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve brand comparison analytics',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
