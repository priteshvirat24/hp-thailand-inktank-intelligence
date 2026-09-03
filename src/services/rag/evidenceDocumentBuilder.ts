/**
 * Evidence Document & Deterministic Chunk Builder
 * 
 * Transforms RawEvidenceRecord observations into structured, searchable RAG chunks.
 * Preserves original Thai source text, dual timestamps, SKU mappings, and deep URLs.
 * Invariant: Deterministic chunk IDs (same input produces identical ID).
 */

import { createHash } from 'crypto';
import { RawEvidenceRecord } from '@/types/evidence';
import { RagEvidenceChunk } from '@/types/rag';
import { assignAnalyticalMonth } from '@/lib/dates';
import { CANONICAL_SKUS } from '@/config/skus';

function hashContent(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex').slice(0, 8);
}

function detectLanguage(text: string): 'th' | 'en' | 'th-en' {
  const hasThai = /[\u0E00-\u0E7F]/.test(text);
  const hasEnglish = /[a-zA-Z]/.test(text);

  if (hasThai && hasEnglish) return 'th-en';
  if (hasThai) return 'th';
  return 'en';
}

/**
 * Builds searchable text representation of an evidence observation.
 */
export function buildChunkContent(record: RawEvidenceRecord): string {
  const parts: string[] = [];

  // Core Identity Header
  parts.push(`[${record.brand} | ${record.channel} | ${record.platform}]`);
  parts.push(`Title: ${record.raw_title}`);

  // Product SKU Resolution
  if (record.product_sku) {
    const skuDef = CANONICAL_SKUS.find(
      (s) => s.model_name.toLowerCase() === record.product_sku?.toLowerCase() || s.sku_id === record.product_sku
    );
    const skuDetails = skuDef ? ` (Segment: ${skuDef.target_segment}, RRP: ฿${skuDef.launch_rrp_thb})` : '';
    parts.push(`Product Model: ${record.product_sku}${skuDetails}`);
  }

  // Original Thai Text
  if (record.raw_content_th && record.raw_content_th !== record.raw_title) {
    parts.push(`Thai Content: ${record.raw_content_th}`);
  }

  // English Translation / Interpretation
  if (record.content_en_translation && record.content_en_translation !== record.raw_title) {
    parts.push(`English Interpretation: ${record.content_en_translation}`);
  }

  // Pricing and Promotional Signals
  if (record.price_current_thb !== null) {
    let priceStr = `Price: ฿${record.price_current_thb.toLocaleString()}`;
    if (record.price_original_thb !== null && record.price_original_thb > record.price_current_thb) {
      priceStr += ` (Original: ฿${record.price_original_thb.toLocaleString()}, Discount: ${record.discount_pct || 0}%)`;
    }
    parts.push(priceStr);
  }

  // Cumulative Sales Traction Index
  if (record.displayed_sales) {
    parts.push(`Observable Cumulative Sales Traction: ${record.displayed_sales}`);
  }

  // Seller & Official Merchant
  if (record.seller_name) {
    parts.push(`Merchant: ${record.seller_name}${record.is_official_store ? ' (Official Flagship Store)' : ''}`);
  }

  // Ad Creative Specifics
  if (record.creative_format) {
    parts.push(`Creative Format: ${record.creative_format}`);
  }

  // Customer Feedback & Engagement
  if (record.rating !== null || record.review_count !== null) {
    const ratingStr = record.rating !== null ? `Rating: ${record.rating}/5.0` : '';
    const reviewStr = record.review_count !== null ? `Reviews/Comments: ${record.review_count}` : '';
    parts.push([ratingStr, reviewStr].filter(Boolean).join(' | '));
  }

  // Temporal Attribution
  parts.push(`Published: ${record.published_at} | Captured: ${record.captured_at.split('T')[0]}`);
  parts.push(`Source URL: ${record.source_url}`);
  parts.push(`Evidence ID: ${record.evidence_id}`);

  return parts.join('\n');
}

/**
 * Builds a deterministic RagEvidenceChunk from a RawEvidenceRecord.
 */
export function buildEvidenceChunk(record: RawEvidenceRecord, chunkIndex = 0): RagEvidenceChunk {
  const content = buildChunkContent(record);
  const contentHash = hashContent(content);
  const analyticalMonth = assignAnalyticalMonth(record.published_at);

  // Deterministic Chunk ID: CHUNK-{EVIDENCE_ID}-{INDEX}-{HASH}
  const chunkId = `CHUNK-${record.evidence_id.replace(/^EVID-/, '')}-${chunkIndex}-${contentHash.toUpperCase()}`;

  // Find canonical SKU ID if resolved
  const skuDef = record.product_sku
    ? CANONICAL_SKUS.find(
        (s) => s.model_name.toLowerCase() === record.product_sku?.toLowerCase() || s.sku_id === record.product_sku
      )
    : undefined;

  return {
    chunk_id: chunkId,
    evidence_id: record.evidence_id,
    content,
    brand: record.brand,
    channel: record.channel,
    platform: record.platform,
    sku_id: skuDef ? skuDef.sku_id : null,
    canonical_model: record.product_sku,
    analytical_month: analyticalMonth,
    source_url: record.source_url,
    published_at: record.published_at,
    captured_at: record.captured_at,
    language: detectLanguage(content),
    metadata: {
      activity_type: record.activity_type,
      creative_format: record.creative_format,
      price_current_thb: record.price_current_thb,
      price_original_thb: record.price_original_thb,
      discount_pct: record.discount_pct,
      displayed_sales: record.displayed_sales,
      is_official_store: record.is_official_store,
      rating: record.rating,
      review_count: record.review_count,
      extraction_method: record.extraction_method,
      confidence_score: record.confidence_score,
      evidence_tags: record.evidence_tags,
    },
  };
}

/**
 * Builds all RAG chunks from a collection of RawEvidenceRecords.
 */
export function buildAllEvidenceChunks(records: readonly RawEvidenceRecord[]): RagEvidenceChunk[] {
  return records.map((rec) => buildEvidenceChunk(rec, 0));
}
