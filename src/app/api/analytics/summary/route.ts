/**
 * Executive Analytics Summary API Endpoint
 * GET /api/analytics/summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics/analyticsService';
import { AnalyticalMonth } from '@/types/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = (searchParams.get('month') || '2026-08') as AnalyticalMonth;
    const brand = (searchParams.get('brand') || 'All') as import('@/types/brands').TargetBrand | 'All';

    const summary = analyticsService.getExecutiveOverview(month, brand);
    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve executive analytics summary',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
