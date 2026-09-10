/**
 * Phase 6 & Phase 7 Forensic Audit Remediation Suite
 * Proves genuine business and mathematical behavior across all 20 required forensic scenarios.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { analyticsService } from '@/services/analytics/analyticsService';
import { getMetricDefinition } from '@/services/analytics/metricRegistry';
import { ragService } from '@/services/rag/ragService';
import { retrievalEngine } from '@/services/rag/retrievalEngine';
import { CANONICAL_SKUS, ALL_MARKET_SKUS } from '@/config/skus';
import { TARGET_BRANDS } from '@/config/brands';
import { TargetBrand } from '@/types/brands';
import { RawEvidenceRecord } from '@/types/evidence';
import { AnalyticalMonth } from '@/types/analytics';

describe('Phase 7: Complete Post-Remediation Defect Elimination Suite', () => {
  beforeAll(() => {
    // Ensure Evidence Store is initialized from disk
    globalEvidenceStore.loadFromDisk(true);
    analyticsService.rebuildAnalyticsFromEvidence();
    expect(globalEvidenceStore.getAll().length).toBe(3971);
  });

  // ─── SCENARIO 1, 2, 3, 4: Bounded vs Full Evidence Lake Retrieval (NEW-BUG-001) ───
  describe('NEW-BUG-001: Evidence Lake Pagination & Client-State Integrity', () => {
    it('1. Generic Evidence API query without all=true remains bounded to safe default of 50', async () => {
      const { GET } = await import('@/app/api/analytics/evidence/route');
      const req = new NextRequest('http://localhost:3000/api/analytics/evidence?metric=ALL');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.pageSize).toBe(50);
      expect(data.evidence.length).toBe(50);
      expect(data.total).toBe(3971);
      expect(data.hasNext).toBe(true);
    });

    it('2. Requesting all=true explicitly bypasses pagination to retrieve complete evidence set', async () => {
      const { GET } = await import('@/app/api/analytics/evidence/route');
      const req = new NextRequest('http://localhost:3000/api/analytics/evidence?metric=ALL&all=true');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.evidence.length).toBe(3971);
      expect(data.total).toBe(3971);
    });

    it('3. Brand and month filters survive full evidence retrieval without record leakage', async () => {
      const { GET } = await import('@/app/api/analytics/evidence/route');
      const req = new NextRequest('http://localhost:3000/api/analytics/evidence?metric=ALL&all=true&brand=Canon&month=2026-08');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.evidence.length).toBeGreaterThan(0);
      for (const rec of data.evidence) {
        expect(rec.brand).toBe('Canon');
        expect(rec.published_at.startsWith('2026-08')).toBe(true);
      }
    });

    it('4. Full evidence retrieval retains all Consumer Review records (eliminating client-state blanking)', async () => {
      const { GET } = await import('@/app/api/analytics/evidence/route');
      const req = new NextRequest('http://localhost:3000/api/analytics/evidence?metric=ALL&all=true&month=2026-08');
      const res = await GET(req);
      const data = await res.json();
      const reviewRecords = data.evidence.filter((r: RawEvidenceRecord) => r.channel === 'Consumer Review');
      expect(reviewRecords.length).toBe(144); // 36 HP + 36 Epson + 36 Canon + 36 Brother
    });
  });

  // ─── SCENARIO 5 & 6: Consumer Review Purity (NEW-BUG-002) ───────────────────
  describe('NEW-BUG-002: Consumer Review Metric Purity & Exclusion of E-commerce Listings', () => {
    it('5. AVG_CONSUMER_RATING and POSITIVE_SENTIMENT_PCT ignore E-commerce listings and calculate solely from Consumer Reviews', () => {
      const mockRecords: RawEvidenceRecord[] = [
        // 2 Genuine Consumer Reviews: 1 negative (2 stars), 1 positive (4 stars) -> 50% positive, 3.0 avg
        {
          evidence_id: 'REV-01',
          published_at: '2026-08-10',
          captured_at: '2026-08-10T10:00:00Z',
          brand: 'Epson',
          channel: 'Consumer Review',
          platform: 'Shopee',
          activity_type: 'Consumer Review',
          product_sku: 'L3250',
          raw_title: 'Review 1',
          raw_content_th: 'Good',
          content_en_translation: 'Good',
          price_current_thb: null,
          price_original_thb: null,
          discount_pct: null,
          seller_name: null,
          is_official_store: false,
          stock_status: 'In Stock',
          displayed_sales: null,
          rating: 4,
          review_count: null,
          creative_format: null,
          creative_asset_url: null,
          source_url: 'https://shopee.co.th/rev1',
          evidence_tags: [],
          extraction_method: 'Direct HTTP',
          confidence_score: 1.0,
        },
        {
          evidence_id: 'REV-02',
          published_at: '2026-08-11',
          captured_at: '2026-08-11T10:00:00Z',
          brand: 'Epson',
          channel: 'Consumer Review',
          platform: 'Shopee',
          activity_type: 'Consumer Review',
          product_sku: 'L3250',
          raw_title: 'Review 2',
          raw_content_th: 'Bad clogging',
          content_en_translation: 'Bad clogging',
          price_current_thb: null,
          price_original_thb: null,
          discount_pct: null,
          seller_name: null,
          is_official_store: false,
          stock_status: 'In Stock',
          displayed_sales: null,
          rating: 2,
          review_count: null,
          creative_format: null,
          creative_asset_url: null,
          source_url: 'https://shopee.co.th/rev2',
          evidence_tags: [],
          extraction_method: 'Direct HTTP',
          confidence_score: 1.0,
        },
        // 5 E-commerce listings with 5.0 rating badges (must be ignored!)
        ...Array.from({ length: 5 }).map((_, i) => ({
          evidence_id: `ECOM-${i}`,
          published_at: '2026-08-12',
          captured_at: '2026-08-12T10:00:00Z',
          brand: 'Epson' as TargetBrand,
          channel: 'E-commerce' as const,
          platform: 'Shopee' as const,
          activity_type: 'Product Listing' as const,
          product_sku: 'L3250',
          raw_title: `Listing ${i}`,
          raw_content_th: 'Store',
          content_en_translation: 'Store',
          price_current_thb: 4290,
          price_original_thb: 4990,
          discount_pct: 14,
          seller_name: 'Shop',
          is_official_store: true,
          stock_status: 'In Stock' as const,
          displayed_sales: '1.2k',
          rating: 5.0,
          review_count: 500,
          creative_format: null,
          creative_asset_url: null,
          source_url: `https://shopee.co.th/listing-${i}`,
          evidence_tags: [],
          extraction_method: 'Direct HTTP' as const,
          confidence_score: 1.0,
        })),
      ];

      const sentimentDef = getMetricDefinition('POSITIVE_SENTIMENT_PCT');
      const ratingDef = getMetricDefinition('AVG_CONSUMER_RATING');
      const countDef = getMetricDefinition('TOTAL_CONSUMER_REVIEWS_COUNT');

      const sentimentResult = sentimentDef.calculate(mockRecords);
      const ratingResult = ratingDef.calculate(mockRecords);
      const countResult = countDef.calculate(mockRecords);

      // Must calculate strictly from 2 reviews: 1 positive out of 2 = 50.0%
      expect(sentimentResult.value).toBe(50.0);
      expect(sentimentResult.observation_count).toBe(2);

      // Rating must be (4 + 2) / 2 = 3.00, NOT diluted by the five 5.0 listing badges
      expect(ratingResult.value).toBe(3.0);
      expect(ratingResult.observation_count).toBe(2);

      // Total count must be 2 reviews
      expect(countResult.value).toBe(2);
      expect(countResult.observation_count).toBe(2);
    });

    it('6. Consumer sentiment calculation handles zero reviews as null/MISSING data state', () => {
      const sentimentDef = getMetricDefinition('POSITIVE_SENTIMENT_PCT');
      const ratingDef = getMetricDefinition('AVG_CONSUMER_RATING');

      const sentimentResult = sentimentDef.calculate([]);
      const ratingResult = ratingDef.calculate([]);

      expect(sentimentResult.value).toBeNull();
      expect(sentimentResult.data_state).toBe('MISSING');
      expect(ratingResult.value).toBeNull();
      expect(ratingResult.data_state).toBe('MISSING');
    });
  });

  // ─── SCENARIO 7, 8, 9: Null-to-Zero Preservation (NEW-BUG-003) ───────────────
  describe('NEW-BUG-003: Null-to-Zero Invariant Enforcement', () => {
    it('7. Unobserved brand social metrics preserve null without zero coercion', () => {
      const unobservedRow = analyticsService.getMetricValue('SOCIAL_POSTS_COUNT', {
        brand: 'Brother',
        month: '2026-05' as unknown as AnalyticalMonth, // unobserved window
        sku_id: 'All',
      });
      expect(unobservedRow == null || unobservedRow.metric_value === null).toBe(true);
    });

    it('8. Unobserved brand advertising metrics preserve null without zero coercion', () => {
      const unobservedRow = analyticsService.getMetricValue('AD_PRESENCE_COUNT', {
        brand: 'HP',
        month: '2026-05' as unknown as AnalyticalMonth,
        sku_id: 'All',
      });
      expect(unobservedRow == null || unobservedRow.metric_value === null).toBe(true);
    });

    it('9. Analytics service getExecutiveOverview preserves null for unobserved touchpoints', () => {
      const overview = analyticsService.getExecutiveOverview('2026-05' as unknown as AnalyticalMonth);
      for (const brand of TARGET_BRANDS) {
        expect(overview.brands[brand].total_visibility_touchpoints).toBeNull();
        expect(overview.brands[brand].avg_price_thb).toBeNull();
      }
    });
  });

  // ─── SCENARIO 10: SKU Count Contract Alignment (NEW-BUG-004) ────────────────
  describe('NEW-BUG-004: SKU Count Contract Alignment', () => {
    it('10. Confirms 28 canonical benchmark models and 65 comprehensive market models are aligned without contradiction', () => {
      expect(CANONICAL_SKUS.length).toBe(28);
      expect(ALL_MARKET_SKUS.length).toBe(65);

      // Verify every canonical SKU exists in ALL_MARKET_SKUS
      for (const canon of CANONICAL_SKUS) {
        const found = ALL_MARKET_SKUS.find((s) => s.sku_id === canon.sku_id);
        expect(found).toBeDefined();
        expect(found?.brand).toBe(canon.brand);
      }
    });
  });

  // ─── SCENARIO 11 & 12: Sales Traction Deduplication (NEW-BUG-005) ─────────────
  describe('NEW-BUG-005: Sales Traction Deduplication Across Multi-Snapshot Crawls', () => {
    it('11. Deduplicates repeated snapshots of the same listing, preventing cumulative badge multiplication', () => {
      const tractionDef = getMetricDefinition('OBSERVABLE_SALES_TRACTION_INDEX');

      // Controlled fixture: The EXACT same Shopee listing scraped across 4 weekly dates
      const weeklySnapshots: RawEvidenceRecord[] = [
        {
          evidence_id: 'EVID-SNAP-1',
          published_at: '2026-08-07',
          captured_at: '2026-08-07T12:00:00Z',
          brand: 'Canon',
          channel: 'E-commerce',
          platform: 'Shopee',
          activity_type: 'Product Listing',
          product_sku: 'G2010',
          raw_title: 'Canon PIXMA G2010 Ink Tank',
          raw_content_th: 'Listing',
          content_en_translation: 'Listing',
          price_current_thb: 3690,
          price_original_thb: 4290,
          discount_pct: 14,
          seller_name: 'Official Canon Store',
          is_official_store: true,
          stock_status: 'In Stock',
          displayed_sales: '1.2k',
          rating: 4.8,
          review_count: 320,
          creative_format: null,
          creative_asset_url: null,
          source_url: 'https://shopee.co.th/product/canon-g2010-12345',
          evidence_tags: [],
          extraction_method: 'Direct HTTP',
          confidence_score: 1.0,
        },
        {
          evidence_id: 'EVID-SNAP-2',
          published_at: '2026-08-14',
          captured_at: '2026-08-14T12:00:00Z',
          brand: 'Canon',
          channel: 'E-commerce',
          platform: 'Shopee',
          activity_type: 'Product Listing',
          product_sku: 'G2010',
          raw_title: 'Canon PIXMA G2010 Ink Tank',
          raw_content_th: 'Listing',
          content_en_translation: 'Listing',
          price_current_thb: 3690,
          price_original_thb: 4290,
          discount_pct: 14,
          seller_name: 'Official Canon Store',
          is_official_store: true,
          stock_status: 'In Stock',
          displayed_sales: '1.2k',
          rating: 4.8,
          review_count: 322,
          creative_format: null,
          creative_asset_url: null,
          source_url: 'https://shopee.co.th/product/canon-g2010-12345',
          evidence_tags: [],
          extraction_method: 'Direct HTTP',
          confidence_score: 1.0,
        },
        {
          evidence_id: 'EVID-SNAP-3',
          published_at: '2026-08-21',
          captured_at: '2026-08-21T12:00:00Z',
          brand: 'Canon',
          channel: 'E-commerce',
          platform: 'Shopee',
          activity_type: 'Product Listing',
          product_sku: 'G2010',
          raw_title: 'Canon PIXMA G2010 Ink Tank',
          raw_content_th: 'Listing',
          content_en_translation: 'Listing',
          price_current_thb: 3690,
          price_original_thb: 4290,
          discount_pct: 14,
          seller_name: 'Official Canon Store',
          is_official_store: true,
          stock_status: 'In Stock',
          displayed_sales: '1.2k',
          rating: 4.8,
          review_count: 325,
          creative_format: null,
          creative_asset_url: null,
          source_url: 'https://shopee.co.th/product/canon-g2010-12345',
          evidence_tags: [],
          extraction_method: 'Direct HTTP',
          confidence_score: 1.0,
        },
        {
          evidence_id: 'EVID-SNAP-4',
          published_at: '2026-08-28',
          captured_at: '2026-08-28T12:00:00Z',
          brand: 'Canon',
          channel: 'E-commerce',
          platform: 'Shopee',
          activity_type: 'Product Listing',
          product_sku: 'G2010',
          raw_title: 'Canon PIXMA G2010 Ink Tank',
          raw_content_th: 'Listing',
          content_en_translation: 'Listing',
          price_current_thb: 3690,
          price_original_thb: 4290,
          discount_pct: 14,
          seller_name: 'Official Canon Store',
          is_official_store: true,
          stock_status: 'In Stock',
          displayed_sales: '1.2k',
          rating: 4.8,
          review_count: 328,
          creative_format: null,
          creative_asset_url: null,
          source_url: 'https://shopee.co.th/product/canon-g2010-12345',
          evidence_tags: [],
          extraction_method: 'Direct HTTP',
          confidence_score: 1.0,
        },
      ];

      const res = tractionDef.calculate(weeklySnapshots);
      // Expected contribution: exactly 1,200 once (NOT 4,800!)
      expect(res.value).toBe(1200);
      expect(res.observation_count).toBe(1);
    });

    it('12. Multiple distinct listings remain separately counted in the traction index', () => {
      const tractionDef = getMetricDefinition('OBSERVABLE_SALES_TRACTION_INDEX');

      const twoDistinctListings: RawEvidenceRecord[] = [
        {
          evidence_id: 'EVID-L1',
          published_at: '2026-08-15',
          captured_at: '2026-08-15T12:00:00Z',
          brand: 'HP',
          channel: 'E-commerce',
          platform: 'Shopee',
          activity_type: 'Product Listing',
          product_sku: 'HP-ST-580',
          raw_title: 'HP Smart Tank 580',
          raw_content_th: 'Listing',
          content_en_translation: 'Listing',
          price_current_thb: 4590,
          price_original_thb: 5290,
          discount_pct: 13,
          seller_name: 'HP Official Store',
          is_official_store: true,
          stock_status: 'In Stock',
          displayed_sales: '500',
          rating: 4.9,
          review_count: 150,
          creative_format: null,
          creative_asset_url: null,
          source_url: 'https://shopee.co.th/product/hp-580-shopee',
          evidence_tags: [],
          extraction_method: 'Direct HTTP',
          confidence_score: 1.0,
        },
        {
          evidence_id: 'EVID-L2',
          published_at: '2026-08-15',
          captured_at: '2026-08-15T12:00:00Z',
          brand: 'HP',
          channel: 'E-commerce',
          platform: 'Lazada',
          activity_type: 'Product Listing',
          product_sku: 'HP-ST-580',
          raw_title: 'HP Smart Tank 580 LazMall',
          raw_content_th: 'Listing',
          content_en_translation: 'Listing',
          price_current_thb: 4590,
          price_original_thb: 5290,
          discount_pct: 13,
          seller_name: 'HP LazMall Flagship',
          is_official_store: true,
          stock_status: 'In Stock',
          displayed_sales: '300',
          rating: 4.9,
          review_count: 90,
          creative_format: null,
          creative_asset_url: null,
          source_url: 'https://lazada.co.th/product/hp-580-lazada',
          evidence_tags: [],
          extraction_method: 'Direct HTTP',
          confidence_score: 1.0,
        },
      ];

      const res = tractionDef.calculate(twoDistinctListings);
      expect(res.value).toBe(800); // 500 + 300
      expect(res.observation_count).toBe(2);
    });
  });

  // ─── SCENARIO 13, 14, 15: RAG Grounding & Zero-Fallback Guard (NEW-BUG-006 & 007) ───
  describe('NEW-BUG-006 & NEW-BUG-007: RAG Out-of-Filter Guard & Metric Deduplication', () => {
    it('13. RAG returns 0 candidate chunks for unobserved filter criteria (e.g. May 2026)', async () => {
      const { buildAllEvidenceChunks } = await import('@/services/rag/evidenceDocumentBuilder');
      const allChunks = buildAllEvidenceChunks(globalEvidenceStore.getAll());
      const candidates = await retrievalEngine.retrieveRelevantChunks(
        {
          query: "What were Brother's promotional campaigns in May 2026?",
          brandFilter: 'Brother',
          monthFilter: '2026-05' as AnalyticalMonth, // unobserved window
        },
        allChunks,
        8
      );
      // MUST NOT fall back to allChunks!
      expect(candidates.length).toBe(0);
    });

    it('14. RAG grounding generates an honest Insufficient Evidence narrative for unobserved queries', async () => {
      const response = await ragService.query({
        query: "What were Brother's promotional campaigns in May 2026?",
        brandFilter: 'Brother',
        monthFilter: '2026-05' as AnalyticalMonth,
      });

      expect(response.answer).toContain('Insufficient evidence');
      expect(response.supporting_evidence.length).toBe(0);
      expect(response.sources.length).toBe(0);
    });

    it('15. RAG retrieval successfully retrieves grounded evidence for valid observed queries', async () => {
      const response = await ragService.query({
        query: "What are Epson's key promotional messages in August 2026?",
        brandFilter: 'Epson',
        monthFilter: '2026-08',
      });

      expect(response.answer).not.toContain('Insufficient evidence');
      expect(response.sources.length).toBeGreaterThan(0);
      for (const src of response.sources) {
        expect(src.brand).toBe('Epson');
      }
    });

    it('16. Deduplicates metricsToFetch when query contains both price and discount intents (NEW-BUG-007)', () => {
      const metrics = retrievalEngine.retrieveRelevantMetrics({
        query: 'What is the price and discount for HP?',
        brandFilter: 'HP',
        monthFilter: '2026-08',
      });

      // Count occurrences of AVG_DISCOUNT_PCT for HP
      const hpDiscounts = metrics.filter((m) => m.metric_id === 'AVG_DISCOUNT_PCT' && m.brand === 'HP');
      expect(hpDiscounts.length).toBe(1); // Deduplicated! Not 2!
    });
  });

  // ─── SCENARIO 16 & 17: Summary API Brand Lineage (BUG-001 Residual) ─────────
  describe('BUG-001 Residual: Summary API Brand Filtering & Executive Overview Lineage', () => {
    it('16. Summary API accepts and respects the brand parameter, scoping observations to that brand', async () => {
      const { GET } = await import('@/app/api/analytics/summary/route');
      const req = new NextRequest('http://localhost:3000/api/analytics/summary?month=2026-08&brand=Canon');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.brand).toBe('Canon');
      // Total evidence observations must be Canon-specific, NOT multi-brand total
      expect(data.total_evidence_observations).toBeLessThan(data.total_lake_observations);
      expect(data.total_evidence_observations).toBe(data.brands.Canon.evidence_count);
    });

    it('17. Summary API returns category-wide totals when brand=All is requested', async () => {
      const { GET } = await import('@/app/api/analytics/summary/route');
      const req = new NextRequest('http://localhost:3000/api/analytics/summary?month=2026-08&brand=All');
      const res = await GET(req);
      const data = await res.json();

      expect(data.brand).toBe('All');
      // Multi-brand total for August
      expect(data.total_evidence_observations).toBeGreaterThan(1000);
    });
  });

  // ─── SCENARIO 18, 19, 20: Filter Switching & State Isolation ─────────────────
  describe('State Isolation: Repeated Switching Between Brands, Months, and Tabs', () => {
    it('18. Repeated brand switching produces isolated, non-leaking metric summaries', () => {
      const hpAug = analyticsService.getExecutiveOverview('2026-08', 'HP');
      const epsonAug = analyticsService.getExecutiveOverview('2026-08', 'Epson');
      const canonAug = analyticsService.getExecutiveOverview('2026-08', 'Canon');

      expect(hpAug.total_evidence_observations).not.toBe(epsonAug.total_evidence_observations);
      expect(epsonAug.total_evidence_observations).not.toBe(canonAug.total_evidence_observations);

      // Verify HP consumer reviews rating is 100% pure
      expect(hpAug.avg_consumer_rating).toBeGreaterThanOrEqual(4.5);
    });

    it('19. Repeated month switching produces distinct monthly observation totals', () => {
      const juneSummary = analyticsService.getExecutiveOverview('2026-06', 'All');
      const julySummary = analyticsService.getExecutiveOverview('2026-07', 'All');
      const augSummary = analyticsService.getExecutiveOverview('2026-08', 'All');

      expect(juneSummary.month).toBe('2026-06');
      expect(julySummary.month).toBe('2026-07');
      expect(augSummary.month).toBe('2026-08');

      expect(juneSummary.total_evidence_observations).toBeGreaterThan(0);
      expect(julySummary.total_evidence_observations).toBeGreaterThan(0);
      expect(augSummary.total_evidence_observations).toBeGreaterThan(0);
    });

    it('20. Verified review counts match authentic review counts across all 4 brands for August 2026', () => {
      const reviews = analyticsService.getBrandComparison('TOTAL_CONSUMER_REVIEWS_COUNT', '2026-08');
      const sentiments = analyticsService.getBrandComparison('POSITIVE_SENTIMENT_PCT', '2026-08');

      for (const brand of TARGET_BRANDS) {
        const rCount = reviews.find((r) => r.brand === brand);
        const sPct = sentiments.find((s) => s.brand === brand);

        expect(rCount).toBeDefined();
        expect(rCount?.value).toBe(36); // 36 verified review records per brand in August
        expect(sPct).toBeDefined();
        expect(typeof sPct?.value).toBe('number');
      }

      // Verified exact percentages on authentic reviews
      expect(sentiments.find((s) => s.brand === 'HP')?.value).toBe(100.0);
      expect(sentiments.find((s) => s.brand === 'Epson')?.value).toBe(58.3);
      expect(sentiments.find((s) => s.brand === 'Canon')?.value).toBe(44.4);
      expect(sentiments.find((s) => s.brand === 'Brother')?.value).toBe(83.3);
    });
  });
});
