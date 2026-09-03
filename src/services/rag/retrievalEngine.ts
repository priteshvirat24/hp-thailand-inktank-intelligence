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
} from '@/types/rag';
import { MetricId, AnalyticalMonth } from '@/types/analytics';
import { TargetBrand } from '@/types/brands';
import { TARGET_BRANDS } from '@/config/brands';
import { CANONICAL_SKUS } from '@/config/skus';
import { analyticsService } from '@/services/analytics/analyticsService';
import { METRIC_DEFINITIONS } from '@/services/analytics/metricRegistry';
import { serverEmbeddingProvider } from './embeddings/provider';

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
   * Retrieves supporting analytical metrics from the Analytical Cube based on query intent.
   */
  public retrieveRelevantMetrics(query: RagQuery): RagSupportingMetric[] {
    const qLower = query.query.toLowerCase();
    const metricsToFetch: MetricId[] = [];

    // Intent routing for quantitative metrics
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

    // Default fallback: total touchpoints and ecom presence
    if (metricsToFetch.length === 0) {
      metricsToFetch.push('TOTAL_VISIBILITY_TOUCHPOINTS', 'ECOMMERCE_SOV', 'AVG_SELLING_PRICE_THB');
    }

    const targetMonth = (!isAllOrEmpty(query.monthFilter) ? query.monthFilter : '2026-08') as AnalyticalMonth;
    const targetBrands: readonly TargetBrand[] =
      !isAllOrEmpty(query.brandFilter) ? [query.brandFilter as TargetBrand] : TARGET_BRANDS;

    const results: RagSupportingMetric[] = [];

    for (const metricId of metricsToFetch) {
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
    topK = 8
  ): Promise<RagRetrievalResult[]> {
    if (allChunks.length === 0) return [];

    // 1. Structured metadata filtering
    let candidateChunks = [...allChunks];

    if (!isAllOrEmpty(query.brandFilter)) {
      const brandLower = query.brandFilter!.toLowerCase();
      candidateChunks = candidateChunks.filter((c) => c.brand.toLowerCase() === brandLower);
    }
    if (!isAllOrEmpty(query.monthFilter)) {
      candidateChunks = candidateChunks.filter((c) => c.analytical_month === query.monthFilter);
    }
    if (!isAllOrEmpty(query.channelFilter)) {
      const channelLower = query.channelFilter!.toLowerCase();
      candidateChunks = candidateChunks.filter((c) => c.channel.toLowerCase() === channelLower);
    }
    if (!isAllOrEmpty(query.platformFilter)) {
      const platformLower = query.platformFilter!.toLowerCase();
      candidateChunks = candidateChunks.filter((c) => c.platform.toLowerCase() === platformLower);
    }
    if (!isAllOrEmpty(query.skuFilter)) {
      const skuLower = query.skuFilter!.toLowerCase();
      candidateChunks = candidateChunks.filter(
        (c) =>
          c.sku_id?.toLowerCase() === skuLower ||
          c.canonical_model?.toLowerCase() === skuLower
      );
    }

    // Safety: If overly restrictive filter combination produces 0 candidates, fallback to allChunks
    if (candidateChunks.length === 0) {
      candidateChunks = [...allChunks];
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

      // Bonus: Exact Brand Match
      if (qLower.includes(chunk.brand.toLowerCase())) {
        keywordScore += 2.5;
        matchedTerms.push(chunk.brand);
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
