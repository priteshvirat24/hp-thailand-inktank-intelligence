import { describe, it, expect } from 'vitest';
import { metricAggregator } from '@/services/analytics/metricAggregator';
import { RawEvidenceRecord } from '@/types/evidence';

describe('Analytical Cube Aggregator Engine', () => {
  const baseRecord: RawEvidenceRecord = {
    evidence_id: 'EVID-SHOPEE-A1',
    published_at: '2026-06-15',
    captured_at: '2026-06-15T10:00:00.000Z',
    brand: 'HP',
    channel: 'E-commerce',
    platform: 'Shopee',
    activity_type: 'Product Listing',
    product_sku: 'Smart Tank 580',
    raw_title: 'HP Smart Tank 580 All-in-One Printer',
    raw_content_th: 'เครื่องพิมพ์ HP Smart Tank 580',
    content_en_translation: 'HP Smart Tank 580 Printer',
    price_current_thb: 5490,
    price_original_thb: 5990,
    discount_pct: 8,
    seller_name: 'HP Official Store',
    is_official_store: true,
    stock_status: 'In Stock',
    displayed_sales: '1.2k sold',
    rating: 4.8,
    review_count: 120,
    creative_format: null,
    creative_asset_url: null,
    source_url: 'https://shopee.co.th/product/123/456',
    evidence_tags: ['E-commerce', 'Shopee Mall'],
    extraction_method: 'Bright Data Scraping Browser',
    confidence_score: 0.98,
  };

  it('aggregates multi-dimensional metric rows deterministically', () => {
    const records: RawEvidenceRecord[] = [
      baseRecord,
      {
        ...baseRecord,
        evidence_id: 'EVID-SHOPEE-A2',
        price_current_thb: 5290,
        price_original_thb: 5990,
        discount_pct: 12,
        displayed_sales: '800 sold',
      },
      {
        ...baseRecord,
        evidence_id: 'EVID-META-A3',
        published_at: '2026-06-20',
        channel: 'Paid Media',
        platform: 'Meta',
        activity_type: 'Ad Creative',
        creative_format: 'Video',
        price_current_thb: null,
      },
    ];

    const rows = metricAggregator.aggregate(records);
    expect(rows.length).toBeGreaterThan(0);

    // HP June 2026 E-commerce average price: (5490 + 5290) / 2 = 5390
    const hpAvgPriceRow = rows.find(
      (r) =>
        r.brand === 'HP' &&
        r.analytical_month === '2026-06' &&
        r.sku_model_name === 'Smart Tank 580' &&
        r.metric_id === 'AVG_SELLING_PRICE_THB'
    );
    expect(hpAvgPriceRow).toBeDefined();
    expect(hpAvgPriceRow?.metric_value).toBe(5390);
    expect(hpAvgPriceRow?.observation_count).toBe(2);
    expect(hpAvgPriceRow?.evidence_ids).toContain('EVID-SHOPEE-A1');
    expect(hpAvgPriceRow?.evidence_ids).toContain('EVID-SHOPEE-A2');
  });

  it('rolls late May baseline observations (2026-05-28) into June 2026 (2026-06) analytical bucket', () => {
    const lateMayRecord: RawEvidenceRecord = {
      ...baseRecord,
      evidence_id: 'EVID-SHOPEE-MAY',
      published_at: '2026-05-29',
    };

    const rows = metricAggregator.aggregate([lateMayRecord]);
    const juneRow = rows.find(
      (r) =>
        r.brand === 'HP' &&
        r.analytical_month === '2026-06' &&
        r.sku_model_name === 'Smart Tank 580' &&
        r.metric_id === 'AVG_SELLING_PRICE_THB'
    );

    expect(juneRow).toBeDefined();
    expect(juneRow?.metric_value).toBe(5490);
    expect(juneRow?.evidence_ids).toContain('EVID-SHOPEE-MAY');
  });

  it('calculates Share of Voice (SOV) % with explicit category denominators', () => {
    const records: RawEvidenceRecord[] = [
      // 3 HP ads in July 2026
      { ...baseRecord, evidence_id: 'HP-AD-1', channel: 'Paid Media', platform: 'Meta', published_at: '2026-07-10' },
      { ...baseRecord, evidence_id: 'HP-AD-2', channel: 'Paid Media', platform: 'Meta', published_at: '2026-07-11' },
      { ...baseRecord, evidence_id: 'HP-AD-3', channel: 'Paid Media', platform: 'Meta', published_at: '2026-07-12' },
      // 1 Epson ad in July 2026
      {
        ...baseRecord,
        brand: 'Epson',
        evidence_id: 'EPSON-AD-1',
        channel: 'Paid Media',
        platform: 'Meta',
        published_at: '2026-07-10',
      },
    ];

    const rows = metricAggregator.aggregate(records);

    // Total ads in July = 4. HP = 3/4 = 75.0%, Epson = 1/4 = 25.0%
    const hpSov = rows.find(
      (r) => r.brand === 'HP' && r.analytical_month === '2026-07' && r.metric_id === 'PAID_MEDIA_SOV' && r.sku_id === 'All'
    );
    expect(hpSov?.metric_value).toBe(75.0);

    const epsonSov = rows.find(
      (r) => r.brand === 'Epson' && r.analytical_month === '2026-07' && r.metric_id === 'PAID_MEDIA_SOV' && r.sku_id === 'All'
    );
    expect(epsonSov?.metric_value).toBe(25.0);
  });
});
