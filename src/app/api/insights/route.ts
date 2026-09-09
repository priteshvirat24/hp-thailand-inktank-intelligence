/**
 * Authoritative Insights & Recommendations API Endpoint
 * GET /api/insights
 * 
 * Query Params:
 * - month: '2026-06' | '2026-07' | '2026-08' | 'ALL'
 * - brand: 'HP' | 'Epson' | 'Canon' | 'Brother' | 'All'
 * - limit: number (default 5, max 5)
 */

import { NextRequest, NextResponse } from 'next/server';
import { insightEngine } from '@/services/insights/insightEngine';
import { AnalyticalMonth } from '@/types/analytics';
import { TargetBrand } from '@/types/brands';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get('month');
    const brandParam = searchParams.get('brand');
    const limitParam = searchParams.get('limit');

    const month = (monthParam && ['2026-06', '2026-07', '2026-08', 'ALL'].includes(monthParam)
      ? monthParam
      : 'ALL') as AnalyticalMonth;

    const brand = (brandParam && ['HP', 'Epson', 'Canon', 'Brother', 'All'].includes(brandParam)
      ? brandParam
      : 'All') as TargetBrand | 'All';

    const limit = limitParam ? Math.min(5, Math.max(1, parseInt(limitParam, 10))) : 5;

    const insights = insightEngine.generateInsights({
      month,
      brand,
      limit,
    });

    return NextResponse.json(
      {
        month,
        brand,
        count: insights.length,
        total: insights.length,
        insights,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate authoritative executive insights',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
