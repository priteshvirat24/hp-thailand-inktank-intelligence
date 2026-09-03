/**
 * Web Acquisition & Internet Evidence Discovery Domain Contracts
 */

import { TargetBrand } from '@/types/brands';
import { RawEvidenceRecord } from '@/types/evidence';

export type AcquisitionStrategy =
  | 'DIRECT_HTTP'
  | 'STRUCTURED_HTML'
  | 'BRIGHTDATA_UNLOCKER'
  | 'BRIGHTDATA_BROWSER'
  | 'APIFY_HTTP'
  | 'APIFY_BROWSER'
  | 'CUSTOM_ADAPTER'
  | 'SEARCH_DISCOVERY';

export type AcquisitionStatus =
  | 'SUCCESS'
  | 'PARTIAL_SUCCESS'
  | 'BLOCKED'
  | 'AUTH_REQUIRED'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'ROBOTS_DISALLOWED'
  | 'JS_REQUIRED'
  | 'TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'UNSUPPORTED'
  | 'INVALID_URL'
  | 'EMPTY_CONTENT'
  | 'SSRF_BLOCKED'
  | 'ERROR';

export type CrawlabilityStatus =
  | 'EASY'
  | 'RENDER_REQUIRED'
  | 'BROWSER_REQUIRED'
  | 'PROVIDER_REQUIRED'
  | 'BLOCKED'
  | 'AUTH_REQUIRED'
  | 'ROBOTS_DISALLOWED'
  | 'NOT_FOUND'
  | 'UNSUPPORTED'
  | 'UNKNOWN';

export type WebErrorCode =
  | 'INVALID_URL'
  | 'DNS_ERROR'
  | 'TIMEOUT'
  | 'TLS_ERROR'
  | 'HTTP_401'
  | 'HTTP_403'
  | 'HTTP_404'
  | 'HTTP_429'
  | 'HTTP_5XX'
  | 'ROBOTS_DISALLOWED'
  | 'JS_REQUIRED'
  | 'BROWSER_FAILURE'
  | 'CAPTCHA'
  | 'ACCESS_BLOCKED'
  | 'PROVIDER_NOT_CONFIGURED'
  | 'PROVIDER_ERROR'
  | 'PARSER_ERROR'
  | 'EMPTY_CONTENT'
  | 'UNSUPPORTED_CONTENT_TYPE'
  | 'AUTH_REQUIRED'
  | 'CRAWL_BUDGET_EXCEEDED'
  | 'SSRF_BLOCKED';

export type PageClassification =
  | 'PRODUCT'
  | 'CATEGORY'
  | 'ARTICLE'
  | 'SOCIAL_POST'
  | 'SOCIAL_PROFILE'
  | 'ADVERTISEMENT'
  | 'SEARCH_RESULTS'
  | 'BRAND_PAGE'
  | 'REVIEW'
  | 'FORUM'
  | 'CORPORATE'
  | 'UNKNOWN';

export type SourceQuality =
  | 'OFFICIAL_BRAND'
  | 'OFFICIAL_RETAILER'
  | 'MARKETPLACE'
  | 'AD_LIBRARY'
  | 'SOCIAL'
  | 'NEWS'
  | 'THIRD_PARTY_REVIEW'
  | 'BLOG'
  | 'UNKNOWN';

export interface WebProvenance {
  acquisition_method: AcquisitionStrategy;
  acquisition_provider: string;
  acquisition_strategy: AcquisitionStrategy;
  requested_url: string;
  final_url: string;
  canonical_url: string | null;
  captured_at: string;
  content_hash: string;
  source_type: 'JSON_LD' | 'HTML_META' | 'DOM_RENDERED' | 'CUSTOM_ADAPTER' | 'SEARCH_DISCOVERY';
  source_quality: SourceQuality;
  crawl_id?: string;
  provider_run_id?: string;
  extraction_method: string;
  parser_version: string;
  screenshot_reference?: string;
  raw_payload_reference?: string;
}

export interface WebAcquisitionResult {
  acquisition_id: string;
  requested_url: string;
  final_url: string;
  canonical_url: string | null;
  domain: string;
  status: AcquisitionStatus;
  strategy: AcquisitionStrategy;
  provider: string;
  http_status: number | null;
  content_type: string | null;
  fetched_at: string;
  duration_ms: number;
  html?: string;
  markdown?: string;
  title: string | null;
  language: 'th' | 'en' | 'th-en' | 'unknown';
  robots_state: 'ALLOWED' | 'DISALLOWED' | 'UNKNOWN' | 'ERROR';
  extraction_state: 'COMPLETE' | 'PARTIAL' | 'FAILED' | 'SKIPPED';
  javascript_required: boolean;
  blocked_reason?: string;
  error_code?: WebErrorCode;
  retry_count: number;
  redirect_chain: string[];
  discovered_urls: string[];
  content_hash: string;
  screenshot_reference?: string;
  raw_payload_reference?: string;
  provider_metadata?: Record<string, unknown>;
  provenance: WebProvenance;
}

export interface ExtractedProductData {
  title: string | null;
  brand: TargetBrand | string | null;
  model: string | null;
  sku: string | null;
  mpn: string | null;
  price_current_thb: number | null;
  price_original_thb: number | null;
  currency: string;
  discount_pct: number | null;
  raw_price_text: string | null;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Unknown';
  rating: number | null;
  review_count: number | null;
  sold_count: string | null;
  description_th: string | null;
  description_en: string | null;
  seller_name: string | null;
  is_official_store: boolean;
  images: string[];
  specifications: Record<string, string>;
  breadcrumbs: string[];
  page_type: PageClassification;
  source_quality: SourceQuality;
}

export interface CrawlBudget {
  max_pages: number;
  max_depth: number;
  max_runtime_ms: number;
  max_bytes: number;
  max_provider_requests: number;
}

export interface CrawlSession {
  crawl_id: string;
  started_at: string;
  completed_at: string | null;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'STOPPED';
  requested_targets: string[];
  discovered_urls: string[];
  acquired_urls: string[];
  successful_pages: number;
  partial_pages: number;
  failed_pages: number;
  blocked_pages: number;
  evidence_created: number;
  evidence_duplicates: number;
  evidence_rejected: number;
  unresolved_skus: number;
  provider_usage: Record<string, number>;
  strategy_usage: Record<string, number>;
  error_summary: Record<string, number>;
  created_evidence_ids: string[];
  budget: CrawlBudget;
}

export interface DomainProfile {
  domain: string;
  crawlability_status: CrawlabilityStatus;
  recommended_strategy: AcquisitionStrategy;
  is_javascript_heavy: boolean;
  requires_browser: boolean;
  supports_direct_http: boolean;
  robots_state: 'ALLOWED' | 'DISALLOWED' | 'UNKNOWN';
  last_checked_at: string;
  sample_latency_ms: number;
  detected_category: 'MARKETPLACE' | 'OFFICIAL_BRAND' | 'RETAILER' | 'SOCIAL' | 'NEWS' | 'GENERIC';
}

export interface WebDiscoveryCandidate {
  url: string;
  domain: string;
  title: string;
  snippet?: string;
  discovery_source: 'SEARCH_SERP' | 'SITEMAP' | 'LINK_EXTRACTION' | 'SEED_REGISTRY' | 'USER_PROVIDED';
  ranking?: number;
  discovered_at: string;
  brand_hint?: TargetBrand;
  sku_hint?: string;
}

export interface GenericObservationResult {
  observations: RawEvidenceRecord[];
  accepted: number;
  rejected: number;
  duplicate: number;
  unresolved_sku: number;
  rejected_reasons: string[];
}
