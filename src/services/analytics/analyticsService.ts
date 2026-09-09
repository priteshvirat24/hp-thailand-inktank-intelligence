/**
 * Authoritative Analytics Service
 * 
 * Provides fast, typed query APIs over the Analytical Metric Cube and synchronizes
 * seamlessly with the underlying Idempotent Evidence Lake.
 */

import {
  AnalyticalMetricRow,
  AnalyticsFilter,
  AnalyticalMonth,
  MetricId,
  MonthlyTrendPoint,
  BrandComparisonRecord,
  SkuComparisonRecord,
  PlatformBreakdownRecord,
  ExecutiveOverviewData,
} from '@/types/analytics';
import { TargetBrand } from '@/types/brands';
import { ChannelType, PlatformType } from '@/types/sources';
import { RawEvidenceRecord } from '@/types/evidence';
import { TARGET_BRANDS } from '@/config/brands';
import { CANONICAL_SKUS, ALL_MARKET_SKUS } from '@/config/skus';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { metricAggregator } from './metricAggregator';
import { METRIC_DEFINITIONS } from './metricRegistry';

export class AnalyticsService {
  private cubeCache: AnalyticalMetricRow[] | null = null;

  /**
   * Rebuilds the analytical cube deterministically from all records currently in the Evidence Store.
   */
  public rebuildAnalyticsFromEvidence(): AnalyticalMetricRow[] {
    const allEvidence = globalEvidenceStore.getAll();
    this.cubeCache = metricAggregator.aggregate(allEvidence);
    return this.cubeCache;
  }

  /**
   * Updates the cube cache with newly added evidence records.
   */
  public updateAnalyticsFromEvidence(newRecords: readonly RawEvidenceRecord[]): AnalyticalMetricRow[] {
    globalEvidenceStore.insertBatch(newRecords);
    return this.rebuildAnalyticsFromEvidence();
  }

  /**
   * Ensures the cube is built and returns the full cached cube.
   */
  public getCube(): AnalyticalMetricRow[] {
    if (!this.cubeCache) {
      this.rebuildAnalyticsFromEvidence();
    }
    return this.cubeCache || [];
  }

  /**
   * Queries metric rows matching multi-dimensional filters.
   */
  public getMetricRows(filters?: AnalyticsFilter): AnalyticalMetricRow[] {
    let rows = this.getCube();

    if (!filters) return rows;

    if (filters.brand && filters.brand !== 'All') {
      rows = rows.filter((r) => r.brand === filters.brand);
    }
    if (filters.month && filters.month !== 'All') {
      rows = rows.filter((r) => r.analytical_month === filters.month);
    }
    if (filters.channel && filters.channel !== 'All') {
      rows = rows.filter((r) => r.channel === filters.channel);
    }
    if (filters.platform && filters.platform !== 'All') {
      rows = rows.filter((r) => r.platform === filters.platform);
    }
    if (filters.sku_id && filters.sku_id !== 'All') {
      rows = rows.filter((r) => r.sku_id === filters.sku_id);
    }
    if (filters.metric_id && filters.metric_id !== 'All') {
      rows = rows.filter((r) => r.metric_id === filters.metric_id);
    }

    return rows;
  }

  /**
   * Returns a single metric row matching the filter.
   */
  public getMetricValue(metricId: MetricId, filters: AnalyticsFilter = {}): AnalyticalMetricRow | null {
    const matches = this.getMetricRows({ ...filters, metric_id: metricId });
    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Returns monthly trend points across the 3 analytical months (June, July, August 2026).
   */
  public getTrends(metricId: MetricId, filters: AnalyticsFilter = {}): MonthlyTrendPoint[] {
    const months: readonly { id: AnalyticalMonth; label: string }[] = [
      { id: '2026-06', label: 'June 2026' },
      { id: '2026-07', label: 'July 2026' },
      { id: '2026-08', label: 'August 2026' },
    ];

    return months.map((m) => {
      const row = this.getMetricValue(metricId, { ...filters, month: m.id });
      return {
        month: m.id,
        month_label: m.label,
        value: row ? row.metric_value : null,
        observation_count: row ? row.observation_count : 0,
        data_state: row ? row.data_state : 'MISSING',
      };
    });
  }

  /**
   * Returns head-to-head comparison across all 4 target brands for a specific metric and month.
   */
  public getBrandComparison(metricId: MetricId, month: AnalyticalMonth = '2026-08'): BrandComparisonRecord[] {
    const def = METRIC_DEFINITIONS[metricId];

    return TARGET_BRANDS.map((brand) => {
      const row = this.getMetricValue(metricId, { brand, month, sku_id: 'All' });
      return {
        brand,
        metric_id: metricId,
        metric_name: def.name,
        value: row ? row.metric_value : null,
        unit: def.unit,
        observation_count: row ? row.observation_count : 0,
        data_state: row ? row.data_state : 'MISSING',
      };
    });
  }

  /**
   * Returns canonical SKU pricing and promotion comparisons.
   */
  public getSkuComparison(
    brand?: TargetBrand,
    month: AnalyticalMonth = '2026-08',
    includeAll: boolean = true
  ): SkuComparisonRecord[] {
    const skusSource = includeAll ? ALL_MARKET_SKUS : CANONICAL_SKUS;
    const skus = brand ? skusSource.filter((s) => s.brand === brand) : skusSource;

    return skus.map((sku) => {
      const priceRow = this.getMetricValue('AVG_SELLING_PRICE_THB', { brand: sku.brand, month, sku_id: sku.sku_id });
      const medianRow = this.getMetricValue('MEDIAN_SELLING_PRICE_THB', { brand: sku.brand, month, sku_id: sku.sku_id });
      const discountRow = this.getMetricValue('AVG_DISCOUNT_PCT', { brand: sku.brand, month, sku_id: sku.sku_id });
      const promoRow = this.getMetricValue('PROMO_PENETRATION_PCT', { brand: sku.brand, month, sku_id: sku.sku_id });
      const tractionRow = this.getMetricValue('OBSERVABLE_SALES_TRACTION_INDEX', {
        brand: sku.brand,
        month,
        sku_id: sku.sku_id,
      });

      return {
        sku_id: sku.sku_id,
        model_name: sku.model_name,
        brand: sku.brand,
        segment: sku.target_segment,
        avg_price_thb: priceRow?.metric_value ?? null,
        median_price_thb: medianRow?.metric_value ?? null,
        avg_discount_pct: discountRow?.metric_value ?? null,
        promo_penetration_pct: promoRow?.metric_value ?? null,
        sales_traction_index: tractionRow?.metric_value ?? null,
        observation_count: priceRow?.observation_count ?? 0,
        evidence_ids: priceRow?.evidence_ids ?? [],
      };
    });
  }

  /**
   * Returns platform breakdown across channels.
   */
  public getPlatformBreakdown(channel?: ChannelType, month: AnalyticalMonth = '2026-08'): PlatformBreakdownRecord[] {
    const rows = this.getMetricRows({ month, sku_id: 'All' });
    const platformRows = rows.filter((r) => r.platform !== 'All' && (!channel || r.channel === channel));

    const totalChannelObs = platformRows.reduce((acc, r) => acc + r.observation_count, 0);

    return platformRows.map((r) => ({
      platform: r.platform as PlatformType,
      channel: r.channel as ChannelType,
      brand: r.brand,
      observation_count: r.observation_count,
      share_of_channel_pct:
        totalChannelObs > 0 ? Number(((r.observation_count / totalChannelObs) * 100).toFixed(1)) : null,
    }));
  }

  /**
   * Retrieves the raw underlying evidence records for an analytical metric.
   */
  public getEvidenceForMetric(metricId: MetricId, filters: AnalyticsFilter = {}): RawEvidenceRecord[] {
    const row = this.getMetricValue(metricId, filters);
    if (!row || row.evidence_ids.length === 0) return [];

    const evidenceList: RawEvidenceRecord[] = [];
    for (const eid of row.evidence_ids) {
      const rec = globalEvidenceStore.getById(eid);
      if (rec) evidenceList.push(rec);
    }

    return evidenceList;
  }

  /**
   * Synthesizes Executive Overview summary.
   */
  public getExecutiveOverview(month: AnalyticalMonth = '2026-08'): ExecutiveOverviewData {
    const allEvidence = globalEvidenceStore.getAll();
    const brandSummaries = {} as ExecutiveOverviewData['brands'];

    // Calculate verified observations for the active window
    const activeRecords = allEvidence.filter(
      (r) => month === 'ALL' || (r.published_at && r.published_at.startsWith(month))
    );

    for (const brand of TARGET_BRANDS) {
      const touchpointRow = this.getMetricValue('TOTAL_VISIBILITY_TOUCHPOINTS', { brand, month, sku_id: 'All' });
      const paidSovRow = this.getMetricValue('PAID_MEDIA_SOV', { brand, month, sku_id: 'All' });
      const socialSovRow = this.getMetricValue('SOCIAL_SOV', { brand, month, sku_id: 'All' });
      const ecomSovRow = this.getMetricValue('ECOMMERCE_SOV', { brand, month, sku_id: 'All' });
      const priceRow = this.getMetricValue('AVG_SELLING_PRICE_THB', { brand, month, sku_id: 'All' });
      const discountRow = this.getMetricValue('AVG_DISCOUNT_PCT', { brand, month, sku_id: 'All' });

      // Find top promoted SKU for this brand
      const brandSkus = this.getSkuComparison(brand, month);
      const topPromoted = brandSkus.sort((a, b) => (b.promo_penetration_pct || 0) - (a.promo_penetration_pct || 0))[0];

      const brandRated = activeRecords.filter(
        (r) => r.brand === brand && typeof r.rating === 'number' && r.rating > 0
      );
      const brandAvgRating = brandRated.length > 0
        ? Number((brandRated.reduce((acc, r) => acc + (r.rating || 0), 0) / brandRated.length).toFixed(1))
        : null;

      brandSummaries[brand] = {
        total_visibility_touchpoints: touchpointRow?.metric_value ?? 0,
        paid_sov_pct: paidSovRow?.metric_value ?? null,
        social_sov_pct: socialSovRow?.metric_value ?? null,
        ecom_sov_pct: ecomSovRow?.metric_value ?? null,
        avg_price_thb: priceRow?.metric_value ?? null,
        avg_discount_pct: discountRow?.metric_value ?? null,
        avg_consumer_rating: brandAvgRating,
        top_promoted_sku: topPromoted?.promo_penetration_pct ? topPromoted.model_name : null,
        evidence_count: touchpointRow?.observation_count ?? 0,
      };
    }

    const ratedRecords = activeRecords.filter(
      (r) => typeof r.rating === 'number' && r.rating > 0
    );
    const overallAvgRating = ratedRecords.length > 0
      ? Number((ratedRecords.reduce((acc, r) => acc + (r.rating || 0), 0) / ratedRecords.length).toFixed(1))
      : null;

    const channelObservations = {
      paid_media: activeRecords.filter((r) => r.channel === 'Paid Media').length,
      social: activeRecords.filter((r) => (r.channel as string) === 'Social' || (r.channel as string) === 'Social Channels').length,
      ecommerce: activeRecords.filter((r) => (r.channel as string) === 'E-commerce' || (r.channel as string) === 'E-Commerce').length,
      consumer_review: activeRecords.filter((r) => r.channel === 'Consumer Review').length,
    };

    return {
      month,
      brands: brandSummaries,
      total_evidence_observations: activeRecords.length,
      total_lake_observations: allEvidence.length,
      channel_observations: channelObservations,
      avg_consumer_rating: overallAvgRating,
      generated_at: new Date().toISOString(),
    };
  }

  // Backward-compatible query alias
  public async getMetricCube(filters: AnalyticsFilter): Promise<AnalyticalMetricRow[]> {
    return this.getMetricRows(filters);
  }
}

const globalForAnalytics = globalThis as unknown as {
  globalAnalyticsService?: AnalyticsService;
};

export const analyticsService =
  globalForAnalytics.globalAnalyticsService ?? new AnalyticsService();

if (process.env.NODE_ENV !== 'production') {
  globalForAnalytics.globalAnalyticsService = analyticsService;
}

