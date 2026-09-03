/**
 * Canonical SKU Comparison Analytics API Endpoint
 * GET /api/analytics/skus
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics/analyticsService';
import { TargetBrand } from '@/types/brands';
import { AnalyticalMonth } from '@/types/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get('brand') as TargetBrand | null;
    const month = (searchParams.get('month') || '2026-08') as AnalyticalMonth;

    const skus = analyticsService.getSkuComparison(brand || undefined, month);
    return NextResponse.json({ month, count: skus.length, skus }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve SKU comparison analytics',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
