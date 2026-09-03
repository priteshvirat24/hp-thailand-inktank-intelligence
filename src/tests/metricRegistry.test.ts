import { describe, it, expect } from 'vitest';
import { getAllMetricDefinitions, getMetricDefinition } from '@/services/analytics/metricRegistry';
import { RawEvidenceRecord } from '@/types/evidence';

describe('Authoritative Metric Definitions Registry', () => {
  it('defines all required metrics across the 5 Data Cuts', () => {
    const allDefs = getAllMetricDefinitions();
    expect(allDefs.length).toBeGreaterThanOrEqual(18);

    const metricIds = allDefs.map((d) => d.metric_id);
    // Data Cut 1
    expect(metricIds).toContain('AD_PRESENCE_COUNT');
    expect(metricIds).toContain('SOCIAL_POSTS_COUNT');
    expect(metricIds).toContain('ECOMMERCE_LISTINGS_COUNT');
    expect(metricIds).toContain('PAID_MEDIA_SOV');
    expect(metricIds).toContain('SOCIAL_SOV');
    expect(metricIds).toContain('ECOMMERCE_SOV');
    expect(metricIds).toContain('TOTAL_VISIBILITY_TOUCHPOINTS');
    // Data Cut 2
    expect(metricIds).toContain('CREATIVE_FORMAT_VIDEO_COUNT');
    expect(metricIds).toContain('CREATIVE_FORMAT_STATIC_COUNT');
    expect(metricIds).toContain('CREATIVE_FORMAT_CAROUSEL_COUNT');
    // Data Cut 3
    expect(metricIds).toContain('TOTAL_SOCIAL_ENGAGEMENT');
    expect(metricIds).toContain('AVG_ENGAGEMENT_PER_POST');
    // Data Cut 4
    expect(metricIds).toContain('AVG_SELLING_PRICE_THB');
    expect(metricIds).toContain('MEDIAN_SELLING_PRICE_THB');
    expect(metricIds).toContain('MIN_SELLING_PRICE_THB');
    expect(metricIds).toContain('MAX_SELLING_PRICE_THB');
    expect(metricIds).toContain('AVG_DISCOUNT_PCT');
    expect(metricIds).toContain('PROMO_PENETRATION_PCT');
    expect(metricIds).toContain('ACTIVE_OFFICIAL_STORES_COUNT');
    expect(metricIds).toContain('OBSERVABLE_SALES_TRACTION_INDEX');
    // Data Cut 5
    expect(metricIds).toContain('AVG_CONSUMER_RATING');
    expect(metricIds).toContain('TOTAL_CONSUMER_REVIEWS_COUNT');
  });

  it('exposes explicit descriptions, units, and methodology notes for every metric', () => {
    getAllMetricDefinitions().forEach((def) => {
      expect(def.description.length).toBeGreaterThan(10);
      expect(def.methodology.length).toBeGreaterThan(10);
      expect(['THB', 'Count', 'Percentage', 'Score', 'Ratio', 'Index']).toContain(def.unit);
    });
  });

  it('distinguishes missing data (null) from observed zero for pricing and ratings', () => {
    const emptyRecords: RawEvidenceRecord[] = [];

    const priceDef = getMetricDefinition('AVG_SELLING_PRICE_THB');
    const priceRes = priceDef.calculate(emptyRecords);
    expect(priceRes.value).toBeNull();
    expect(priceRes.data_state).toBe('MISSING');

    const ratingDef = getMetricDefinition('AVG_CONSUMER_RATING');
    const ratingRes = ratingDef.calculate(emptyRecords);
    expect(ratingRes.value).toBeNull();
    expect(ratingRes.data_state).toBe('MISSING');
  });
});
