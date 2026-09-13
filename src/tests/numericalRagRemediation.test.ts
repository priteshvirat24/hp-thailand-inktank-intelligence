/**
 * Phase 18 — Complete Numerical RAG Remediation & Adversarial Validation Test Suite
 * 
 * Verifies:
 * - RAG-NUM-BUG-001: Ad Reach / Impressions Hallucination Prevention
 * - RAG-NUM-BUG-002: Deterministic Ranking & Comparative Inversion Prevention
 * - RAG-NUM-BUG-003: SKU Count Metric Mapping & Assortment Universe
 * - RAG-NUM-BUG-004: Rated Reviews vs Unrated Consumer Voice Semantic Distinction
 * - RAG-NUM-BUG-005: TypeScript ExecutiveOverviewProps Compilation
 * - Deterministic Post-Generation Numerical Validation & Adversarial Repairs
 */

import { describe, it, expect } from 'vitest';
import { queryUnderstandingEngine } from '@/services/rag/queryUnderstanding';
import { ragService } from '@/services/rag/ragService';
import {
  computeAuthoritativeRanking,
  validateAndRepairAnswer,
} from '@/services/rag/numericalValidator';
import { RagSupportingMetric } from '@/types/rag';
import { METRIC_DEFINITIONS } from '@/services/analytics/metricRegistry';
import { CANONICAL_SKUS, ALL_MARKET_SKUS } from '@/config/skus';

describe('PHASE 18: RAG-NUM-BUG-001 — Ad Reach / Impressions Domain Boundary', () => {
  it('detects "How many people saw Canon ads in August?" as an unsupported reach query', () => {
    const plan = queryUnderstandingEngine.analyzeQuery({
      query: 'How many people saw Canon ads in August?',
    });

    expect(plan.unsupportedScope).toBeDefined();
    expect(plan.unsupportedScope?.isUnsupported).toBe(true);
    expect(plan.unsupportedScope?.dimension).toBe('Ad Reach / Impressions');
    expect(plan.unsupportedScope?.brand).toBe('Canon');
    expect(plan.unsupportedScope?.explanation).toContain("I don't have verified ad reach or impression data for Canon");
    expect(plan.unsupportedScope?.explanation).toContain('not the number of people reached or impressions generated');
  });

  it('detects natural variations of impressions, reach, views, and audience queries across brands', () => {
    const variations = [
      { q: 'How many impressions did Canon get in August?', brand: 'Canon' },
      { q: 'What is Epson ad reach?', brand: 'Epson' },
      { q: 'How many users saw HP ads in August?', brand: 'HP' },
      { q: 'What was Brother audience size on digital ads?', brand: 'Brother' },
      { q: 'What was the ad viewership for Canon?', brand: 'Canon' },
      { q: 'How many unique impressions did HP achieve?', brand: 'HP' },
      { q: 'How many people reached by Epson campaigns?', brand: 'Epson' },
    ];

    for (const { q, brand } of variations) {
      const plan = queryUnderstandingEngine.analyzeQuery({ query: q });
      expect(plan.unsupportedScope?.isUnsupported, `Failed for "${q}"`).toBe(true);
      expect(plan.unsupportedScope?.dimension).toBe('Ad Reach / Impressions');
      expect(plan.unsupportedScope?.explanation).toContain(brand);
    }
  });

  it('never substitutes AD_PRESENCE_COUNT or touchpoints for ad impressions', async () => {
    const res = await ragService.query({
      query: 'How many people saw Canon ads in August?',
    });

    expect(res.ok).toBe(true);
    expect(res.answer).toContain("I don't have verified ad reach or impression data for Canon");
    expect(res.answer).not.toContain('12.3 million');
    expect(res.answer).not.toContain('touchpoints');
    expect(res.answer).not.toContain('active ads');
  });
});

describe('PHASE 18: RAG-NUM-BUG-002 — Comparative Ranking & Winner Inversion Safety', () => {
  const mockSovMetrics: RagSupportingMetric[] = [
    {
      brand: 'HP',
      month: '2026-08',
      metric_id: 'PAID_MEDIA_SOV',
      metric_name: 'Paid Media Share of Voice %',
      value: 30.8,
      unit: '%',
      observation_count: 52,
      data_state: 'OBSERVED',
      evidence_ids: ['EVID-1'],
    },
    {
      brand: 'Epson',
      month: '2026-08',
      metric_id: 'PAID_MEDIA_SOV',
      metric_name: 'Paid Media Share of Voice %',
      value: 23.1,
      unit: '%',
      observation_count: 52,
      data_state: 'OBSERVED',
      evidence_ids: ['EVID-2'],
    },
    {
      brand: 'Canon',
      month: '2026-08',
      metric_id: 'PAID_MEDIA_SOV',
      metric_name: 'Paid Media Share of Voice %',
      value: 23.1,
      unit: '%',
      observation_count: 52,
      data_state: 'OBSERVED',
      evidence_ids: ['EVID-3'],
    },
    {
      brand: 'Brother',
      month: '2026-08',
      metric_id: 'PAID_MEDIA_SOV',
      metric_name: 'Paid Media Share of Voice %',
      value: 23.1,
      unit: '%',
      observation_count: 52,
      data_state: 'OBSERVED',
      evidence_ids: ['EVID-4'],
    },
  ];

  it('determines HP as the authoritative winner for August advertising presence with tie handling', () => {
    const ranking = computeAuthoritativeRanking(
      mockSovMetrics,
      'Who had the strongest advertising presence in August?'
    );

    expect(ranking).not.toBeNull();
    expect(ranking?.winners).toEqual(['HP']);
    expect(ranking?.rankedBrands[0].brand).toBe('HP');
    expect(ranking?.rankedBrands[0].rank).toBe(1);
    expect(ranking?.rankedBrands[0].value).toBe(30.8);

    // Tied 2nd place for competitors
    const tiedCompetitors = ranking?.rankedBrands.filter((r) => r.rank === 2);
    expect(tiedCompetitors?.length).toBe(3);
    expect(tiedCompetitors?.every((r) => r.value === 23.1 && r.isTied)).toBe(true);

    // Delta calculation
    expect(ranking?.deltaToSecondPlace?.absolute).toBe(7.7);
    expect(ranking?.deltaToSecondPlace?.relativePct).toBe(33.3);
  });

  it('correctly handles ties without inventing a single winner (e.g. HP = 25%, Epson = 25%)', () => {
    const tiedMetrics: RagSupportingMetric[] = [
      { ...mockSovMetrics[0], value: 25.0 },
      { ...mockSovMetrics[1], value: 25.0 },
      { ...mockSovMetrics[2], value: 20.0 },
      { ...mockSovMetrics[3], value: 20.0 },
    ];

    const ranking = computeAuthoritativeRanking(
      tiedMetrics,
      'Who had the strongest advertising presence?'
    );

    expect(ranking?.winners).toEqual(['HP', 'Epson']);
    expect(ranking?.rankedBrands[0].rank).toBe(1);
    expect(ranking?.rankedBrands[1].rank).toBe(1);
    expect(ranking?.rankedBrands[0].isTied).toBe(true);
    expect(ranking?.rankedBrands[1].isTied).toBe(true);
  });

  it('understands metric direction semantics: lowest price is cheapest/winner', () => {
    const priceMetrics: RagSupportingMetric[] = [
      {
        brand: 'HP',
        month: '2026-08',
        metric_id: 'AVG_SELLING_PRICE_THB',
        metric_name: 'Average Selling Price (THB)',
        value: 5733,
        unit: 'THB',
        observation_count: 30,
        data_state: 'OBSERVED',
        evidence_ids: [],
      },
      {
        brand: 'Canon',
        month: '2026-08',
        metric_id: 'AVG_SELLING_PRICE_THB',
        metric_name: 'Average Selling Price (THB)',
        value: 5872,
        unit: 'THB',
        observation_count: 30,
        data_state: 'OBSERVED',
        evidence_ids: [],
      },
    ];

    const ranking = computeAuthoritativeRanking(
      priceMetrics,
      'Who is the cheapest printer brand in August?'
    );

    expect(ranking?.direction).toBe('LOWEST_IS_BEST');
    expect(ranking?.winners).toEqual(['HP']);
    expect(ranking?.deltaToSecondPlace?.absolute).toBe(139);
  });

  it('rejects and repairs LLM ranking inversion where LLM falsely claims Epson won', () => {
    const ranking = computeAuthoritativeRanking(
      mockSovMetrics,
      'Who had the strongest advertising presence in August?'
    );

    const invertedLlmResponse =
      'Epson had the strongest advertising presence in August 2026, recording a 23.1% Paid Media Share of Voice and leading the market.';

    const plan = queryUnderstandingEngine.analyzeQuery({
      query: 'Who had the strongest advertising presence in August?',
    });

    const validation = validateAndRepairAnswer({
      answer: invertedLlmResponse,
      implication: null,
      query: 'Who had the strongest advertising presence in August?',
      plan,
      supportingMetrics: mockSovMetrics,
      authoritativeRanking: ranking,
    });

    expect(validation.isValid).toBe(false);
    expect(validation.wasRepaired).toBe(true);
    expect(validation.violations.some((v) => v.includes('Ranking Inversion'))).toBe(true);
    expect(validation.repairedAnswer).toContain('HP had the strongest observed presence');
    expect(validation.repairedAnswer).toContain('30.8%');
    expect(validation.repairedAnswer).not.toContain('Epson had the strongest');
  });
});

describe('PHASE 18: RAG-NUM-BUG-003 — SKU Count Metric Mapping', () => {
  it('maps "How many SKUs does HP have in August?" to SKU intent and SKU metrics, not touchpoints', () => {
    const plan = queryUnderstandingEngine.analyzeQuery({
      query: 'How many SKUs does HP have in August?',
    });

    expect(plan.intent).toBe('SKU');
    expect(plan.entities.metrics).toContain('CANONICAL_SKU_COUNT');
    expect(plan.entities.metrics).toContain('OBSERVED_SKU_COUNT');
    expect(plan.entities.metrics).toContain('MARKET_SKU_COUNT');
    expect(plan.entities.metrics).not.toContain('TOTAL_VISIBILITY_TOUCHPOINTS');
  });

  it('retrieves accurate SKU universe metrics from Metric Cube definitions', () => {
    // Canonical benchmark SKUs: 7 for HP, 7 for Epson, 8 for Canon, 6 for Brother (total 28)
    const hpCanonical = CANONICAL_SKUS.filter((s) => s.brand === 'HP').length;
    const hpMarket = ALL_MARKET_SKUS.filter((s) => s.brand === 'HP').length;

    expect(hpCanonical).toBe(7);
    expect(hpMarket).toBe(12);

    const canonicalDef = METRIC_DEFINITIONS['CANONICAL_SKU_COUNT'];
    const marketDef = METRIC_DEFINITIONS['MARKET_SKU_COUNT'];

    const mockHpRecords = [{ brand: 'HP' as const, evidence_id: 'E1', channel: 'E-commerce' as const, published_at: '2026-08-15' }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canonicalResult = canonicalDef.calculate(mockHpRecords as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const marketResult = marketDef.calculate(mockHpRecords as any);

    expect(canonicalResult.value).toBe(7);
    expect(marketResult.value).toBe(12);
  });

  it('post-generation validator rejects substituting 286 touchpoints for SKU count', () => {
    const plan = queryUnderstandingEngine.analyzeQuery({
      query: 'How many SKUs does HP have in August?',
    });

    const hallucinatedResponse = 'HP had 286 SKUs in August 2026 across Thai marketplaces.';

    const validation = validateAndRepairAnswer({
      answer: hallucinatedResponse,
      implication: null,
      query: 'How many SKUs does HP have in August?',
      plan,
      supportingMetrics: [],
    });

    expect(validation.isValid).toBe(false);
    expect(validation.wasRepaired).toBe(true);
    expect(validation.violations.some((v) => v.includes('286'))).toBe(true);
    expect(validation.repairedAnswer).toContain('7 canonical benchmark SKUs');
    expect(validation.repairedAnswer).toContain('12 distinct active models observed');
    expect(validation.repairedAnswer).toContain('Total Visibility Touchpoints');
  });
});

describe('PHASE 18: RAG-NUM-BUG-004 — Rated Reviews vs Consumer Voice Semantic Conflation', () => {
  it('distinguishes rated reviews (6) from total customer voice records (58)', () => {
    const ratedDef = METRIC_DEFINITIONS['RATED_REVIEWS_COUNT'];
    const unratedDef = METRIC_DEFINITIONS['UNRATED_CONSUMER_VOICE_COUNT'];
    const totalDef = METRIC_DEFINITIONS['TOTAL_CONSUMER_REVIEWS_COUNT'];

    // Construct sample records mirroring HP August evidence
    const mockEvidence = [
      ...Array.from({ length: 6 }).map((_, i) => ({
        evidence_id: `E-RATED-${i}`,
        brand: 'HP' as const,
        channel: 'Consumer Review' as const,
        platform: 'Shopee' as const,
        rating: 4.5,
      })),
      ...Array.from({ length: 52 }).map((_, i) => ({
        evidence_id: `E-UNRATED-${i}`,
        brand: 'HP' as const,
        channel: 'Consumer Review' as const,
        platform: 'Pantip' as const,
        rating: null,
      })),
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ratedRes = ratedDef.calculate(mockEvidence as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unratedRes = unratedDef.calculate(mockEvidence as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalRes = totalDef.calculate(mockEvidence as any);

    expect(ratedRes.value).toBe(6);
    expect(unratedRes.value).toBe(52);
    expect(totalRes.value).toBe(58);
  });

  it('post-generation validator repairs conflated claim "58 rated reviews"', () => {
    const plan = queryUnderstandingEngine.analyzeQuery({
      query: 'How many customer reviews does HP have?',
    });

    const conflatedResponse = 'HP received 58 rated reviews in August with strong consumer satisfaction.';

    const validation = validateAndRepairAnswer({
      answer: conflatedResponse,
      implication: null,
      query: 'How many customer reviews does HP have?',
      plan,
      supportingMetrics: [],
    });

    expect(validation.wasRepaired).toBe(true);
    expect(validation.repairedAnswer).toContain('customer voice records (including 6 verified rated reviews and 5 unrated Pantip community posts)');
    expect(validation.repairedAnswer).not.toContain('58 rated reviews');
  });

  it('post-generation validator answers "How many rated reviews did HP have?" with 6, not 58', () => {
    const plan = queryUnderstandingEngine.analyzeQuery({
      query: 'How many rated reviews did HP have in August?',
    });

    const wrongResponse = 'HP had 58 reviews recorded in the dataset in August 2026.';

    const validation = validateAndRepairAnswer({
      answer: wrongResponse,
      implication: null,
      query: 'How many rated reviews did HP have in August?',
      plan,
      supportingMetrics: [],
    });

    expect(validation.wasRepaired).toBe(true);
    expect(validation.repairedAnswer).toContain('HP had 6 verified rated customer reviews in August 2026');
    expect(validation.repairedAnswer).toContain('remaining 5 records are unrated community voice discussions captured from Pantip.com');
  });
});

describe('PHASE 18: Adversarial Numerical Validation Suite (Section 39)', () => {
  it('rejects adversarial LLM answer claiming fabricated 12.3 million impressions', () => {
    const plan = queryUnderstandingEngine.analyzeQuery({
      query: 'What was Canon impression reach?',
    });

    const adversarialResponse =
      'According to the Analytical Cube, Canon achieved 12.3 million unique impressions across Meta Ad Library and digital campaigns.';

    const validation = validateAndRepairAnswer({
      answer: adversarialResponse,
      implication: null,
      query: 'What was Canon impression reach?',
      plan,
      supportingMetrics: [],
    });

    expect(validation.isValid).toBe(false);
    expect(validation.wasRepaired).toBe(true);
    expect(validation.repairedAnswer).toContain("I don't have verified ad reach or impression data");
    expect(validation.repairedAnswer).not.toContain('12.3 million');
  });

  it('repairs adversarial LLM answer claiming "69,600 units sold" instead of Sales Traction Index', () => {
    const plan = queryUnderstandingEngine.analyzeQuery({
      query: 'What is HP sales traction?',
    });

    const adversarialResponse =
      'HP demonstrated market leadership having 69,600 units sold across Shopee and Lazada.';

    const validation = validateAndRepairAnswer({
      answer: adversarialResponse,
      implication: null,
      query: 'What is HP sales traction?',
      plan,
      supportingMetrics: [],
    });

    expect(validation.wasRepaired).toBe(true);
    expect(validation.repairedAnswer).toContain('69,600 Observable Cumulative Sales Traction Index');
    expect(validation.repairedAnswer).not.toContain('69,600 units sold');
  });

  it('repairs adversarial LLM answer quoting wrong HP rating (claims 2.5 when Metric Cube is 4.5)', () => {
    const mockRatingMetric: RagSupportingMetric = {
      brand: 'HP',
      month: '2026-08',
      metric_id: 'AVG_CONSUMER_RATING',
      metric_name: 'Average Star Rating (out of 5)',
      value: 4.5,
      unit: 'Score',
      observation_count: 6,
      data_state: 'OBSERVED',
      evidence_ids: [],
    };

    const plan = queryUnderstandingEngine.analyzeQuery({
      query: "What is HP's average rating in August?",
    });

    const adversarialResponse = "HP's average rating was 2.5 in August 2026.";

    const validation = validateAndRepairAnswer({
      answer: adversarialResponse,
      implication: null,
      query: "What is HP's average rating in August?",
      plan,
      supportingMetrics: [mockRatingMetric],
    });

    expect(validation.wasRepaired).toBe(true);
    expect(validation.repairedAnswer).toContain("HP's average rating is 4.5 / 5");
  });

  it('returns null ranking when all values are null/missing (Section 41: Missing Data Ranking)', () => {
    const missingMetrics: RagSupportingMetric[] = [
      {
        brand: 'HP',
        month: '2026-08',
        metric_id: 'PAID_MEDIA_SOV',
        metric_name: 'Paid Media Share of Voice %',
        value: null,
        unit: '%',
        observation_count: 0,
        data_state: 'MISSING',
        evidence_ids: [],
      },
      {
        brand: 'Epson',
        month: '2026-08',
        metric_id: 'PAID_MEDIA_SOV',
        metric_name: 'Paid Media Share of Voice %',
        value: null,
        unit: '%',
        observation_count: 0,
        data_state: 'MISSING',
        evidence_ids: [],
      },
    ];

    const ranking = computeAuthoritativeRanking(
      missingMetrics,
      'Who had the strongest advertising presence?'
    );

    expect(ranking).toBeNull();
  });
});
