import { describe, it, expect } from 'vitest';
import { validateEvidenceRecord } from '@/services/evidence/evidenceValidator';
import { RawEvidenceRecord } from '@/types/evidence';

describe('Strict Evidence Validator (Zod Schema)', () => {
  const validRecord: RawEvidenceRecord = {
    evidence_id: 'EVID-META-8F9210B3A1C4',
    published_at: '2026-07-20',
    captured_at: '2026-07-20T12:00:00.000Z',
    brand: 'HP',
    channel: 'Paid Media',
    platform: 'Meta',
    activity_type: 'Ad Creative',
    product_sku: 'Smart Tank 580',
    raw_title: 'HP Smart Tank 580 Wireless All-in-One Printer',
    raw_content_th: 'เครื่องพิมพ์ HP Smart Tank 580 พิมพ์คมชัด',
    content_en_translation: 'HP Smart Tank 580 Wireless All-in-One Printer',
    price_current_thb: 5490,
    price_original_thb: 5990,
    discount_pct: 8,
    seller_name: 'HP Official Store',
    is_official_store: true,
    stock_status: 'In Stock',
    displayed_sales: '1.2k sold',
    rating: 4.8,
    review_count: 150,
    creative_format: 'Video',
    creative_asset_url: 'https://example.com/asset.mp4',
    source_url: 'https://www.facebook.com/ads/library/?id=12345',
    evidence_tags: ['Paid Media', 'Meta Ads'],
    extraction_method: 'Apify Actor',
    confidence_score: 0.98,
  };

  it('validates a compliant RawEvidenceRecord successfully', () => {
    const res = validateEvidenceRecord(validRecord);
    expect(res.valid).toBe(true);
    expect(res.data?.evidence_id).toBe('EVID-META-8F9210B3A1C4');
  });

  it('rejects records with invalid evidence_id formatting', () => {
    const invalidIdRecord = { ...validRecord, evidence_id: 'invalid-id-123' };
    const res = validateEvidenceRecord(invalidIdRecord);
    expect(res.valid).toBe(false);
    expect(res.errors?.some((e) => e.includes('evidence_id'))).toBe(true);
  });

  it('rejects records with non-target brands', () => {
    const invalidBrandRecord = { ...validRecord, brand: 'Samsung' };
    const res = validateEvidenceRecord(invalidBrandRecord);
    expect(res.valid).toBe(false);
    expect(res.errors?.some((e) => e.includes('brand'))).toBe(true);
  });

  it('rejects records with invalid source_url', () => {
    const invalidUrlRecord = { ...validRecord, source_url: 'not-a-url' };
    const res = validateEvidenceRecord(invalidUrlRecord);
    expect(res.valid).toBe(false);
    expect(res.errors?.some((e) => e.includes('source_url'))).toBe(true);
  });

  it('rejects negative prices', () => {
    const negativePriceRecord = { ...validRecord, price_current_thb: -500 };
    const res = validateEvidenceRecord(negativePriceRecord);
    expect(res.valid).toBe(false);
  });
});
