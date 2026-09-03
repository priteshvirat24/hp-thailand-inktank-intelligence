/**
 * Authoritative Analytical Cube and Metric Schema Contracts
 * 
 * Defines the multi-dimensional structure:
 * Brand × Month × Channel × Platform × SKU × Metric
 */

import { TargetBrand } from './brands';
import { ChannelType, PlatformType } from './sources';

export type AnalyticalMonth = '2026-06' | '2026-07' | '2026-08' | 'ALL';

export type MetricId =
  // Data Cut 1: Online Visibility & Share of Voice
  | 'AD_PRESENCE_COUNT'
  | 'SOCIAL_POSTS_COUNT'
  | 'ECOMMERCE_LISTINGS_COUNT'
  | 'PAID_MEDIA_SOV'
  | 'SOCIAL_SOV'
  | 'ECOMMERCE_SOV'
  | 'TOTAL_VISIBILITY_TOUCHPOINTS'
  // Data Cut 2: Advertising / Creatives
  | 'CREATIVE_FORMAT_VIDEO_COUNT'
  | 'CREATIVE_FORMAT_STATIC_COUNT'
  | 'CREATIVE_FORMAT_CAROUSEL_COUNT'
  // Data Cut 3: Social Media Activity
  | 'TOTAL_SOCIAL_ENGAGEMENT'
  | 'AVG_ENGAGEMENT_PER_POST'
  // Data Cut 4: E-Commerce Presence, Pricing & Promos
  | 'AVG_SELLING_PRICE_THB'
  | 'MEDIAN_SELLING_PRICE_THB'
  | 'MIN_SELLING_PRICE_THB'
  | 'MAX_SELLING_PRICE_THB'
  | 'AVG_DISCOUNT_PCT'
  | 'PROMO_PENETRATION_PCT'
  | 'ACTIVE_OFFICIAL_STORES_COUNT'
  | 'OBSERVABLE_SALES_TRACTION_INDEX'
  // Data Cut 5: Consumer Sentiment
  | 'AVG_CONSUMER_RATING'
  | 'TOTAL_CONSUMER_REVIEWS_COUNT';

export type MetricName =
  | 'Unique Active Ads'
  | 'Total Social Posts'
  | 'Active E-Commerce Listings'
  | 'Paid Media Share of Voice %'
  | 'Social Share of Voice %'
  | 'E-Commerce Share of Voice %'
  | 'Total Online Visibility Touchpoints'
  | 'Video Ad Creatives Count'
  | 'Static Image Ad Creatives Count'
  | 'Carousel Ad Creatives Count'
  | 'Total Social Engagement'
  | 'Average Engagement per Post'
  | 'Average Selling Price (THB)'
  | 'Median Selling Price (THB)'
  | 'Lowest Observed Price (THB)'
  | 'Highest Observed Price (THB)'
  | 'Average Observed Discount %'
  | 'Promotional Listing Share %'
  | 'Active Official Store Listings'
  | 'Observable Cumulative Sales Traction Index'
  | 'Average Star Rating (out of 5)'
  | 'Total Verified Customer Reviews';

export type MetricUnit = 'THB' | 'Count' | 'Percentage' | 'Score' | 'Ratio' | 'Index';

export type AggregationType = 'COUNT' | 'SUM' | 'AVERAGE' | 'MEDIAN' | 'RATIO' | 'PERCENTAGE' | 'MIN' | 'MAX';

export type DataState = 'OBSERVED' | 'MISSING' | 'INSUFFICIENT_EVIDENCE' | 'NOT_APPLICABLE';

export interface AnalyticalMetricRow {
  readonly row_id: string;                    // Deterministic: ROW-{BRAND}-{MONTH}-{CHANNEL}-{PLATFORM}-{SKU}-{METRIC}
  readonly brand: TargetBrand;
  readonly analytical_month: AnalyticalMonth;
  readonly channel: ChannelType | 'All';
  readonly platform: PlatformType | 'All';
  readonly sku_id: string | 'All';            // Canonical SKU ID (e.g. 'HP-ST-580') or 'All'
  readonly sku_model_name: string | 'All';    // Canonical model name (e.g. 'Smart Tank 580') or 'All'
  readonly metric_id: MetricId;
  readonly metric_name: MetricName;
  readonly metric_value: number | null;       // Null represents missing evidence (never fake zero!)
  readonly unit: MetricUnit;
  readonly observation_count: number;         // Sample size of valid raw observations
  readonly evidence_ids: readonly string[];   // Immutable lineage back to raw evidence
  readonly methodology_note: string;          // Formula and scope documentation
  readonly data_state: DataState;
  readonly generated_at: string;
}

// Backward-compatible alias for existing service signatures
export type NormalizedMetricRecord = AnalyticalMetricRow;

export interface AnalyticsFilter {
  brand?: TargetBrand | 'All';
  month?: AnalyticalMonth | 'All';
  channel?: ChannelType | 'All';
  platform?: PlatformType | 'All';
  sku_id?: string | 'All';
  metric_id?: MetricId | 'All';
}

export interface MonthlyTrendPoint {
  readonly month: AnalyticalMonth;
  readonly month_label: string;
  readonly value: number | null;
  readonly observation_count: number;
  readonly data_state: DataState;
}

export interface BrandComparisonRecord {
  readonly brand: TargetBrand;
  readonly metric_id: MetricId;
  readonly metric_name: MetricName;
  readonly value: number | null;
  readonly unit: MetricUnit;
  readonly observation_count: number;
  readonly data_state: DataState;
}

export interface SkuComparisonRecord {
  readonly sku_id: string;
  readonly model_name: string;
  readonly brand: TargetBrand;
  readonly segment: string;
  readonly avg_price_thb: number | null;
  readonly median_price_thb: number | null;
  readonly avg_discount_pct: number | null;
  readonly promo_penetration_pct: number | null;
  readonly sales_traction_index: number | null;
  readonly observation_count: number;
  readonly evidence_ids: readonly string[];
}

export interface PlatformBreakdownRecord {
  readonly platform: PlatformType;
  readonly channel: ChannelType;
  readonly brand: TargetBrand;
  readonly observation_count: number;
  readonly share_of_channel_pct: number | null;
}

export interface ExecutiveOverviewData {
  readonly month: AnalyticalMonth | 'All';
  readonly brands: Record<
    TargetBrand,
    {
      total_visibility_touchpoints: number;
      paid_sov_pct: number | null;
      social_sov_pct: number | null;
      ecom_sov_pct: number | null;
      avg_price_thb: number | null;
      avg_discount_pct: number | null;
      top_promoted_sku: string | null;
      evidence_count: number;
    }
  >;
  readonly total_evidence_observations: number;
  readonly total_lake_observations?: number;
  readonly channel_observations?: {
    paid_media: number;
    social: number;
    ecommerce: number;
    consumer_review: number;
  };
  readonly generated_at: string;
}
