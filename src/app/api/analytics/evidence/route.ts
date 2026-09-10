/**
 * Evidence Traceability Drilldown & Lake Ingestion Retrieval API Endpoint
 * GET /api/analytics/evidence
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics/analyticsService';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { MetricId, AnalyticalMonth } from '@/types/analytics';
import { TargetBrand } from '@/types/brands';
import { ALL_MARKET_SKUS } from '@/config/skus';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const metricId = searchParams.get('metric') as MetricId | 'ALL' | null;
    const brand = searchParams.get('brand') as TargetBrand | 'All' | null;
    const month = searchParams.get('month') as AnalyticalMonth | 'All' | null;
    const skuId = searchParams.get('sku_id');
    const channel = searchParams.get('channel');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSizeParam = searchParams.get('pageSize') || searchParams.get('limit');
    const allRequested = searchParams.get('all') === 'true';
    let pageSize = pageSizeParam ? Math.min(500, Math.max(1, parseInt(pageSizeParam, 10))) : 0;

    // Enforce bounded default pagination of 50 for ALL evidence queries unless all=true is explicitly requested
    if (!allRequested && pageSize === 0 && (!metricId || metricId === 'ALL')) {
      pageSize = 50;
    }

    let evidence = [];

    // Find canonical SKU definition if skuId provided
    const targetSku = skuId && skuId !== 'All'
      ? ALL_MARKET_SKUS.find(
          (s) =>
            s.sku_id.toLowerCase() === skuId.toLowerCase() ||
            s.model_name.toLowerCase() === skuId.toLowerCase()
        )
      : null;

    if (!metricId || metricId === 'ALL') {
      evidence = globalEvidenceStore.getAll();
      if (brand && brand !== 'All') {
        evidence = evidence.filter((r) => r.brand === brand);
      }
      const isAllMonths = !month || month.toUpperCase() === 'ALL' || month === 'All';
      if (!isAllMonths) {
        evidence = evidence.filter((r) => r.published_at.startsWith(month));
      }
      if (channel && channel !== 'All') {
        evidence = evidence.filter((r) => r.channel.toLowerCase() === channel.toLowerCase());
      }
      if (skuId && skuId !== 'All') {
        evidence = evidence.filter((r) => {
          if (!r.product_sku) return false;
          if (targetSku) {
            return (
              r.product_sku.toLowerCase() === targetSku.model_name.toLowerCase() ||
              r.product_sku.toLowerCase() === targetSku.sku_id.toLowerCase() ||
              targetSku.aliases.some((a) => a.toLowerCase() === r.product_sku?.toLowerCase())
            );
          }
          return r.product_sku.toLowerCase() === skuId.toLowerCase();
        });
      }
    } else {
      evidence = analyticsService.getEvidenceForMetric(metricId, {
        brand: brand || 'All',
        month: month || 'All',
        sku_id: skuId || 'All',
      });

      // If cube-backed lookup returned no direct link but targetSku is valid, fallback to direct evidence filter
      if (evidence.length === 0 && targetSku) {
        const allEv = globalEvidenceStore.getAll();
        evidence = allEv.filter((r) => {
          const matchBrand = !brand || brand === 'All' || r.brand === brand;
          const matchMonth = !month || month.toUpperCase() === 'ALL' || r.published_at.startsWith(month);
          const matchSku =
            r.product_sku?.toLowerCase() === targetSku.model_name.toLowerCase() ||
            r.product_sku?.toLowerCase() === targetSku.sku_id.toLowerCase();
          return matchBrand && matchMonth && matchSku;
        });
      }
    }

    const total = evidence.length;
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;
    const paginatedEvidence =
      pageSize > 0 ? evidence.slice((page - 1) * pageSize, page * pageSize) : evidence;

    return NextResponse.json(
      {
        metric_id: metricId || 'ALL',
        brand: brand || 'All',
        month: month || 'All',
        sku_id: skuId || 'All',
        count: total,
        total,
        page,
        pageSize: pageSize > 0 ? pageSize : total,
        totalPages,
        hasNext: pageSize > 0 ? page < totalPages : false,
        hasPrevious: pageSize > 0 ? page > 1 : false,
        evidence: paginatedEvidence,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve evidence records for metric',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
