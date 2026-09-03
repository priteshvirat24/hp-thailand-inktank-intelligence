/**
 * Analytics Trends API Endpoint
 * GET /api/analytics/trends
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics/analyticsService';
import { MetricId } from '@/types/analytics';
import { TargetBrand } from '@/types/brands';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const metricId = (searchParams.get('metric') || 'TOTAL_VISIBILITY_TOUCHPOINTS') as MetricId;
    const brand = searchParams.get('brand') as TargetBrand | 'All' | null;
    const skuId = searchParams.get('sku_id') || 'All';

    const trends = analyticsService.getTrends(metricId, {
      brand: brand || 'All',
      sku_id: skuId,
    });

    return NextResponse.json({ metric_id: metricId, trends }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve analytics trends',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
