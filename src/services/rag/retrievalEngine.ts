/**
 * Hybrid RAG Retrieval Engine
 * 
 * Combines:
 * 1. Analytical Cube Retrieval (for quantitative, SOV, pricing, and traction queries)
 * 2. Exact & Keyword Retrieval (for SKU names, Thai keywords, platform entities)
 * 3. Vector Semantic Retrieval (when embeddings are configured)
 * 4. Deterministic Fallback Hybrid Ranking
 */

import {
  RagQuery,
  RagEvidenceChunk,
  RagRetrievalResult,
  RagSupportingMetric,
  RetrievalMethod,
  StructuredQueryPlan,
} from '@/types/rag';
import { MetricId, AnalyticalMonth } from '@/types/analytics';
import { TargetBrand } from '@/types/brands';
import { TARGET_BRANDS } from '@/config/brands';
import { CANONICAL_SKUS } from '@/config/skus';
import { analyticsService } from '@/services/analytics/analyticsService';
import { METRIC_DEFINITIONS } from '@/services/analytics/metricRegistry';
import { serverEmbeddingProvider } from './embeddings/provider';
import { queryUnderstandingEngine } from './queryUnderstanding';

function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0E00-\u0E7F]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function isAllOrEmpty(val?: string | null): boolean {
  if (!val) return true;
  const upper = val.trim().toUpperCase();
  return upper === 'ALL' || upper === '' || upper === 'UNDEFINED' || upper === 'NULL';
}

export class RetrievalEngine {
  /**
   * Retrieves supporting analytical metrics from the Analytical Cube based on structured query intent.
   */
  public retrieveRelevantMetrics(
    query: RagQuery,
    plan?: StructuredQueryPlan
  ): RagSupportingMetric[] {
    const effectivePlan = plan || queryUnderstandingEngine.analyzeQuery(query);
    const metricsToFetch: MetricId[] = [];

    // 1. Primary path: Use Structured Query Plan metrics
    if (effectivePlan.entities.metrics && effectivePlan.entities.metrics.length > 0) {
      metricsToFetch.push(...effectivePlan.entities.metrics);
    }

    // 2. Deterministic helper fallback (preserves safety if plan has no metrics)
    if (metricsToFetch.length === 0) {
      const qLower = query.query.toLowerCase();
      if (qLower.includes('sov') || qLower.includes('share of voice') || qLower.includes('visibility share')) {
        metricsToFetch.push('PAID_MEDIA_SOV', 'SOCIAL_SOV', 'ECOMMERCE_SOV');
      }
      if (qLower.includes('price') || qLower.includes('pricing') || qLower.includes('cost') || qLower.includes('ราคา') || qLower.includes('บาท')) {
        metricsToFetch.push('AVG_SELLING_PRICE_THB', 'MEDIAN_SELLING_PRICE_THB', 'AVG_DISCOUNT_PCT');
      }
      if (qLower.includes('discount') || qLower.includes('promo') || qLower.includes('promotion') || qLower.includes('ส่วนลด') || qLower.includes('โปร')) {
        metricsToFetch.push('AVG_DISCOUNT_PCT', 'PROMO_PENETRATION_PCT');
      }
      if (qLower.includes('ad') || qLower.includes('advertising') || qLower.includes('creative') || qLower.includes('โฆษณา')) {
        metricsToFetch.push(
          'AD_PRESENCE_COUNT',
          'CREATIVE_FORMAT_VIDEO_COUNT',
          'CREATIVE_FORMAT_STATIC_COUNT',
          'CREATIVE_FORMAT_CAROUSEL_COUNT'
        );
      }
      if (qLower.includes('social') || qLower.includes('post') || qLower.includes('engagement') || qLower.includes('โพสต์')) {
        metricsToFetch.push('SOCIAL_POSTS_COUNT', 'TOTAL_SOCIAL_ENGAGEMENT');
      }
      if (qLower.includes('sales') || qLower.includes('traction') || qLower.includes('sold') || qLower.includes('ยอดขาย')) {
        metricsToFetch.push('OBSERVABLE_SALES_TRACTION_INDEX');
      }
      if (qLower.includes('touchpoint') || qLower.includes('visibility') || qLower.includes('presence')) {
        metricsToFetch.push('TOTAL_VISIBILITY_TOUCHPOINTS');
      }
    }

    // Final fallback
    if (metricsToFetch.length === 0) {
      metricsToFetch.push('TOTAL_VISIBILITY_TOUCHPOINTS', 'ECOMMERCE_SOV', 'AVG_SELLING_PRICE_THB');
    }

    const uniqueMetrics = Array.from(new Set(metricsToFetch));
    // Query-level explicit month entity takes precedence over UI dashboard filter (RAG-BUG-003)
    const targetMonth = (effectivePlan.entities.month 
      ? effectivePlan.entities.month 
      : (!isAllOrEmpty(query.monthFilter) ? query.monthFilter : '2026-08')) as AnalyticalMonth;

    // Resolve target brands: Query-level explicit brand entity takes precedence over UI dashboard filter (RAG-BUG-003)
    let targetBrands: readonly TargetBrand[];
    if (effectivePlan.entities.brands.length > 0 && effectivePlan.entities.brands.length < TARGET_BRANDS.length) {
      const combined = new Set<TargetBrand>(effectivePlan.entities.brands);
      for (const cb of effectivePlan.entities.comparisonBrands) {
        combined.add(cb);
      }
      // For strategic recommendations, always include HP to evaluate competitive gap against target competitor
      if (effectivePlan.intent === 'RECOMMENDATION' || effectivePlan.subIntents.includes('RECOMMENDATION')) {
        combined.add('HP');
      }
      targetBrands = Array.from(combined);
    } else if (!isAllOrEmpty(query.brandFilter)) {
      const bSet = new Set<TargetBrand>([query.brandFilter as TargetBrand]);
      if (effectivePlan.intent === 'RECOMMENDATION' || effectivePlan.subIntents.includes('RECOMMENDATION')) {
        bSet.add('HP');
      }
      targetBrands = Array.from(bSet);
    } else {
      targetBrands = TARGET_BRANDS;
    }

    const results: RagSupportingMetric[] = [];

    for (const metricId of uniqueMetrics) {
      const def = METRIC_DEFINITIONS[metricId];
      if (!def) continue;

      for (const brand of targetBrands) {
        const row = analyticsService.getMetricValue(metricId, {
          brand,
          month: targetMonth,
          sku_id: !isAllOrEmpty(query.skuFilter) ? query.skuFilter : 'All',
        });

        results.push({
          metric_id: metricId,
          metric_name: def.name,
          brand,
          month: targetMonth,
          value: row ? row.metric_value : null,
          unit: def.unit,
          data_state: row ? row.data_state : 'MISSING',
          observation_count: row ? row.observation_count : 0,
          evidence_ids: row ? row.evidence_ids : [],
        });
      }
    }

    return results;
  }

  /**
   * Retrieves relevant evidence chunks using hybrid lexical + semantic retrieval.
   */
  public async retrieveRelevantChunks(
    query: RagQuery,
    allChunks: readonly RagEvidenceChunk[],
    topK = 8,
    plan?: StructuredQueryPlan
  ): Promise<RagRetrievalResult[]> {
    if (allChunks.length === 0) return [];

    const effectivePlan = plan || queryUnderstandingEngine.analyzeQuery(query);

    // 1. Structured metadata filtering with query entity precedence (RAG-BUG-003)
    let candidateChunks = [...allChunks];

    // Priority 1: Query-level brand entities override UI filter
    const effectiveBrands = (effectivePlan.entities.brands.length > 0 && effectivePlan.entities.brands.length < TARGET_BRANDS.length)
      ? effectivePlan.entities.brands
      : (!isAllOrEmpty(query.brandFilter) ? [query.brandFilter as TargetBrand] : []);

    if (effectiveBrands.length > 0) {
      const targetBrandSet = new Set<string>(effectiveBrands.map((b) => b.toLowerCase()));
      for (const cb of effectivePlan.entities.comparisonBrands) {
        targetBrandSet.add(cb.toLowerCase());
      }
      candidateChunks = candidateChunks.filter((c) => targetBrandSet.has(c.brand.toLowerCase()));
    }

    // Priority 2: Query-level month entities override UI filter (RAG-BUG-003, RAG-BUG-008)
    const effectiveMonth = effectivePlan.entities.month
      ? effectivePlan.entities.month
      : (!isAllOrEmpty(query.monthFilter) ? query.monthFilter : undefined);

    if (effectiveMonth && effectiveMonth !== 'ALL' && effectiveMonth !== 'All') {
      candidateChunks = candidateChunks.filter((c) => c.analytical_month === effectiveMonth);
    }

    // Priority 3: Channel filter (RAG-BUG-004, RAG-BUG-014: Pure Consumer Review routing for customer voice)
    const isSentimentQuery =
      effectivePlan.intent === 'CONSUMER_SENTIMENT' ||
      effectivePlan.intent === 'CUSTOMER_REVIEWS' ||
      effectivePlan.subIntents.includes('CONSUMER_SENTIMENT') ||
      effectivePlan.subIntents.includes('CUSTOMER_REVIEWS');

    const effectiveChannel = isSentimentQuery
      ? 'Consumer Review'
      : (effectivePlan.entities.channel || query.channelFilter);

    if (!isAllOrEmpty(effectiveChannel)) {
      const channelLower = effectiveChannel!.toLowerCase();
      candidateChunks = candidateChunks.filter((c) => c.channel.toLowerCase() === channelLower);
    }

    // Priority 4: Platform filter
    const effectivePlatform = effectivePlan.entities.platform || query.platformFilter;
    if (!isAllOrEmpty(effectivePlatform)) {
      const platformLower = effectivePlatform!.toLowerCase();
      candidateChunks = candidateChunks.filter((c) => c.platform.toLowerCase() === platformLower);
    }

    // Priority 5: SKU filter
    const effectiveSku = effectivePlan.entities.sku || query.skuFilter;
    if (!isAllOrEmpty(effectiveSku)) {
      const skuLower = effectiveSku!.toLowerCase();
      candidateChunks = candidateChunks.filter(
        (c) =>
          c.sku_id?.toLowerCase() === skuLower ||
          c.canonical_model?.toLowerCase() === skuLower
      );
    }

    // Strict Filtering: If filter combination produces 0 candidates, return 0 candidates (NO EVIDENCE = NO BUSINESS CLAIM)
    // Never fall back to allChunks or silent nearest month!
    if (candidateChunks.length === 0) {
      return [];
    }

    // 2. Extract query terms and intent signals
    const queryTokens = tokenize(query.query);
    const qLower = query.query.toLowerCase();

    // Check if semantic embedding provider is active
    const embeddingHealth = await serverEmbeddingProvider.healthCheck();
    let queryEmbedding: number[] = [];

    if (embeddingHealth.available) {
      try {
        queryEmbedding = await serverEmbeddingProvider.embedQuery(query.query);
      } catch {
        queryEmbedding = [];
      }
    }

    const scoredResults: RagRetrievalResult[] = [];

    for (const chunk of candidateChunks) {
      const chunkLower = chunk.content.toLowerCase();
      let keywordScore = 0;
      const matchedTerms: string[] = [];

      // Keyword term matching with exact SKU / Brand weighting
      for (const token of queryTokens) {
        if (chunkLower.includes(token)) {
          keywordScore += 1.0;
          matchedTerms.push(token);
        }
      }

      // Bonus: Exact Brand Match from Query or Structured Plan
      const isBrandMentioned =
        qLower.includes(chunk.brand.toLowerCase()) ||
        effectivePlan.entities.brands.includes(chunk.brand) ||
        effectivePlan.entities.comparisonBrands.includes(chunk.brand);

      if (isBrandMentioned) {
        keywordScore += 2.5;
        matchedTerms.push(chunk.brand);
      }

      // Bonus: Intent-Specific Evidence Alignment
      if (effectivePlan.intent === 'PRICING' || effectivePlan.subIntents.includes('PRICING')) {
        if (chunk.metadata.price_current_thb !== null && chunk.metadata.price_current_thb !== undefined) {
          keywordScore += 2.0;
        }
      }
      if (effectivePlan.intent === 'CONSUMER_SENTIMENT' || effectivePlan.subIntents.includes('CONSUMER_SENTIMENT')) {
        if (chunk.channel === 'Consumer Review' || chunk.metadata.rating !== undefined) {
          keywordScore += 2.5;
        }
      }
      if (effectivePlan.intent === 'ADVERTISING' || effectivePlan.subIntents.includes('ADVERTISING')) {
        if (chunk.channel === 'Paid Media') {
          keywordScore += 2.5;
        }
      }
      if (effectivePlan.intent === 'SOCIAL_ACTIVITY' || effectivePlan.subIntents.includes('SOCIAL_ACTIVITY')) {
        if (chunk.channel === 'Social') {
          keywordScore += 2.5;
        }
      }

      // Bonus: Exact SKU Model Match
      if (chunk.canonical_model && qLower.includes(chunk.canonical_model.toLowerCase())) {
        keywordScore += 4.0;
        matchedTerms.push(chunk.canonical_model);
      }

      // Bonus: Specific SKU codes (e.g. 580, L3250, G3730, T520W)
      for (const sku of CANONICAL_SKUS) {
        if (sku.brand === chunk.brand && qLower.includes(sku.model_name.toLowerCase()) && chunkLower.includes(sku.model_name.toLowerCase())) {
          keywordScore += 3.0;
        }
      }

      // Normalise keyword score between 0.0 and 1.0
      const normalizedKeywordScore = Math.min(1.0, keywordScore / (queryTokens.length + 3.0));

      let finalScore = normalizedKeywordScore;
      let method: RetrievalMethod = 'KEYWORD';

      // If embeddings are active and vector is available
      if (queryEmbedding.length > 0) {
        const chunkEmbedding = (chunk.metadata.embedding as number[]) || [];
        const vectorScore = chunkEmbedding.length > 0 ? cosineSimilarity(queryEmbedding, chunkEmbedding) : 0.5;
        finalScore = 0.6 * normalizedKeywordScore + 0.4 * vectorScore;
        method = 'HYBRID';
      }

      scoredResults.push({
        chunk,
        retrieval_score: Number(finalScore.toFixed(3)),
        retrieval_method: method,
        matched_terms: Array.from(new Set(matchedTerms)),
      });
    }

    // Sort descending by retrieval score
    scoredResults.sort((a, b) => b.retrieval_score - a.retrieval_score);

    return scoredResults.slice(0, topK);
  }
}

export const retrievalEngine = new RetrievalEngine();
