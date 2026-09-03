/**
 * Authoritative Raw and Normalized Evidence Schema Contracts
 */

import { TargetBrand } from './brands';
import { ChannelType, PlatformType } from './sources';

export type ActivityType =
  | 'Ad Creative'
  | 'Social Post'
  | 'Product Listing'
  | 'Promotion'
  | 'Consumer Review';

export type CreativeFormat = 'Video' | 'Static Image' | 'Carousel' | 'Search Text' | 'Live Stream';

export type ExtractionMethod = 'Apify Actor' | 'Bright Data Scraping Browser' | 'Direct HTTP' | 'Official Seed';

export type StockStatus = 'In Stock' | 'Out of Stock' | 'Low Stock' | 'Unknown';

export interface RawEvidenceRecord {
  readonly evidence_id: string;              // Deterministic key: EVID-{PLATFORM}-{SHA256}
  readonly published_at: string;             // ISO8601 YYYY-MM-DD (Original creation / post date)
  readonly captured_at: string;              // ISO8601 UTC (Crawl timestamp)
  readonly brand: TargetBrand;
  readonly channel: ChannelType;
  readonly platform: PlatformType;
  readonly activity_type: ActivityType;
  readonly product_sku: string | null;
  readonly raw_title: string;
  readonly raw_content_th: string;
  readonly content_en_translation: string;
  readonly price_current_thb: number | null;
  readonly price_original_thb: number | null;
  readonly discount_pct: number | null;
  readonly seller_name: string | null;
  readonly is_official_store: boolean;
  readonly stock_status: StockStatus;
  readonly displayed_sales: string | null;
  readonly rating: number | null;
  readonly review_count: number | null;
  readonly creative_format: CreativeFormat | null;
  readonly creative_asset_url: string | null;
  readonly impressions?: number | null;
  readonly views?: number | null;
  readonly screenshot_url?: string | null;
  readonly source_url: string;
  readonly evidence_tags: readonly string[];
  readonly extraction_method: ExtractionMethod;
  readonly confidence_score: number;
}
