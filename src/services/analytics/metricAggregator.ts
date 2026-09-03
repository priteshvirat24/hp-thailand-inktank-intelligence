/**
 * Authoritative Analytical Cube Aggregator
 * 
 * Transforms validated RawEvidenceRecord objects into the multi-dimensional analytical cube:
 * Brand × Month × Channel × Platform × SKU × Metric
 */

import { AnalyticalMetricRow, AnalyticalMonth, MetricId } from '@/types/analytics';
import { PlatformType } from '@/types/sources';
import { RawEvidenceRecord } from '@/types/evidence';
import { TARGET_BRANDS } from '@/config/brands';
import { ALL_MARKET_SKUS } from '@/config/skus';
import { assignAnalyticalMonth } from '@/lib/dates';
import { METRIC_DEFINITIONS, getAllMetricDefinitions } from './metricRegistry';

export class MetricAggregator {
  /**
   * Deterministically aggregates evidence records into the multi-dimensional analytical cube.
   */
  public aggregate(evidenceRecords: readonly RawEvidenceRecord[]): AnalyticalMetricRow[] {
    const generatedAt = new Date().toISOString();
    const rows: AnalyticalMetricRow[] = [];

    // 1. Filter and tag eligible records with their assigned analytical month
    interface TaggedEvidence {
      record: RawEvidenceRecord;
      analyticalMonth: AnalyticalMonth;
    }

    const taggedRecords: TaggedEvidence[] = [];

    for (const record of evidenceRecords) {
      // Must be target brand
      if (!TARGET_BRANDS.includes(record.brand)) continue;

      // Assign analytical month (rolls late May baseline into 2026-06)
      const month = assignAnalyticalMonth(record.published_at);
      if (!month) continue; // Out of 90-day observation window

      taggedRecords.push({ record, analyticalMonth: month });
    }

    const analyticalMonths: readonly AnalyticalMonth[] = ['2026-06', '2026-07', '2026-08', 'ALL'] as const;

    // 2. Precompute category-wide monthly totals for SOV denominators
    const monthlyCategoryTotals: Record<
      AnalyticalMonth,
      { paidAds: number; socialPosts: number; ecomListings: number }
    > = {
      '2026-06': { paidAds: 0, socialPosts: 0, ecomListings: 0 },
      '2026-07': { paidAds: 0, socialPosts: 0, ecomListings: 0 },
      '2026-08': { paidAds: 0, socialPosts: 0, ecomListings: 0 },
      'ALL': { paidAds: 0, socialPosts: 0, ecomListings: 0 },
    };

    for (const item of taggedRecords) {
      if (item.record.channel === 'Paid Media') {
        monthlyCategoryTotals[item.analyticalMonth].paidAds++;
        monthlyCategoryTotals['ALL'].paidAds++;
      } else if (item.record.channel === 'Social') {
        monthlyCategoryTotals[item.analyticalMonth].socialPosts++;
        monthlyCategoryTotals['ALL'].socialPosts++;
      } else if (item.record.channel === 'E-commerce') {
        monthlyCategoryTotals[item.analyticalMonth].ecomListings++;
        monthlyCategoryTotals['ALL'].ecomListings++;
      }
    }

    const allMetrics = getAllMetricDefinitions();

    // 3. Generate Cube Rows for each Brand × Month × Metric combination (Brand Level)
    for (const brand of TARGET_BRANDS) {
      for (const month of analyticalMonths) {
        const brandMonthRecords = taggedRecords
          .filter((t) => t.record.brand === brand && (month === 'ALL' || t.analyticalMonth === month))
          .map((t) => t.record);

        for (const metricDef of allMetrics) {
          let denominator: number | undefined;
          if (metricDef.metric_id === 'PAID_MEDIA_SOV') {
            denominator = monthlyCategoryTotals[month].paidAds;
          } else if (metricDef.metric_id === 'SOCIAL_SOV') {
            denominator = monthlyCategoryTotals[month].socialPosts;
          } else if (metricDef.metric_id === 'ECOMMERCE_SOV') {
            denominator = monthlyCategoryTotals[month].ecomListings;
          }

          const calc = metricDef.calculate(brandMonthRecords, denominator);

          const rowId = `ROW-${brand}-${month}-${metricDef.channel}-All-All-${metricDef.metric_id}`;
          rows.push({
            row_id: rowId,
            brand,
            analytical_month: month,
            channel: metricDef.channel,
            platform: 'All',
            sku_id: 'All',
            sku_model_name: 'All',
            metric_id: metricDef.metric_id,
            metric_name: metricDef.name,
            metric_value: calc.value,
            unit: calc.unit,
            observation_count: calc.observation_count,
            evidence_ids: calc.evidence_ids,
            methodology_note: calc.methodology_note,
            data_state: calc.data_state,
            generated_at: generatedAt,
          });
        }
      }
    }

    // 4. Generate SKU-Level Cube Rows for Pricing, Discounts, and Traction
    const skuSpecificMetrics: MetricId[] = [
      'AVG_SELLING_PRICE_THB',
      'MEDIAN_SELLING_PRICE_THB',
      'MIN_SELLING_PRICE_THB',
      'MAX_SELLING_PRICE_THB',
      'AVG_DISCOUNT_PCT',
      'PROMO_PENETRATION_PCT',
      'ACTIVE_OFFICIAL_STORES_COUNT',
      'OBSERVABLE_SALES_TRACTION_INDEX',
      'AVG_CONSUMER_RATING',
      'TOTAL_CONSUMER_REVIEWS_COUNT',
    ];

    for (const sku of ALL_MARKET_SKUS) {
      for (const month of analyticalMonths) {
        const skuRecords = taggedRecords
          .filter(
            (t) =>
              t.record.brand === sku.brand &&
              (month === 'ALL' || t.analyticalMonth === month) &&
              t.record.product_sku?.toLowerCase() === sku.model_name.toLowerCase()
          )
          .map((t) => t.record);

        for (const metricId of skuSpecificMetrics) {
          const metricDef = METRIC_DEFINITIONS[metricId];
          const calc = metricDef.calculate(skuRecords);

          const skuSlug = sku.sku_id;
          const rowId = `ROW-${sku.brand}-${month}-E-commerce-All-${skuSlug}-${metricId}`;
          rows.push({
            row_id: rowId,
            brand: sku.brand,
            analytical_month: month,
            channel: 'E-commerce',
            platform: 'All',
            sku_id: sku.sku_id,
            sku_model_name: sku.model_name,
            metric_id: metricId,
            metric_name: metricDef.name,
            metric_value: calc.value,
            unit: calc.unit,
            observation_count: calc.observation_count,
            evidence_ids: calc.evidence_ids,
            methodology_note: calc.methodology_note,
            data_state: calc.data_state,
            generated_at: generatedAt,
          });
        }
      }
    }

    // 5. Generate Platform-Level Cube Rows for Major Channels
    const platforms: readonly PlatformType[] = [
      'Meta',
      'Google Ads',
      'Shopee',
      'Lazada',
      'TikTok Shop',
      'JIB',
      'Facebook',
      'Instagram',
      'YouTube',
    ] as const;

    for (const brand of TARGET_BRANDS) {
      for (const month of analyticalMonths) {
        for (const platform of platforms) {
          const platformRecords = taggedRecords
            .filter((t) => t.record.brand === brand && (month === 'ALL' || t.analyticalMonth === month) && t.record.platform === platform)
            .map((t) => t.record);

          if (platformRecords.length === 0) continue;

          const channel = platformRecords[0].channel;
          const countMetric: MetricId =
            channel === 'Paid Media'
              ? 'AD_PRESENCE_COUNT'
              : channel === 'Social'
              ? 'SOCIAL_POSTS_COUNT'
              : 'ECOMMERCE_LISTINGS_COUNT';

          const metricDef = METRIC_DEFINITIONS[countMetric];
          const calc = metricDef.calculate(platformRecords);

          const rowId = `ROW-${brand}-${month}-${channel}-${platform}-All-${countMetric}`;
          rows.push({
            row_id: rowId,
            brand,
            analytical_month: month,
            channel,
            platform,
            sku_id: 'All',
            sku_model_name: 'All',
            metric_id: countMetric,
            metric_name: metricDef.name,
            metric_value: calc.value,
            unit: calc.unit,
            observation_count: calc.observation_count,
            evidence_ids: calc.evidence_ids,
            methodology_note: `Platform-specific count on ${platform}.`,
            data_state: calc.data_state,
            generated_at: generatedAt,
          });
        }
      }
    }

    return rows;
  }
}

export const metricAggregator = new MetricAggregator();
