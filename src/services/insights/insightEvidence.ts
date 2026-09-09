/**
 * Evidence Lineage and Data-Cut Aggregation Module for Insight Engine
 * Maps Analytical Cube rows and raw Evidence Lake observations to Insights.
 */

import { TargetBrand } from '@/types/brands';
import { AnalyticalMonth, MetricId } from '@/types/analytics';
import { RawEvidenceRecord } from '@/types/evidence';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { analyticsService } from '@/services/analytics/analyticsService';
import { METRIC_DEFINITIONS } from '@/services/analytics/metricRegistry';
import {
  DataCut,
  SupportingMetricSnapshot,
  InsightSourceLink,
} from './insightTypes';

export class InsightEvidenceResolver {
  /**
   * Retrieves supporting metric snapshots from the Analytical Cube
   */
  public getMetricSnapshots(
    metricIds: readonly MetricId[],
    month: AnalyticalMonth,
    brand?: TargetBrand
  ): SupportingMetricSnapshot[] {
    const results: SupportingMetricSnapshot[] = [];
    const brandsToQuery: TargetBrand[] = brand ? [brand] : ['HP', 'Epson', 'Canon', 'Brother'];

    for (const mId of metricIds) {
      const def = METRIC_DEFINITIONS[mId];
      if (!def) continue;

      for (const b of brandsToQuery) {
        const row = analyticsService.getMetricValue(mId, {
          brand: b,
          month: month === 'ALL' ? '2026-08' : month,
          sku_id: 'All',
        });

        if (row && row.data_state === 'OBSERVED') {
          results.push({
            metric_id: mId,
            metric_name: def.name,
            brand: b,
            value: row.metric_value,
            unit: def.unit,
            observation_count: row.observation_count,
          });
        }
      }
    }

    return results;
  }

  /**
   * Resolves raw evidence records and extracts source links with verified URLs
   */
  public resolveEvidenceSources(
    evidenceIds: readonly string[],
    limit = 6
  ): { records: RawEvidenceRecord[]; sourceLinks: InsightSourceLink[] } {
    const records: RawEvidenceRecord[] = [];
    const sourceLinks: InsightSourceLink[] = [];
    const seenUrls = new Set<string>();

    for (const eid of evidenceIds) {
      const rec = globalEvidenceStore.getById(eid);
      if (rec) {
        records.push(rec);
        if (rec.source_url && !seenUrls.has(rec.source_url)) {
          seenUrls.add(rec.source_url);
          sourceLinks.push({
            label: `${rec.brand} ${rec.product_sku || rec.activity_type} (${rec.platform})`,
            url: rec.source_url,
            platform: rec.platform,
            evidence_id: rec.evidence_id,
          });
        }
      }
      if (records.length >= limit) break;
    }

    return { records, sourceLinks };
  }

  /**
   * Audits evidence presence for a specific Data Cut and Month
   */
  public checkDataCutSufficiency(
    dataCut: DataCut,
    month: AnalyticalMonth,
    brand?: TargetBrand | 'All'
  ): { hasData: boolean; count: number } {
    const all = globalEvidenceStore.getAll();
    let filtered = all;

    if (month !== 'ALL') {
      filtered = filtered.filter((r) => r.published_at.startsWith(month));
    }

    if (brand && brand !== 'All') {
      filtered = filtered.filter((r) => r.brand === brand);
    }

    switch (dataCut) {
      case 'Online Visibility / SOV':
        return { hasData: filtered.length > 0, count: filtered.length };
      case 'Advertising / Creatives': {
        const ads = filtered.filter((r) => r.channel === 'Paid Media');
        return { hasData: ads.length > 0, count: ads.length };
      }
      case 'Social Media Activity': {
        const social = filtered.filter((r) => r.channel === 'Social');
        return { hasData: social.length > 0, count: social.length };
      }
      case 'E-commerce Presence, Pricing, Promotions & Traction': {
        const ecom = filtered.filter((r) => r.channel === 'E-commerce');
        return { hasData: ecom.length > 0, count: ecom.length };
      }
      case 'Consumer Sentiment / Recommendation': {
        const reviews = filtered.filter((r) => r.channel === 'Consumer Review');
        return { hasData: reviews.length > 0, count: reviews.length };
      }
      default:
        return { hasData: false, count: 0 };
    }
  }
}

export const insightEvidenceResolver = new InsightEvidenceResolver();
