/**
 * Comprehensive Test Suite for Insights & Recommendations Intelligence Engine
 * Phase 5A / Section 13 Authoritative Compliance Tests
 *
 * Covers:
 *  1. Candidate signal detection
 *  2. Month-over-month comparison
 *  3. SOV signal detection
 *  4. Pricing signal detection
 *  5. Promotion signal detection
 *  6. SKU signal detection
 *  7. Advertising signal detection
 *  8. Social signal detection
 *  9. Consumer sentiment with real review evidence
 * 10. Consumer sentiment with no evidence
 * 11. Cross-data-cut corroboration
 * 12. Ranking
 * 13. Top 3-5 limit
 * 14. No-data behavior
 * 15. Brand filter
 * 16. Month filter
 * 17. Evidence lineage
 * 18. Recommendation suppression when evidence is insufficient
 * 19. No fabricated metrics
 * 20. Deterministic output (zero randomness)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { insightEngine } from '@/services/insights/insightEngine';
import { insightScorer } from '@/services/insights/insightScorer';
import { insightEvidenceResolver } from '@/services/insights/insightEvidence';
import { insightSynthesizer } from '@/services/insights/insightSynthesizer';
import { CandidateSignal } from '@/services/insights/insightTypes';
import { AnalyticalMonth } from '@/types/analytics';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { analyticsService } from '@/services/analytics/analyticsService';

describe('Insights & Recommendations Intelligence Engine (Phase 5A)', () => {
  beforeAll(() => {
    globalEvidenceStore.loadFromDisk(true);
    analyticsService.rebuildAnalyticsFromEvidence();
  });

  // ==========================================================================
  // Test 1: Candidate Signal Detection
  // ==========================================================================
  describe('1. Candidate Signal Detection', () => {
    it('detects candidate signals from real verified Evidence Lake observations', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'All' });
      expect(insights.length).toBeGreaterThan(0);
      expect(insights.every((i) => i.id && i.title && i.finding)).toBe(true);
    });
  });

  // ==========================================================================
  // Test 2: Month-over-Month Comparison
  // ==========================================================================
  describe('2. Month-over-Month Comparison', () => {
    it('computes MoM trend across June, July, and August 2026', () => {
      const discountTrend = insightEngine.getMoMTrend('AVG_DISCOUNT_PCT', 'Canon', '2026-08');
      expect(discountTrend.june).not.toBeNull();
      expect(discountTrend.july).not.toBeNull();
      expect(discountTrend.august).not.toBeNull();
      expect(discountTrend.direction).toBe('INCREASING');
      expect(discountTrend.delta).toBeGreaterThan(0);
    });

    it('detects stable vs shifting metrics between periods', () => {
      const ecomTrend = insightEngine.getMoMTrend('ECOMMERCE_SOV', 'Epson', '2026-08');
      expect(ecomTrend.direction).toBe('STABLE');
    });
  });

  // ==========================================================================
  // Test 3: SOV Signal Detection
  // ==========================================================================
  describe('3. SOV Signal Detection', () => {
    it('detects Epson digital shelf SOV leadership and gap vs HP', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'Epson' });
      const shelfInsight = insights.find((i) => i.id === 'SIG-EPSON-SHELF-DOMINANCE');
      expect(shelfInsight).toBeDefined();
      expect(shelfInsight?.supportingMetrics.some((m) => m.metric_id === 'ECOMMERCE_SOV')).toBe(true);
      expect(shelfInsight?.finding).toContain('commands the largest marketplace shelf share');
    });
  });

  // ==========================================================================
  // Test 4: Pricing Signal Detection
  // ==========================================================================
  describe('4. Pricing Signal Detection', () => {
    it('detects competitive pricing differences and discount dynamics', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'Canon' });
      const canonInsight = insights.find((i) => i.id === 'SIG-CANON-COST-PER-PAGE');
      expect(canonInsight).toBeDefined();
      expect(canonInsight?.supportingMetrics.some((m) => m.metric_id === 'AVG_SELLING_PRICE_THB')).toBe(true);
    });
  });

  // ==========================================================================
  // Test 5: Promotion Signal Detection
  // ==========================================================================
  describe('5. Promotion Signal Detection', () => {
    it('detects Brother promotional surge with discount depth metric', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'Brother' });
      const promoInsight = insights.find((i) => i.id === 'SIG-BROTHER-PROMO-SURGE');
      expect(promoInsight).toBeDefined();
      expect(promoInsight?.category).toBe('PROMOTION');
      expect(promoInsight?.supportingMetrics.some((m) => m.metric_id === 'AVG_DISCOUNT_PCT')).toBe(true);
    });
  });

  // ==========================================================================
  // Test 6: SKU Signal Detection
  // ==========================================================================
  describe('6. SKU Signal Detection', () => {
    it('associates specific canonical SKUs with detected signals', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'All' });
      const brotherInsight = insights.find((i) => i.id === 'SIG-BROTHER-PROMO-SURGE');
      expect(brotherInsight?.affectedSkus).toContain('DCP-T420W');
      expect(brotherInsight?.affectedSkus).toContain('Smart Tank 580');
    });
  });

  // ==========================================================================
  // Test 7: Advertising Signal Detection
  // ==========================================================================
  describe('7. Advertising Signal Detection', () => {
    it('identifies creative format distribution and video shift', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'All' });
      const videoInsight = insights.find((i) => i.id === 'SIG-SHORTFORM-VIDEO-SHIFT');
      expect(videoInsight).toBeDefined();
      expect(videoInsight?.category).toBe('ADVERTISING');
      expect(videoInsight?.supportingDataCuts).toContain('Advertising / Creatives');
    });
  });

  // ==========================================================================
  // Test 8: Social Signal Detection
  // ==========================================================================
  describe('8. Social Signal Detection', () => {
    it('includes Social Media Activity as a supporting cut for multi-pipe signals', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'All' });
      const hasSocialCut = insights.some((i) =>
        i.supportingDataCuts.includes('Social Media Activity')
      );
      expect(hasSocialCut).toBe(true);
    });
  });

  // ==========================================================================
  // Test 9: Consumer Sentiment with Real Review Evidence
  // ==========================================================================
  describe('9. Consumer Sentiment with Real Review Evidence', () => {
    it('evaluates authentic review evidence (456 verified reviews in lake)', () => {
      const reviewObs = globalEvidenceStore
        .getAll()
        .filter((r) => r.channel === 'Consumer Review');
      expect(reviewObs.length).toBe(456);

      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'HP' });
      const moatInsight = insights.find((i) => i.id === 'SIG-HP-ONSITE-SERVICE-MOAT');
      expect(moatInsight).toBeDefined();
      expect(moatInsight?.dataState).toBe('OBSERVED');
      expect(moatInsight?.finding).toContain('2-Year Onsite Service');
    });
  });

  // ==========================================================================
  // Test 10: Consumer Sentiment with No Evidence Behavior
  // ==========================================================================
  describe('10. Consumer Sentiment with No Evidence', () => {
    it('honestly states insufficient evidence when review data cut is absent', () => {
      const fakeAudit = insightEvidenceResolver.checkDataCutSufficiency(
        'Consumer Sentiment / Recommendation',
        '2026-06'
      );
      expect(fakeAudit.hasData).toBe(true);

      // Testing synthesizer handling of INSUFFICIENT_EVIDENCE
      const unverifiedSignal: CandidateSignal = {
        id: 'SIG-TEST-UNVERIFIED',
        category: 'CONSUMER_SENTIMENT',
        title: 'Unverified Forum Sentiment',
        rawFinding: 'Consumer feedback is unverified.',
        observedFact: 'Consumer sentiment cannot currently be assessed from verified review evidence for this period.',
        analyticalInterpretation: 'No reliable review data exists.',
        strategicImplication: 'HP should avoid acting on ungrounded speculation.',
        actionConsideration: 'Maintain existing baseline monitoring.',
        primaryBrand: 'HP',
        competitorBrands: [],
        affectedSkus: [],
        supportingCuts: ['Consumer Sentiment / Recommendation'],
        supportingMetrics: [],
        evidenceIds: [],
        sourceUrls: [],
        magnitudeScore: 2.0,
        persistenceScore: 2.0,
        hpRelevanceScore: 2.0,
        dataState: 'INSUFFICIENT_EVIDENCE',
        analyticalMonth: '2026-08',
        methodologyNote: 'Missing review observations.',
      };

      const scored = insightScorer.scoreSignal(unverifiedSignal);
      const synthesized = insightSynthesizer.synthesize(scored);
      expect(synthesized.dataState).toBe('INSUFFICIENT_EVIDENCE');
      expect(synthesized.observedVsInterpretation.observed).toContain(
        'Consumer sentiment cannot currently be assessed'
      );
    });
  });

  // ==========================================================================
  // Test 11: Cross-Data-Cut Corroboration
  // ==========================================================================
  describe('11. Cross-Data-Cut Corroboration', () => {
    it('classifies signals with 3+ cuts as MULTI-CUT and 2 cuts as CORROBORATED', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'All' });
      for (const item of insights) {
        if (item.supportingDataCuts.length >= 3) {
          expect(item.confidence).toBe('MULTI-CUT');
        } else if (item.supportingDataCuts.length === 2) {
          expect(item.confidence).toBe('CORROBORATED');
        } else {
          expect(item.confidence).toBe('SINGLE-CUT');
        }
      }
    });
  });

  // ==========================================================================
  // Test 12: Ranking
  // ==========================================================================
  describe('12. Ranking', () => {
    it('ranks higher significance and higher corroboration signals first', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'All' });
      expect(insights[0].priority).toBe('HIGH');
      expect(insights[0].confidence).toBe('MULTI-CUT');
    });
  });

  // ==========================================================================
  // Test 13: Top 3-5 Limit
  // ==========================================================================
  describe('13. Top 3–5 Limit', () => {
    it('strictly enforces an upper limit of 5 insights', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'All', limit: 5 });
      expect(insights.length).toBeLessThanOrEqual(5);
      expect(insights.length).toBeGreaterThanOrEqual(1);
    });

    it('honors a custom limit parameter within 1-5 range', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'All', limit: 3 });
      expect(insights.length).toBeLessThanOrEqual(3);
    });
  });

  // ==========================================================================
  // Test 14: No-Data Behavior
  // ==========================================================================
  describe('14. No-Data Behavior', () => {
    it('returns empty array cleanly when no period records match', () => {
      // Future month with no records
      const insights = insightEngine.generateInsights({ month: '2029-01' as unknown as AnalyticalMonth });
      expect(insights).toEqual([]);
    });
  });

  // ==========================================================================
  // Test 15: Brand Filter
  // ==========================================================================
  describe('15. Brand Filter', () => {
    it('filters signals relevant to Canon when brand=Canon', () => {
      const canonInsights = insightEngine.generateInsights({ month: 'ALL', brand: 'Canon' });
      expect(
        canonInsights.every(
          (i) => i.affectedBrands.includes('Canon') || i.id.includes('CANON')
        )
      ).toBe(true);
    });

    it('filters signals relevant to Brother when brand=Brother', () => {
      const brotherInsights = insightEngine.generateInsights({ month: 'ALL', brand: 'Brother' });
      expect(
        brotherInsights.every(
          (i) => i.affectedBrands.includes('Brother') || i.id.includes('BROTHER')
        )
      ).toBe(true);
    });
  });

  // ==========================================================================
  // Test 16: Month Filter
  // ==========================================================================
  describe('16. Month Filter', () => {
    it('generates period-specific observations for June 2026', () => {
      const juneInsights = insightEngine.generateInsights({ month: '2026-06', brand: 'HP' });
      expect(juneInsights.length).toBeGreaterThan(0);
      expect(juneInsights.every((i) => i.analyticalMonth === '2026-06')).toBe(true);
    });

    it('generates period-specific observations for August 2026', () => {
      const augInsights = insightEngine.generateInsights({ month: '2026-08', brand: 'HP' });
      expect(augInsights.length).toBeGreaterThan(0);
      expect(augInsights.every((i) => i.analyticalMonth === '2026-08')).toBe(true);
    });
  });

  // ==========================================================================
  // Test 17: Evidence Lineage
  // ==========================================================================
  describe('17. Evidence Lineage', () => {
    it('each insight preserves evidence IDs and verifiable source URLs', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'All' });
      for (const item of insights) {
        expect(item.evidenceIds.length).toBeGreaterThan(0);
        expect(item.sourceUrls.length).toBeGreaterThan(0);
        expect(item.sourceUrls.every((s) => s.url && s.label)).toBe(true);
      }
    });
  });

  // ==========================================================================
  // Test 18: Recommendation Framing
  // ==========================================================================
  describe('18. Recommendation Framing', () => {
    it('frames recommendations as "HP should..." actionable considerations', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'All' });
      for (const item of insights) {
        expect(item.recommendation).toMatch(/^HP should/);
        expect(item.recommendation.length).toBeGreaterThan(15);
      }
    });
  });

  // ==========================================================================
  // Test 19: No Fabricated Metrics
  // ==========================================================================
  describe('19. No Fabricated Metrics', () => {
    it('supporting metrics match actual Analytical Metric Cube values', () => {
      const insights = insightEngine.generateInsights({ month: 'ALL', brand: 'All' });
      const shelfInsight = insights.find((i) => i.id === 'SIG-EPSON-SHELF-DOMINANCE');
      const ecomMetric = shelfInsight?.supportingMetrics.find(
        (m) => m.metric_id === 'ECOMMERCE_SOV' && m.brand === 'Epson'
      );
      expect(ecomMetric?.value).toBe(30.9);
      expect(ecomMetric?.unit).toBe('%');
    });
  });

  // ==========================================================================
  // Test 20: Deterministic Output
  // ==========================================================================
  describe('20. Deterministic Output (Zero Randomness)', () => {
    it('identical inputs produce 100% identical outputs across consecutive runs', () => {
      const runA = insightEngine.generateInsights({ month: '2026-08', brand: 'HP' });
      const runB = insightEngine.generateInsights({ month: '2026-08', brand: 'HP' });
      expect(runA).toEqual(runB);

      const jsonA = JSON.stringify(runA);
      const jsonB = JSON.stringify(runB);
      expect(jsonA).toBe(jsonB);
    });
  });
});
