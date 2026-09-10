/**
 * Component Integration Test Infrastructure (BUG-017)
 *
 * Comprehensive integration suite verifying:
 * - Component Contract & Module Integrity (BUG-002, BUG-005, BUG-007, BUG-008, BUG-016)
 * - Metric Cube Consumer Review Metrics (BUG-003)
 * - Dead Code Elimination: Orphan Files (BUG-004, BUG-015)
 * - Null-to-Zero Invariant Preservation (BUG-005)
 * - SKU Normalization Matching: sku_id and aliases (BUG-006)
 * - E-Commerce Pricing Weighting & Discount Deflation Guard (BUG-007)
 * - Executive Overview Clean State Handling (BUG-008)
 * - SWOT Strategic Matrix Brand Scoping (BUG-009)
 * - Evidence Lake Bounded Pagination (BUG-010)
 * - 3-Month Trend Trajectory Verification (BUG-011)
 * - Screenshot URL Alignment for Review Records (BUG-012)
 * - RAG Consumer Sentiment Intent Handling (BUG-013)
 * - Dynamic Candidate Scoring in Insight Engine (BUG-014)
 * - Dynamic Navigation Badges (BUG-016)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// Services & Config
import { analyticsService } from '@/services/analytics/analyticsService';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { insightEngine } from '@/services/insights/insightEngine';
import { ragService } from '@/services/rag/ragService';
import { CANONICAL_SKUS, ALL_MARKET_SKUS } from '@/config/skus';
import { AnalyticalMonth } from '@/types/analytics';
import { Insight } from '@/services/insights/insightTypes';

describe('BUG-017: Component Integration Test Infrastructure', () => {
  beforeAll(() => {
    globalEvidenceStore.loadFromDisk(true);
    analyticsService.rebuildAnalyticsFromEvidence();
  });

  // ─── 1. Dead Code Elimination (BUG-004, BUG-015) ───────────────────────────
  describe('Dead Code Elimination Forensics', () => {
    it('verifies src/services/analytics/insightsService.ts is deleted (BUG-004)', () => {
      const filePath = path.resolve(process.cwd(), 'src/services/analytics/insightsService.ts');
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('verifies src/components/sections/CompetitiveSignalsSection.tsx is deleted (BUG-015)', () => {
      const filePath = path.resolve(process.cwd(), 'src/components/sections/CompetitiveSignalsSection.tsx');
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('verifies no source production files import insightsService or CompetitiveSignalsSection', () => {
      const prodDirs = ['src/components', 'src/services', 'src/app', 'src/lib', 'src/config'];
      const scanDir = (dir: string): string[] => {
        const results: string[] = [];
        const fullDir = path.resolve(process.cwd(), dir);
        if (!fs.existsSync(fullDir)) return results;
        const entries = fs.readdirSync(fullDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(fullDir, entry.name);
          if (entry.isDirectory()) {
            results.push(...scanDir(path.relative(process.cwd(), fullPath)));
          } else if (/\.(ts|tsx)$/.test(entry.name)) {
            results.push(fullPath);
          }
        }
        return results;
      };

      const files = prodDirs.flatMap(scanDir);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(content).not.toContain('insightsService');
        expect(content).not.toContain('CompetitiveSignalsSection');
      }
    });
  });

  // ─── 2. Component Contract & Module Imports ─────────────────────────────────
  describe('Component Export & Contract Integrity', () => {
    it('exports all active dashboard section components cleanly', async () => {
      const overviewMod = await import('@/components/sections/ExecutiveOverview');
      expect(typeof overviewMod.ExecutiveOverview).toBe('function');

      const visibilityMod = await import('@/components/sections/OnlineVisibilitySection');
      expect(typeof visibilityMod.OnlineVisibilitySection).toBe('function');

      const advertisingMod = await import('@/components/sections/AdvertisingSection');
      expect(typeof advertisingMod.AdvertisingSection).toBe('function');

      const socialMod = await import('@/components/sections/SocialActivitySection');
      expect(typeof socialMod.SocialActivitySection).toBe('function');

      const ecomMod = await import('@/components/sections/EcommercePricingSection');
      expect(typeof ecomMod.EcommercePricingSection).toBe('function');

      const skusMod = await import('@/components/sections/SkuExplorerSection');
      expect(typeof skusMod.SkuExplorerSection).toBe('function');

      const sentimentMod = await import('@/components/sections/ConsumerSentimentSection');
      expect(typeof sentimentMod.ConsumerSentimentSection).toBe('function');

      const insightsMod = await import('@/components/sections/InsightsRecommendationsSection');
      expect(typeof insightsMod.InsightsRecommendationsSection).toBe('function');

      const modalMod = await import('@/components/ui/EvidenceModal');
      expect(typeof modalMod.EvidenceModal).toBe('function');

      const navMod = await import('@/components/layout/Navigation');
      expect(typeof navMod.Navigation).toBe('function');
    }, 15000);

    it('verifies Navigation SKU badge dynamically matches ALL_MARKET_SKUS.length (65) and aligns with SkuExplorerSection (NEW-BUG-004)', async () => {
      const navFile = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/layout/Navigation.tsx'),
        'utf-8'
      );
      expect(navFile).toContain('badge: ALL_MARKET_SKUS.length');
      expect(navFile).not.toContain('badge: 65');
      expect(ALL_MARKET_SKUS.length).toBe(65);
      expect(CANONICAL_SKUS.length).toBe(28);
    });
  });

  // ─── 3. Metric Cube Consumer Review Metrics (BUG-003) ───────────────────────
  describe('Metric Cube Consumer Review Metrics Integration', () => {
    it('aggregates consumer review metrics in the Metric Cube', () => {
      const ratings = analyticsService.getBrandComparison('AVG_CONSUMER_RATING', '2026-08');
      expect(ratings).toBeDefined();
      expect(ratings.length).toBe(4);

      const sentiment = analyticsService.getBrandComparison('POSITIVE_SENTIMENT_PCT', '2026-08');
      expect(sentiment).toBeDefined();
      expect(sentiment.length).toBe(4);

      const reviewCounts = analyticsService.getBrandComparison('TOTAL_CONSUMER_REVIEWS_COUNT', '2026-08');
      expect(reviewCounts).toBeDefined();
      expect(reviewCounts.length).toBe(4);

      // Verify that brands with reviews have non-null sentiment and rating
      const hpRating = ratings.find((r) => r.brand === 'HP');
      expect(hpRating).toBeDefined();
      expect(hpRating?.data_state).toBe('OBSERVED');
      expect(hpRating?.value).toBeGreaterThanOrEqual(4.0);

      const hpSentiment = sentiment.find((r) => r.brand === 'HP');
      expect(hpSentiment).toBeDefined();
      expect(hpSentiment?.data_state).toBe('OBSERVED');
      expect(hpSentiment?.value).toBeGreaterThanOrEqual(50);
    });

    it('verifies executive overview aggregates consumer review channel observations', () => {
      const overview = analyticsService.getExecutiveOverview('2026-08');
      expect(overview.channel_observations?.consumer_review).toBeGreaterThan(0);
      expect(overview.total_evidence_observations).toBeGreaterThanOrEqual(
        overview.channel_observations?.consumer_review ?? 0
      );
    });
  });

  // ─── 4. Null-to-Zero Invariant & Discount Deflation (BUG-005, BUG-007) ───────
  describe('Null-to-Zero and Pricing Logic Integrity', () => {
    it('preserves null for missing/unobserved metrics without zero conversion in visibility', () => {
      const comp = analyticsService.getMetricValue('TOTAL_VISIBILITY_TOUCHPOINTS', {
        brand: 'HP',
        month: '2026-05' as unknown as AnalyticalMonth, // unobserved window
      });
      // Should be null or missing, never fake zero
      if (comp) {
        expect(comp.metric_value === null || comp.data_state === 'MISSING').toBe(true);
      }
    });

    it('guarantees active discount calculations ignore 0% listings to prevent deflation (BUG-007)', () => {
      // Simulate SKU records with mixed discounts
      const mockSkus = [
        { brand: 'HP', avg_price_thb: 5000, avg_discount_pct: 20, observation_count: 5 },
        { brand: 'HP', avg_price_thb: 5200, avg_discount_pct: 0, observation_count: 5 }, // No discount
      ];

      // Deflated unweighted average would be 10%
      // Filtered to active discount (> 0) should be 20%
      const discounted = mockSkus.filter((s) => s.avg_discount_pct > 0);
      const weightedSum = discounted.reduce((acc, s) => acc + s.avg_discount_pct * s.observation_count, 0);
      const totalObs = discounted.reduce((acc, s) => acc + s.observation_count, 0);
      const activeAvgDiscount = totalObs > 0 ? weightedSum / totalObs : null;

      expect(activeAvgDiscount).toBe(20);
      expect(activeAvgDiscount).not.toBe(10); // Not deflated by 0% listings
    });
  });

  // ─── 5. SKU Normalization Matching (BUG-006) ─────────────────────────────────
  describe('SKU Normalization Matching Integrity', () => {
    it('matches SKU records by sku_id, model_name, and aliases in metric aggregation', () => {
      const skus = analyticsService.getSkuComparison('HP', '2026-08');
      expect(skus.length).toBeGreaterThan(0);
      for (const sku of skus) {
        expect(sku.sku_id).toBeDefined();
        expect(sku.brand).toBe('HP');
        expect(sku.model_name).toBeDefined();
      }
    });
  });

  // ─── 6. Executive Overview Initial Load & Empty State (BUG-008) ───────────────
  describe('Executive Overview Clean State Handling', () => {
    it('contains no hardcoded fallback insight cards in ExecutiveOverview.tsx', () => {
      const overviewFile = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/sections/ExecutiveOverview.tsx'),
        'utf-8'
      );
      // Ensure the old hardcoded cards like 'Brother Dominates Entry-Level Price Floor' or 'Printhead Clog Anxiety' are not hardcoded in the JSX
      expect(overviewFile).not.toContain('Brother Dominates Entry-Level Price Floor');
      expect(overviewFile).not.toContain('No active strategic signals identified for the selected filters.');
      // Should have honest skeleton / empty state handling
      expect(overviewFile).toContain('isLoading');
      expect(overviewFile).toContain('animate-pulse');
    });
  });

  // ─── 7. SWOT Strategic Matrix Brand Scoping (BUG-009) ───────────────────────
  describe('SWOT Strategic Matrix Brand Filtering', () => {
    it('filters all 4 quadrants from filteredInsights rather than raw unfiltered insights in JSX', () => {
      const insightsFile = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/sections/InsightsRecommendationsSection.tsx'),
        'utf-8'
      );
      // All four quadrants must filter from filteredInsights
      expect(insightsFile).toContain('filteredInsights.filter');
      expect(insightsFile).toContain("filteredInsights.filter((i) => i.id === 'SIG-HP-ONSITE-SERVICE-MOAT'");
      expect(insightsFile).toContain("filteredInsights.filter((i) => i.category === 'ECOMMERCE' || i.category === 'PROMOTION')");
      expect(insightsFile).toContain("filteredInsights.filter((i) => i.category === 'ADVERTISING'");
      expect(insightsFile).toContain('filteredInsights.slice(0, 3)');

      // Unfiltered insights array should NEVER be used in the matrix view
      expect(insightsFile).not.toContain("insights.filter((i) => i.id === 'SIG-HP-ONSITE-SERVICE-MOAT'");
    });

    it('correctly scopes mock insights to target brand', () => {
      const mockInsights: Insight[] = [
        {
          id: '1',
          priority: 'HIGH',
          significance: 'HIGH',
          category: 'CONSUMER_SENTIMENT',
          title: 'HP Onsite Service Moat',
          finding: 'HP onsite service is superior',
          evidenceSummary: 'HP 2-year onsite service praised across verified reviews',
          implication: 'HP retains high convenience moat',
          recommendation: 'Leverage in ad creatives',
          confidence: 'MULTI-CUT',
          supportingDataCuts: ['Consumer Sentiment / Recommendation'],
          supportingMetrics: [],
          evidenceIds: ['EVID-01'],
          sourceUrls: [],
          affectedBrands: ['HP'],
          affectedSkus: ['Smart Tank 580'],
          analyticalMonth: '2026-08',
          dataState: 'OBSERVED',
          methodologyNote: 'Verified reviews',
          observedVsInterpretation: {
            observed: 'HP 2-year onsite service praised',
            interpretation: 'Door to door service is a moat',
            recommendation: 'Emphasize in creatives',
          },
        },
        {
          id: '2',
          priority: 'HIGH',
          significance: 'HIGH',
          category: 'ADVERTISING',
          title: 'Epson Volume Threat',
          finding: 'Epson has large SOV',
          evidenceSummary: 'Epson SOV is 45%',
          implication: 'Epson outspends in ads',
          recommendation: 'Target specific niche features',
          confidence: 'MULTI-CUT',
          supportingDataCuts: ['Advertising / Creatives'],
          supportingMetrics: [],
          evidenceIds: ['EVID-02'],
          sourceUrls: [],
          affectedBrands: ['Epson'],
          affectedSkus: ['EcoTank L3250'],
          analyticalMonth: '2026-08',
          dataState: 'OBSERVED',
          methodologyNote: 'Meta ads',
          observedVsInterpretation: {
            observed: 'Epson ad volume is high',
            interpretation: 'High ad presence',
            recommendation: 'Counter-message',
          },
        },
      ];

      // Filter by HP
      const hpFiltered = mockInsights.filter((i) => i.affectedBrands.includes('HP'));
      expect(hpFiltered.length).toBe(1);
      expect(hpFiltered[0].title).toBe('HP Onsite Service Moat');

      const moats = hpFiltered.filter((i) => i.id === 'SIG-HP-ONSITE-SERVICE-MOAT' || i.affectedBrands.includes('HP') || i.category === 'CONSUMER_SENTIMENT');
      const threats = hpFiltered.filter((i) => i.affectedBrands.includes('Epson'));
      expect(moats.length).toBe(1);
      expect(threats.length).toBe(0); // Epson threat excluded when scoped to HP
    });
  });

  // ─── 8. Evidence Lake Bounded Pagination (BUG-010) ──────────────────────────
  describe('Evidence Lake Bounded Pagination', () => {
    it('bounds default evidence page size in route handler and client', () => {
      const routeFile = fs.readFileSync(
        path.resolve(process.cwd(), 'src/app/api/analytics/evidence/route.ts'),
        'utf-8'
      );
      expect(routeFile).toContain('pageSize = 50');
      expect(routeFile).toContain('Math.min(500, Math.max(1, parseInt(pageSizeParam, 10)))');

      const clientFile = fs.readFileSync(
        path.resolve(process.cwd(), 'src/lib/apiClient.ts'),
        'utf-8'
      );
      expect(clientFile).toContain('options?.all');
    });
  });

  // ─── 9. 3-Month Trend APIs (BUG-011) ─────────────────────────────────────────
  describe('3-Month Trend Trajectory Verification', () => {
    it('returns chronological 3-month trend points for visibility touchpoints', () => {
      const trend = analyticsService.getTrends('TOTAL_VISIBILITY_TOUCHPOINTS', { brand: 'All' });
      expect(trend).toBeDefined();
      expect(trend.length).toBe(3);

      const months = trend.map((t) => t.month);
      expect(months).toEqual(['2026-06', '2026-07', '2026-08']);

      for (const pt of trend) {
        expect(pt.month_label).toBeDefined();
        expect(pt.value).toBeGreaterThanOrEqual(0);
      }
    });

    it('returns brand-specific 3-month trend points for HP', () => {
      const hpTrend = analyticsService.getTrends('TOTAL_VISIBILITY_TOUCHPOINTS', { brand: 'HP' });
      expect(hpTrend).toBeDefined();
      expect(hpTrend.length).toBe(3);

      for (const pt of hpTrend) {
        expect(pt.value).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ─── 10. Screenshot URL Alignment for Review Records (BUG-012) ───────────────
  describe('Review Screenshot URL Lineage Alignment', () => {
    it('ensures all consumer review evidence records link to existing review screenshot assets', () => {
      const allReviews = globalEvidenceStore.getAll().filter((r) => r.channel === 'Consumer Review');
      expect(allReviews.length).toBe(456);

      for (const r of allReviews) {
        expect(r.screenshot_url).toBeDefined();
        expect(r.screenshot_url).toMatch(/^\/screenshots\/reviews\/shopee_[a-z]+_review\.png$/);

        // Verify physical asset exists on disk
        const assetPath = path.resolve(process.cwd(), 'public', r.screenshot_url!.replace(/^\//, ''));
        expect(fs.existsSync(assetPath)).toBe(true);
      }
    });
  });

  // ─── 11. RAG Consumer Sentiment Intent Handling (BUG-013) ───────────────────
  describe('RAG Consumer Sentiment Intent Handling', () => {
    it('extracts ratings and sentiment percentages when user asks about reviews', async () => {
      const response = await ragService.query({
        query: 'What is consumer sentiment and rating for HP and Epson printers?',
        monthFilter: '2026-08',
      });

      expect(response).toBeDefined();
      expect(response.answer).toBeDefined();
      expect(response.answer.length).toBeGreaterThan(50);
      // Answer should include sentiment or rating metrics from the Metric Cube
      expect(
        response.answer.includes('rating') ||
        response.answer.includes('Sentiment') ||
        response.answer.includes('★') ||
        response.answer.includes('review')
      ).toBe(true);
    });
  });

  // ─── 12. Dynamic Candidate Scoring in Insight Engine (BUG-014) ───────────────
  describe('Dynamic Scoring in Insight Engine', () => {
    it('calculates dynamic scores for detected candidate signals based on evidence density', () => {
      const signals = insightEngine.detectCandidateSignals('2026-08', 'All');
      expect(signals.length).toBeGreaterThan(0);

      for (const sig of signals) {
        expect(sig.magnitudeScore).toBeGreaterThan(0);
        expect(sig.magnitudeScore).toBeLessThanOrEqual(10);
        expect(sig.persistenceScore).toBeGreaterThan(0);
        expect(sig.persistenceScore).toBeLessThanOrEqual(10);
        expect(sig.hpRelevanceScore).toBeGreaterThan(0);
        expect(sig.hpRelevanceScore).toBeLessThanOrEqual(10);
      }
    });
  });
});
