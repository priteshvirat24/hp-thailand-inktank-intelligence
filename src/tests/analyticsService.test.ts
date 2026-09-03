import { describe, it, expect, beforeEach } from 'vitest';
import { analyticsService } from '@/services/analytics/analyticsService';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { RawEvidenceRecord } from '@/types/evidence';

describe('Authoritative Analytics Service & Query API', () => {
  const sampleEvidence: RawEvidenceRecord = {
    evidence_id: 'EVID-TEST-HP-01',
    published_at: '2026-08-05',
    captured_at: '2026-08-05T12:00:00.000Z',
    brand: 'HP',
    channel: 'E-commerce',
    platform: 'Shopee',
    activity_type: 'Product Listing',
    product_sku: 'Smart Tank 580',
    raw_title: 'HP Smart Tank 580 Multifunction Wireless',
    raw_content_th: 'เครื่องพิมพ์ HP Smart Tank 580',
    content_en_translation: 'HP Smart Tank 580 Multifunction',
    price_current_thb: 5490,
    price_original_thb: 5990,
    discount_pct: 8,
    seller_name: 'HP Official Store',
    is_official_store: true,
    stock_status: 'In Stock',
    displayed_sales: '1.5k sold',
    rating: 4.9,
    review_count: 210,
    creative_format: null,
    creative_asset_url: null,
    source_url: 'https://shopee.co.th/product/111/222',
    evidence_tags: ['E-commerce', 'Shopee Mall'],
    extraction_method: 'Bright Data Scraping Browser',
    confidence_score: 0.99,
  };

  beforeEach(() => {
    globalEvidenceStore.clear();
    analyticsService.rebuildAnalyticsFromEvidence();
  });

  it('rebuilds analytics deterministically from evidence store records', () => {
    globalEvidenceStore.insert(sampleEvidence);
    const cube = analyticsService.rebuildAnalyticsFromEvidence();
    expect(cube.length).toBeGreaterThan(0);

    const priceRow = analyticsService.getMetricValue('AVG_SELLING_PRICE_THB', {
      brand: 'HP',
      month: '2026-08',
      sku_id: 'HP-ST-580',
    });
    expect(priceRow?.metric_value).toBe(5490);
    expect(priceRow?.evidence_ids).toContain('EVID-TEST-HP-01');
  });

  it('returns structured monthly trend points across June, July, and August 2026', () => {
    globalEvidenceStore.insert(sampleEvidence);
    analyticsService.rebuildAnalyticsFromEvidence();

    const trends = analyticsService.getTrends('AVG_SELLING_PRICE_THB', {
      brand: 'HP',
      sku_id: 'HP-ST-580',
    });

    expect(trends.length).toBe(3);
    expect(trends[0].month).toBe('2026-06');
    expect(trends[0].value).toBeNull(); // Missing in June
    expect(trends[2].month).toBe('2026-08');
    expect(trends[2].value).toBe(5490); // Observed in August
  });

  it('provides head-to-head brand comparisons', () => {
    globalEvidenceStore.insert(sampleEvidence);
    globalEvidenceStore.insert({
      ...sampleEvidence,
      evidence_id: 'EVID-TEST-EPSON-01',
      brand: 'Epson',
      product_sku: 'EcoTank L3250',
      price_current_thb: 4990,
    });
    analyticsService.rebuildAnalyticsFromEvidence();

    const comp = analyticsService.getBrandComparison('TOTAL_VISIBILITY_TOUCHPOINTS', '2026-08');
    expect(comp.length).toBe(4);

    const hp = comp.find((c) => c.brand === 'HP');
    const epson = comp.find((c) => c.brand === 'Epson');
    const canon = comp.find((c) => c.brand === 'Canon');

    expect(hp?.value).toBe(1);
    expect(epson?.value).toBe(1);
    expect(canon?.value).toBe(0); // 0 observed touchpoints
  });

  it('traces metric values backward to raw evidence records', () => {
    globalEvidenceStore.insert(sampleEvidence);
    analyticsService.rebuildAnalyticsFromEvidence();

    const evidenceList = analyticsService.getEvidenceForMetric('AVG_SELLING_PRICE_THB', {
      brand: 'HP',
      month: '2026-08',
      sku_id: 'HP-ST-580',
    });

    expect(evidenceList.length).toBe(1);
    expect(evidenceList[0].evidence_id).toBe('EVID-TEST-HP-01');
    expect(evidenceList[0].raw_title).toBe('HP Smart Tank 580 Multifunction Wireless');
  });

  it('generates executive overview summaries dynamically', () => {
    globalEvidenceStore.insert(sampleEvidence);
    analyticsService.rebuildAnalyticsFromEvidence();

    const overview = analyticsService.getExecutiveOverview('2026-08');
    expect(overview.month).toBe('2026-08');
    expect(overview.brands.HP.total_visibility_touchpoints).toBe(1);
    expect(overview.brands.HP.avg_price_thb).toBe(5490);
    expect(overview.total_evidence_observations).toBe(1);
  });

  it('aggregates full 3-month intelligence across June, July, and August under ALL', () => {
    globalEvidenceStore.insert({
      ...sampleEvidence,
      evidence_id: 'EVID-HP-JUN',
      published_at: '2026-06-15',
      price_current_thb: 5400,
    });
    globalEvidenceStore.insert({
      ...sampleEvidence,
      evidence_id: 'EVID-HP-JUL',
      published_at: '2026-07-15',
      price_current_thb: 5300,
    });
    globalEvidenceStore.insert({
      ...sampleEvidence,
      evidence_id: 'EVID-HP-AUG',
      published_at: '2026-08-15',
      price_current_thb: 5200,
    });

    analyticsService.rebuildAnalyticsFromEvidence();

    const allComp = analyticsService.getBrandComparison('TOTAL_VISIBILITY_TOUCHPOINTS', 'ALL');
    const hpComp = allComp.find((c) => c.brand === 'HP');
    expect(hpComp?.value).toBe(3);
    expect(hpComp?.observation_count).toBe(3);

    const priceComp = analyticsService.getBrandComparison('AVG_SELLING_PRICE_THB', 'ALL');
    const hpPrice = priceComp.find((c) => c.brand === 'HP');
    expect(hpPrice?.value).toBe(5300); // (5400 + 5300 + 5200) / 3

    const overviewAll = analyticsService.getExecutiveOverview('ALL');
    expect(overviewAll.month).toBe('ALL');
    expect(overviewAll.brands.HP.total_visibility_touchpoints).toBe(3);
  });
});
