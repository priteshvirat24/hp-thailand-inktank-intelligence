/**
 * Canonical Consumer Review Observation & Processing Contract
 * Phase 22 — Consumer Review Data Integrity Remediation
 */

import { TargetBrand as Brand } from './brands';

export type ReviewCategoryStatus =
  | 'VERIFIED_REVIEW'
  | 'VERIFIED_COMPARATIVE_REVIEW'
  | 'GENERAL_CATEGORY_CONTENT'
  | 'SUPPORT_DISCUSSION'
  | 'AI_COPIED_CONTENT'
  | 'OFF_TOPIC'
  | 'UNRESOLVED';

export type ReviewTranslationStatus =
  | 'TRANSLATED'
  | 'SOURCE_ALREADY_ENGLISH'
  | 'SOURCE_EN'
  | 'UNAVAILABLE'
  | 'FAILED';

export type ReviewSentiment =
  | 'POSITIVE'
  | 'NEGATIVE'
  | 'MIXED'
  | 'NEUTRAL'
  | 'NON_SENTIMENT'
  | 'UNRESOLVED';

export interface BrandSentimentItem {
  brand: Brand;
  sentiment: ReviewSentiment;
  themes: string[];
  evidence_span?: string;
}

export interface ReviewObservation {
  evidence_id: string;
  source_platform: 'Pantip' | 'Shopee' | 'Lazada' | 'JIB' | 'Advice' | string;
  source_url: string;
  thread_url?: string;
  comment_url?: string;
  source_thread_id?: string;
  source_comment_id?: string;
  published_at: string | null;
  captured_at: string;
  raw_content_th: string;
  content_en_translation: string | null;
  detected_brands: Brand[];
  attributed_brands: Brand[];
  brand_sentiments?: BrandSentimentItem[];
  detected_skus: string[];
  attributed_skus: string[];
  product_sku: string | null;
  category_status: ReviewCategoryStatus;
  sentiment: ReviewSentiment;
  sentiment_confidence?: number;
  rating: number | null;
  translation_status: ReviewTranslationStatus;
  attribution_status: 'CONFIRMED' | 'MULTI_BRAND' | 'UNATTRIBUTED' | 'EXCLUDED';
  exclusion_reason: string | null;
  analytical_month?: string | null;
  temporal_window_status?: 'IN_WINDOW' | 'OUT_OF_WINDOW' | 'UNVERIFIED';
}

/**
 * Predicate to check if a review record is valid consumer voice for Metric Cube and RAG
 */
export function isVerifiedConsumerVoice(status: ReviewCategoryStatus): boolean {
  return status === 'VERIFIED_REVIEW' || status === 'VERIFIED_COMPARATIVE_REVIEW';
}

/**
 * Predicate to check if a record represents an authentic rated buyer review
 */
export function isRatedBuyerReview(rating: number | null | undefined): boolean {
  return typeof rating === 'number' && rating > 0 && rating <= 5;
}
