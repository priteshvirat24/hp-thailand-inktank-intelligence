/**
 * Canonical Scraper and Ingestion Type Contracts
 */

import { TargetBrand } from '@/types/brands';
import { ChannelType, PlatformType } from '@/types/sources';
import { ActivityType, CreativeFormat, StockStatus, RawEvidenceRecord } from '@/types/evidence';
import { CrawlTarget } from '@/config/seeds';

export type ScraperProviderName = 'apify' | 'brightdata' | 'direct';

export interface RawObservation {
  readonly platform: PlatformType;
  readonly channel: ChannelType;
  readonly brand: TargetBrand;
  readonly source_url: string;
  readonly platform_entity_id: string;
  readonly raw_title: string;
  readonly raw_description?: string;
  readonly raw_content_th: string;
  readonly content_en_translation?: string;
  readonly published_at: string | null;      // ISO YYYY-MM-DD or null if unavailable
  readonly captured_at: string;              // ISO UTC
  readonly price_current_thb?: number | null;
  readonly price_original_thb?: number | null;
  readonly discount_pct?: number | null;
  readonly seller_name?: string | null;
  readonly is_official_store?: boolean;
  readonly stock_status?: StockStatus;
  readonly displayed_sales?: string | null;
  readonly rating?: number | null;
  readonly review_count?: number | null;
  readonly creative_format?: CreativeFormat | null;
  readonly creative_asset_url?: string | null;
  readonly activity_type: ActivityType;
  readonly evidence_tags?: readonly string[];
  readonly raw_attributes?: Record<string, unknown>;
  readonly provider: ScraperProviderName;
  readonly crawl_run_id: string;
}

export type ScraperHealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNCONFIGURED' | 'FAILED';

export interface ScraperHealth {
  readonly status: ScraperHealthStatus;
  readonly source_id: string;
  readonly platform: PlatformType;
  readonly message?: string;
}

export interface ScraperAdapter<TConfig = CrawlTarget> {
  readonly sourceId: string;
  readonly platform: PlatformType;
  readonly channel: ChannelType;
  readonly name: string;

  discover(config: TConfig): Promise<CrawlTarget[]>;
  extract(rawPayload: unknown[], target: CrawlTarget, crawlRunId: string): Promise<RawObservation[]>;
  healthCheck(config: TConfig): Promise<ScraperHealth>;
}

export type IngestionErrorCode =
  | 'DISCOVERY_FAILED'
  | 'FETCH_FAILED'
  | 'PARSE_FAILED'
  | 'CLASSIFICATION_FAILED'
  | 'SKU_RESOLUTION_FAILED'
  | 'VALIDATION_FAILED'
  | 'PROVIDER_FAILED'
  | 'RATE_LIMITED'
  | 'AUTHENTICATION_FAILED'
  | 'UNKNOWN';

export interface IngestionError {
  readonly code: IngestionErrorCode;
  readonly message: string;
  readonly target_id?: string;
  readonly raw_input?: string;
  readonly details?: Record<string, unknown>;
}

export interface IngestionReport {
  readonly crawl_run_id: string;
  readonly source_id: string;
  readonly provider: ScraperProviderName;
  readonly target_count: number;
  readonly discovered: number;
  readonly fetched: number;
  readonly extracted: number;
  readonly accepted: number;
  readonly rejected: number;
  readonly unresolved_sku: number;
  readonly ambiguous_sku: number;
  readonly duplicate: number;
  readonly failed: number;
  readonly persisted_records: readonly RawEvidenceRecord[];
  readonly errors: readonly IngestionError[];
  readonly started_at: string;
  readonly completed_at: string;
}
