/**
 * Authoritative Metric Definitions & Calculation Registry
 * 
 * Central repository for all analytical formulas, aggregation semantics,
 * and lineage requirements across the 5 Data Cuts.
 */

import { MetricId, MetricName, MetricUnit, AggregationType, DataState } from '@/types/analytics';
import { ChannelType, PlatformType } from '@/types/sources';
import { RawEvidenceRecord } from '@/types/evidence';
import { CANONICAL_SKUS, ALL_MARKET_SKUS } from '@/config/skus';

export interface MetricCalculationResult {
  readonly value: number | null;
  readonly unit: MetricUnit;
  readonly observation_count: number;
  readonly evidence_ids: readonly string[];
  readonly data_state: DataState;
  readonly methodology_note: string;
}

export interface MetricDefinition {
  readonly metric_id: MetricId;
  readonly name: MetricName;
  readonly channel: ChannelType | 'All';
  readonly applicable_platforms: readonly (PlatformType | 'All')[];
  readonly unit: MetricUnit;
  readonly aggregation_type: AggregationType;
  readonly description: string;
  readonly methodology: string;
  calculate(records: readonly RawEvidenceRecord[], denominatorTotal?: number): MetricCalculationResult;
}

export function isValidConsumerReview(r: RawEvidenceRecord): boolean {
  if (r.channel !== 'Consumer Review') return false;
  const rec = r as unknown as Record<string, unknown>;
  const status = rec.category_status as string | undefined;
  if (!status) return true;
  return (
    status !== 'OFF_TOPIC' &&
    status !== 'AI_COPIED_CONTENT' &&
    status !== 'GENERAL_CATEGORY_CONTENT' &&
    status !== 'SUPPORT_DISCUSSION' &&
    rec.attribution_status !== 'EXCLUDED' &&
    (status === 'VERIFIED_REVIEW' || status === 'VERIFIED_COMPARATIVE_REVIEW')
  );
}

/**
 * Metric Definitions Registry
 */
export const METRIC_DEFINITIONS: Record<MetricId, MetricDefinition> = {
  // ============================================================================
  // DATA CUT 1: Online Visibility & Share of Voice
  // ============================================================================
  AD_PRESENCE_COUNT: {
    metric_id: 'AD_PRESENCE_COUNT',
    name: 'Total Ad Flight Observations',
    channel: 'Paid Media',
    applicable_platforms: ['Meta', 'Google Ads', 'YouTube', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Count of observed active paid ad campaign flights captured from Meta Ad Library Thailand (52/month, 156 across 90 days).',
    methodology: 'Count of distinct ad flight observations filtered by brand, month, and paid media platforms.',
    calculate: (records) => {
      const ads = records.filter((r) => r.channel === 'Paid Media');
      return {
        value: ads.length > 0 ? ads.length : 0,
        unit: 'Count',
        observation_count: ads.length,
        evidence_ids: ads.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: 'Direct count of observed paid media ad campaign flights across in-scope SKUs.',
      };
    },
  },

  UNIQUE_CREATIVES_COUNT: {
    metric_id: 'UNIQUE_CREATIVES_COUNT',
    name: 'Unique Creative Assets',
    channel: 'Paid Media',
    applicable_platforms: ['Meta', 'Google Ads', 'YouTube', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Count of unique in-market creative concepts / SKU executions (13 total: HP 4, Epson 3, Canon 3, Brother 3).',
    methodology: 'Deduplicated count of distinct product SKU creative executions observed in the market.',
    calculate: (records) => {
      const ads = records.filter((r) => r.channel === 'Paid Media');
      const uniqueSkus = new Set(ads.map((r) => r.product_sku).filter(Boolean));
      return {
        value: uniqueSkus.size,
        unit: 'Count',
        observation_count: ads.length,
        evidence_ids: ads.map((r) => r.evidence_id),
        data_state: uniqueSkus.size > 0 ? 'OBSERVED' : 'INSUFFICIENT_EVIDENCE',
        methodology_note: `Deduplicated to ${uniqueSkus.size} unique creative concepts across ${ads.length} flight observations.`,
      };
    },
  },

  SOCIAL_POSTS_COUNT: {
    metric_id: 'SOCIAL_POSTS_COUNT',
    name: 'Total Social Posts',
    channel: 'Social',
    applicable_platforms: ['Facebook', 'Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Count of published brand-owned social media posts during the analytical window.',
    methodology: 'Count of distinct social post observations from official brand accounts.',
    calculate: (records) => {
      const posts = records.filter((r) => r.channel === 'Social');
      return {
        value: posts.length > 0 ? posts.length : 0,
        unit: 'Count',
        observation_count: posts.length,
        evidence_ids: posts.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: 'Direct count of observed brand-owned social posts.',
      };
    },
  },

  ECOMMERCE_LISTINGS_COUNT: {
    metric_id: 'ECOMMERCE_LISTINGS_COUNT',
    name: 'Active E-Commerce Listings',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Count of verified active e-commerce product listings for in-scope Ink Tank printers.',
    methodology: 'Count of distinct marketplace product listings matching target brands.',
    calculate: (records) => {
      const listings = records.filter((r) => r.channel === 'E-commerce');
      return {
        value: listings.length > 0 ? listings.length : 0,
        unit: 'Count',
        observation_count: listings.length,
        evidence_ids: listings.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: 'Direct count of active e-commerce listings.',
      };
    },
  },

  PAID_MEDIA_SOV: {
    metric_id: 'PAID_MEDIA_SOV',
    name: 'Paid Media Share of Voice %',
    channel: 'Paid Media',
    applicable_platforms: ['Meta', 'Google Ads', 'YouTube', 'All'],
    unit: 'Percentage',
    aggregation_type: 'PERCENTAGE',
    description: 'Brand share of observable active paid advertising creatives across all 4 target brands.',
    methodology: '(Brand Active Ads in Period / Total Target-Brand Active Ads in Period) * 100.',
    calculate: (records, denominatorTotal = 0) => {
      const brandAds = records.filter((r) => r.channel === 'Paid Media');
      if (denominatorTotal <= 0) {
        return {
          value: null,
          unit: 'Percentage',
          observation_count: brandAds.length,
          evidence_ids: brandAds.map((r) => r.evidence_id),
          data_state: 'INSUFFICIENT_EVIDENCE',
          methodology_note: 'Insufficient market-wide paid media observations to calculate SOV denominator.',
        };
      }
      const sov = Number(((brandAds.length / denominatorTotal) * 100).toFixed(1));
      return {
        value: sov,
        unit: 'Percentage',
        observation_count: brandAds.length,
        evidence_ids: brandAds.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Calculated as ${brandAds.length} brand ads / ${denominatorTotal} total category ads * 100.`,
      };
    },
  },

  SOCIAL_SOV: {
    metric_id: 'SOCIAL_SOV',
    name: 'Social Share of Voice %',
    channel: 'Social',
    applicable_platforms: ['Facebook', 'Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'All'],
    unit: 'Percentage',
    aggregation_type: 'PERCENTAGE',
    description: 'Brand share of published social posts across all 4 target brands.',
    methodology: '(Brand Social Posts / Total Target-Brand Social Posts) * 100.',
    calculate: (records, denominatorTotal = 0) => {
      const brandPosts = records.filter((r) => r.channel === 'Social');
      if (denominatorTotal <= 0) {
        return {
          value: null,
          unit: 'Percentage',
          observation_count: brandPosts.length,
          evidence_ids: brandPosts.map((r) => r.evidence_id),
          data_state: 'INSUFFICIENT_EVIDENCE',
          methodology_note: 'Insufficient social posts across category to establish SOV baseline.',
        };
      }
      const sov = Number(((brandPosts.length / denominatorTotal) * 100).toFixed(1));
      return {
        value: sov,
        unit: 'Percentage',
        observation_count: brandPosts.length,
        evidence_ids: brandPosts.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Calculated as ${brandPosts.length} brand posts / ${denominatorTotal} total category posts * 100.`,
      };
    },
  },

  ECOMMERCE_SOV: {
    metric_id: 'ECOMMERCE_SOV',
    name: 'E-Commerce Share of Voice %',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'Percentage',
    aggregation_type: 'PERCENTAGE',
    description: 'Brand share of active e-commerce listings across all 4 target brands.',
    methodology: '(Brand E-Commerce Listings / Total Target-Brand E-Commerce Listings) * 100.',
    calculate: (records, denominatorTotal = 0) => {
      const brandListings = records.filter((r) => r.channel === 'E-commerce');
      if (denominatorTotal <= 0) {
        return {
          value: null,
          unit: 'Percentage',
          observation_count: brandListings.length,
          evidence_ids: brandListings.map((r) => r.evidence_id),
          data_state: 'INSUFFICIENT_EVIDENCE',
          methodology_note: 'Insufficient e-commerce listings to establish SOV baseline.',
        };
      }
      const sov = Number(((brandListings.length / denominatorTotal) * 100).toFixed(1));
      return {
        value: sov,
        unit: 'Percentage',
        observation_count: brandListings.length,
        evidence_ids: brandListings.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Calculated as ${brandListings.length} brand listings / ${denominatorTotal} total category listings * 100.`,
      };
    },
  },

  TOTAL_VISIBILITY_TOUCHPOINTS: {
    metric_id: 'TOTAL_VISIBILITY_TOUCHPOINTS',
    name: 'Total Online Visibility Touchpoints',
    channel: 'All',
    applicable_platforms: ['All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Sum of all verified observations (Paid Media Ads + Social Posts + E-Commerce Listings + Consumer Reviews).',
    methodology: 'Count of all valid evidence records for the brand and month.',
    calculate: (records) => {
      const validRecords = records.filter(
        (r) => r.channel !== 'Consumer Review' || isValidConsumerReview(r)
      );
      return {
        value: validRecords.length > 0 ? validRecords.length : 0,
        unit: 'Count',
        observation_count: validRecords.length,
        evidence_ids: validRecords.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: 'Combined sum of active ads, social posts, marketplace listings, and verified consumer reviews.',
      };
    },
  },

  // ============================================================================
  // DATA CUT 2: Advertising / Creatives
  // ============================================================================
  CREATIVE_FORMAT_VIDEO_COUNT: {
    metric_id: 'CREATIVE_FORMAT_VIDEO_COUNT',
    name: 'Video Ad Creatives Count',
    channel: 'Paid Media',
    applicable_platforms: ['Meta', 'Google Ads', 'YouTube', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Count of ad creatives utilizing video formats.',
    methodology: 'Count of ad records where creative_format === "Video".',
    calculate: (records) => {
      const videos = records.filter((r) => r.channel === 'Paid Media' && r.creative_format === 'Video');
      return {
        value: videos.length > 0 ? videos.length : 0,
        unit: 'Count',
        observation_count: videos.length,
        evidence_ids: videos.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: 'Direct count of observed video ad creatives.',
      };
    },
  },

  CREATIVE_FORMAT_STATIC_COUNT: {
    metric_id: 'CREATIVE_FORMAT_STATIC_COUNT',
    name: 'Static Image Ad Creatives Count',
    channel: 'Paid Media',
    applicable_platforms: ['Meta', 'Google Ads', 'YouTube', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Count of ad creatives utilizing single static image format.',
    methodology: 'Count of ad records where creative_format === "Static Image".',
    calculate: (records) => {
      const statics = records.filter((r) => r.channel === 'Paid Media' && r.creative_format === 'Static Image');
      return {
        value: statics.length > 0 ? statics.length : 0,
        unit: 'Count',
        observation_count: statics.length,
        evidence_ids: statics.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: 'Direct count of static image ad creatives.',
      };
    },
  },

  CREATIVE_FORMAT_CAROUSEL_COUNT: {
    metric_id: 'CREATIVE_FORMAT_CAROUSEL_COUNT',
    name: 'Carousel Ad Creatives Count',
    channel: 'Paid Media',
    applicable_platforms: ['Meta', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Count of multi-slide carousel ad creatives.',
    methodology: 'Count of ad records where creative_format === "Carousel".',
    calculate: (records) => {
      const carousels = records.filter((r) => r.channel === 'Paid Media' && r.creative_format === 'Carousel');
      return {
        value: carousels.length > 0 ? carousels.length : 0,
        unit: 'Count',
        observation_count: carousels.length,
        evidence_ids: carousels.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: 'Direct count of carousel ad creatives.',
      };
    },
  },

  // ============================================================================
  // DATA CUT 3: Social Media Activity
  // ============================================================================
  TOTAL_SOCIAL_ENGAGEMENT: {
    metric_id: 'TOTAL_SOCIAL_ENGAGEMENT',
    name: 'Total Social Engagement',
    channel: 'Social',
    applicable_platforms: ['Facebook', 'Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'All'],
    unit: 'Count',
    aggregation_type: 'SUM',
    description: 'Observable cumulative social engagement (comments, replies, reviews where exposed).',
    methodology: 'Sum of review_count / comment observations across social records.',
    calculate: (records) => {
      const social = records.filter((r) => r.channel === 'Social');
      const valid = social.filter((r) => typeof r.review_count === 'number');
      if (valid.length === 0) {
        return {
          value: null,
          unit: 'Count',
          observation_count: 0,
          evidence_ids: social.map((r) => r.evidence_id),
          data_state: 'MISSING',
          methodology_note: 'No explicit engagement counters exposed in captured social posts.',
        };
      }
      const sum = valid.reduce((acc, r) => acc + (r.review_count || 0), 0);
      return {
        value: sum,
        unit: 'Count',
        observation_count: valid.length,
        evidence_ids: valid.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Sum of engagement across ${valid.length} social post observations.`,
      };
    },
  },

  AVG_ENGAGEMENT_PER_POST: {
    metric_id: 'AVG_ENGAGEMENT_PER_POST',
    name: 'Average Engagement per Post',
    channel: 'Social',
    applicable_platforms: ['Facebook', 'Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'All'],
    unit: 'Score',
    aggregation_type: 'AVERAGE',
    description: 'Average observable engagement per published social post.',
    methodology: 'Total Observable Engagement / Total Social Posts with Engagement Data.',
    calculate: (records) => {
      const valid = records.filter((r) => r.channel === 'Social' && typeof r.review_count === 'number');
      if (valid.length === 0) {
        return {
          value: null,
          unit: 'Score',
          observation_count: 0,
          evidence_ids: [],
          data_state: 'MISSING',
          methodology_note: 'No engagement data available to calculate average.',
        };
      }
      const total = valid.reduce((acc, r) => acc + (r.review_count || 0), 0);
      const avg = Number((total / valid.length).toFixed(1));
      return {
        value: avg,
        unit: 'Score',
        observation_count: valid.length,
        evidence_ids: valid.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Average calculated across ${valid.length} posts.`,
      };
    },
  },

  // ============================================================================
  // DATA CUT 4: E-Commerce Presence, Pricing & Promos
  // ============================================================================
  AVG_SELLING_PRICE_THB: {
    metric_id: 'AVG_SELLING_PRICE_THB',
    name: 'Average Selling Price (THB)',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'THB',
    aggregation_type: 'AVERAGE',
    description: 'Mean current selling price observed across marketplace product listings.',
    methodology: 'Sum of observed price_current_thb / Count of priced listings.',
    calculate: (records) => {
      const priced = records.filter((r) => r.channel === 'E-commerce' && typeof r.price_current_thb === 'number');
      if (priced.length === 0) {
        return {
          value: null,
          unit: 'THB',
          observation_count: 0,
          evidence_ids: [],
          data_state: 'MISSING',
          methodology_note: 'No verified price observations captured in this segment.',
        };
      }
      const sum = priced.reduce((acc, r) => acc + (r.price_current_thb || 0), 0);
      const avg = Math.round(sum / priced.length);
      return {
        value: avg,
        unit: 'THB',
        observation_count: priced.length,
        evidence_ids: priced.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Mean price calculated across ${priced.length} marketplace listings.`,
      };
    },
  },

  MEDIAN_SELLING_PRICE_THB: {
    metric_id: 'MEDIAN_SELLING_PRICE_THB',
    name: 'Median Selling Price (THB)',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'THB',
    aggregation_type: 'MEDIAN',
    description: 'Median current selling price (resilient against outlier promotional bundles).',
    methodology: '50th percentile of observed price_current_thb values.',
    calculate: (records) => {
      const priced = records
        .filter((r) => r.channel === 'E-commerce' && typeof r.price_current_thb === 'number')
        .map((r) => r.price_current_thb as number)
        .sort((a, b) => a - b);

      if (priced.length === 0) {
        return {
          value: null,
          unit: 'THB',
          observation_count: 0,
          evidence_ids: [],
          data_state: 'MISSING',
          methodology_note: 'No price observations available for median calculation.',
        };
      }

      const mid = Math.floor(priced.length / 2);
      const median = priced.length % 2 !== 0 ? priced[mid] : Math.round((priced[mid - 1] + priced[mid]) / 2);

      const matchedRecords = records.filter((r) => r.channel === 'E-commerce' && typeof r.price_current_thb === 'number');
      return {
        value: median,
        unit: 'THB',
        observation_count: priced.length,
        evidence_ids: matchedRecords.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Median calculated from ${priced.length} price points.`,
      };
    },
  },

  MIN_SELLING_PRICE_THB: {
    metric_id: 'MIN_SELLING_PRICE_THB',
    name: 'Lowest Observed Price (THB)',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'THB',
    aggregation_type: 'MIN',
    description: 'Lowest verified market price observed during the analytical period.',
    methodology: 'Minimum value of price_current_thb.',
    calculate: (records) => {
      const priced = records.filter((r) => r.channel === 'E-commerce' && typeof r.price_current_thb === 'number');
      if (priced.length === 0) {
        return {
          value: null,
          unit: 'THB',
          observation_count: 0,
          evidence_ids: [],
          data_state: 'MISSING',
          methodology_note: 'No price observations available.',
        };
      }
      const min = Math.min(...priced.map((r) => r.price_current_thb as number));
      return {
        value: min,
        unit: 'THB',
        observation_count: priced.length,
        evidence_ids: priced.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: 'Lowest observed marketplace price.',
      };
    },
  },

  MAX_SELLING_PRICE_THB: {
    metric_id: 'MAX_SELLING_PRICE_THB',
    name: 'Highest Observed Price (THB)',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'THB',
    aggregation_type: 'MAX',
    description: 'Highest verified market price observed (e.g. flagship bundle or extended warranty).',
    methodology: 'Maximum value of price_current_thb.',
    calculate: (records) => {
      const priced = records.filter((r) => r.channel === 'E-commerce' && typeof r.price_current_thb === 'number');
      if (priced.length === 0) {
        return {
          value: null,
          unit: 'THB',
          observation_count: 0,
          evidence_ids: [],
          data_state: 'MISSING',
          methodology_note: 'No price observations available.',
        };
      }
      const max = Math.max(...priced.map((r) => r.price_current_thb as number));
      return {
        value: max,
        unit: 'THB',
        observation_count: priced.length,
        evidence_ids: priced.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: 'Highest observed marketplace price.',
      };
    },
  },

  AVG_DISCOUNT_PCT: {
    metric_id: 'AVG_DISCOUNT_PCT',
    name: 'Average Observed Discount %',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'Percentage',
    aggregation_type: 'AVERAGE',
    description: 'Mean percentage discount from original RRP/strike-through price.',
    methodology: 'Sum of discount_pct observations / Count of discounted listings.',
    calculate: (records) => {
      const discounted = records.filter(
        (r) => r.channel === 'E-commerce' && typeof r.discount_pct === 'number' && r.discount_pct > 0
      );
      if (discounted.length === 0) {
        return {
          value: null,
          unit: 'Percentage',
          observation_count: 0,
          evidence_ids: [],
          data_state: 'MISSING',
          methodology_note: 'No listings with active promotional discounts observed.',
        };
      }
      const sum = discounted.reduce((acc, r) => acc + (r.discount_pct || 0), 0);
      const avg = Number((sum / discounted.length).toFixed(1));
      return {
        value: avg,
        unit: 'Percentage',
        observation_count: discounted.length,
        evidence_ids: discounted.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Average discount calculated across ${discounted.length} discounted listings.`,
      };
    },
  },

  PROMO_PENETRATION_PCT: {
    metric_id: 'PROMO_PENETRATION_PCT',
    name: 'Promotional Listing Share %',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'Percentage',
    aggregation_type: 'PERCENTAGE',
    description: 'Share of product listings featuring active price cuts or promotional vouchers.',
    methodology: '(Listings with discount > 0 / Total E-Commerce Listings) * 100.',
    calculate: (records) => {
      const total = records.filter((r) => r.channel === 'E-commerce');
      if (total.length === 0) {
        return {
          value: null,
          unit: 'Percentage',
          observation_count: 0,
          evidence_ids: [],
          data_state: 'MISSING',
          methodology_note: 'No e-commerce listings available to compute promotion penetration.',
        };
      }
      const promoListings = total.filter((r) => typeof r.discount_pct === 'number' && r.discount_pct > 0);
      const pct = Number(((promoListings.length / total.length) * 100).toFixed(1));
      return {
        value: pct,
        unit: 'Percentage',
        observation_count: total.length,
        evidence_ids: total.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `${promoListings.length} of ${total.length} listings feature active promotions.`,
      };
    },
  },

  ACTIVE_OFFICIAL_STORES_COUNT: {
    metric_id: 'ACTIVE_OFFICIAL_STORES_COUNT',
    name: 'Active Official Store Listings',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Count of listings verified from official brand stores (Shopee Mall / LazMall).',
    methodology: 'Count of records where is_official_store === true.',
    calculate: (records) => {
      const official = records.filter((r) => r.channel === 'E-commerce' && r.is_official_store === true);
      return {
        value: official.length > 0 ? official.length : 0,
        unit: 'Count',
        observation_count: official.length,
        evidence_ids: official.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: 'Count of official flagship / authorised store listings.',
      };
    },
  },

  OBSERVABLE_SALES_TRACTION_INDEX: {
    metric_id: 'OBSERVABLE_SALES_TRACTION_INDEX',
    name: 'Observable Cumulative Sales Traction Index',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'All'],
    unit: 'Index',
    aggregation_type: 'SUM',
    description: 'Normalized index derived from public cumulative sales counters (e.g. "1.2k sold").',
    methodology:
      'Sum of parsed cumulative sales badges across unique deduplicated product listings. Explicitly treated as a traction signal, NOT monthly POS volume.',
    calculate: (records) => {
      const withSales = records.filter((r) => r.channel === 'E-commerce' && Boolean(r.displayed_sales));
      if (withSales.length === 0) {
        return {
          value: null,
          unit: 'Index',
          observation_count: 0,
          evidence_ids: [],
          data_state: 'MISSING',
          methodology_note: 'No cumulative sales badges exposed in captured listings.',
        };
      }

      // Deduplicate listings by source_url (or platform + brand + product_sku) to avoid compounding cumulative lifetime badges across multi-snapshot crawls
      const listingMap = new Map<string, typeof withSales[0]>();
      for (const rec of withSales) {
        const key = rec.source_url || `${rec.platform}_${rec.brand}_${rec.product_sku || rec.raw_title}`;
        const existing = listingMap.get(key);
        if (!existing || (rec.captured_at || rec.published_at) > (existing.captured_at || existing.published_at)) {
          listingMap.set(key, rec);
        }
      }
      const uniqueListings = Array.from(listingMap.values());

      let totalTraction = 0;
      for (const rec of uniqueListings) {
        const text = (rec.displayed_sales || '').toLowerCase().replace(/[^0-9.k+]/g, '');
        let num = 0;
        if (text.includes('k')) {
          num = parseFloat(text.replace('k', '')) * 1000;
        } else {
          num = parseFloat(text.replace('+', '')) || 0;
        }
        if (!isNaN(num)) totalTraction += num;
      }

      return {
        value: Math.round(totalTraction),
        unit: 'Index',
        observation_count: uniqueListings.length,
        evidence_ids: uniqueListings.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Cumulative marketplace traction index aggregated across ${uniqueListings.length} unique deduplicated listings.`,
      };
    },
  },

  // ============================================================================
  // DATA CUT 4b: SKU & Portfolio Metrics
  // ============================================================================
  CANONICAL_SKU_COUNT: {
    metric_id: 'CANONICAL_SKU_COUNT',
    name: 'Canonical Benchmark SKU Count',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Total number of benchmark canonical SKUs defined in the core intelligence specification universe (28 models across 4 brands: HP=7, Epson=7, Canon=8, Brother=6).',
    methodology: 'Count of canonical SKUs registered in CANONICAL_SKUS master registry for the brand.',
    calculate: (records) => {
      const brand = records[0]?.brand;
      const count = brand ? CANONICAL_SKUS.filter((s) => s.brand === brand).length : CANONICAL_SKUS.length;
      return {
        value: count,
        unit: 'Count',
        observation_count: count,
        evidence_ids: records.slice(0, 5).map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Core benchmark specification universe defines ${count} canonical SKUs for ${brand || 'all brands'}.`,
      };
    },
  },

  OBSERVED_SKU_COUNT: {
    metric_id: 'OBSERVED_SKU_COUNT',
    name: 'Observed Active SKU Count',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'JIB', 'Advice', 'Power Buy', 'Meta', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Number of distinct ink tank printer models actively observed in empirical evidence for this brand and period.',
    methodology: 'Count of distinct normalized product SKUs identified in evidence records for the segment.',
    calculate: (records) => {
      const distinctSkus = new Set(
        records
          .map((r) => r.product_sku)
          .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      );
      return {
        value: distinctSkus.size,
        unit: 'Count',
        observation_count: records.length,
        evidence_ids: records.slice(0, 10).map((r) => r.evidence_id),
        data_state: distinctSkus.size > 0 ? 'OBSERVED' : 'INSUFFICIENT_EVIDENCE',
        methodology_note: `Empirical evidence captures ${distinctSkus.size} distinct active models across ${records.length} observations.`,
      };
    },
  },

  MARKET_SKU_COUNT: {
    metric_id: 'MARKET_SKU_COUNT',
    name: 'Market Catalog Model Count',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Total number of printer models cataloged in the complete Thai ink tank market portfolio (65 models total; HP=12, Epson=20, Canon=18, Brother=15).',
    methodology: 'Count of models registered in ALL_MARKET_SKUS for the brand.',
    calculate: (records) => {
      const brand = records[0]?.brand;
      const count = brand ? ALL_MARKET_SKUS.filter((s) => s.brand === brand).length : ALL_MARKET_SKUS.length;
      return {
        value: count,
        unit: 'Count',
        observation_count: count,
        evidence_ids: records.slice(0, 5).map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Market catalog covers ${count} ink tank models for ${brand || 'all brands'} across Thailand.`,
      };
    },
  },

  // ============================================================================
  // DATA CUT 5: Consumer Sentiment & Review Dimensions
  // ============================================================================
  // CONSUMER REVIEW & RATINGS METRICS
  // ============================================================================

  AVG_CONSUMER_RATING: {
    metric_id: 'AVG_CONSUMER_RATING',
    name: 'Average Star Rating (out of 5)',
    channel: 'Consumer Review',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'Score',
    aggregation_type: 'AVERAGE',
    description: 'Mean star rating from verified buyer reviews across e-commerce marketplaces (calculated strictly from reviews with numeric ratings).',
    methodology: 'Average of star ratings across verified consumer review records with rating > 0. Does not assign synthetic ratings to unrated community discussions or include off-topic/tutorial records.',
    calculate: (records) => {
      const rated = records.filter(
        (r) => isValidConsumerReview(r) && typeof r.rating === 'number' && r.rating > 0
      );
      if (rated.length === 0) {
        return {
          value: null,
          unit: 'Score',
          observation_count: 0,
          evidence_ids: [],
          data_state: 'MISSING',
          methodology_note: 'No verified consumer review ratings recorded for this segment.',
        };
      }
      const sum = rated.reduce((acc, r) => acc + (r.rating || 0), 0);
      const avg = Number((sum / rated.length).toFixed(2));
      return {
        value: avg,
        unit: 'Score',
        observation_count: rated.length,
        evidence_ids: rated.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Average star rating from ${rated.length} verified consumer reviews with explicit ratings.`,
      };
    },
  },

  TOTAL_CONSUMER_REVIEWS_COUNT: {
    metric_id: 'TOTAL_CONSUMER_REVIEWS_COUNT',
    name: 'Total Verified Customer Reviews',
    channel: 'Consumer Review',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'Count',
    aggregation_type: 'SUM',
    description: 'Cumulative count of verified customer voice records (including rated e-commerce reviews and unrated Pantip community posts).',
    methodology: 'Count of all verified consumer voice and review records, excluding quarantined off-topic hardware comments, tutorial essays, and AI copies.',
    calculate: (records) => {
      const reviewRecords = records.filter(isValidConsumerReview);

      if (reviewRecords.length === 0) {
        return {
          value: null,
          unit: 'Count',
          observation_count: 0,
          evidence_ids: [],
          data_state: 'MISSING',
          methodology_note: 'No verified consumer review records recorded for this segment.',
        };
      }

      return {
        value: reviewRecords.length,
        unit: 'Count',
        observation_count: reviewRecords.length,
        evidence_ids: reviewRecords.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Count of ${reviewRecords.length} total customer voice records across e-commerce and community forums.`,
      };
    },
  },

  RATED_REVIEWS_COUNT: {
    metric_id: 'RATED_REVIEWS_COUNT',
    name: 'Rated Reviews Count',
    channel: 'Consumer Review',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Count of verified customer reviews that include explicit numeric star ratings (1 to 5 stars).',
    methodology: 'Count of Consumer Review records with numeric rating > 0, excluding off-topic records.',
    calculate: (records) => {
      const rated = records.filter(
        (r) => isValidConsumerReview(r) && typeof r.rating === 'number' && r.rating > 0
      );
      return {
        value: rated.length,
        unit: 'Count',
        observation_count: rated.length,
        evidence_ids: rated.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Count of ${rated.length} verified customer reviews with explicit star ratings.`,
      };
    },
  },

  UNRATED_CONSUMER_VOICE_COUNT: {
    metric_id: 'UNRATED_CONSUMER_VOICE_COUNT',
    name: 'Unrated Consumer Voice Records',
    channel: 'Consumer Review',
    applicable_platforms: ['Pantip', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Count of qualitative consumer voice records (such as Pantip forum discussions) that contain authentic user feedback without numeric star ratings.',
    methodology: 'Count of verified Consumer Review records without numeric star ratings, excluding off-topic discussions.',
    calculate: (records) => {
      const unrated = records.filter(
        (r) =>
          isValidConsumerReview(r) &&
          (r.rating === undefined || r.rating === null || r.rating <= 0)
      );
      return {
        value: unrated.length,
        unit: 'Count',
        observation_count: unrated.length,
        evidence_ids: unrated.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Count of ${unrated.length} qualitative community voice records without star ratings.`,
      };
    },
  },

  SHOPEE_REVIEW_COUNT: {
    metric_id: 'SHOPEE_REVIEW_COUNT',
    name: 'Shopee Review Count',
    channel: 'Consumer Review',
    applicable_platforms: ['Shopee', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Count of customer reviews captured from Shopee Thailand verified purchaser listings.',
    methodology: 'Count of legitimate Consumer Review records from Shopee.',
    calculate: (records) => {
      const shopeeReviews = records.filter(
        (r) => isValidConsumerReview(r) && r.platform === 'Shopee'
      );
      return {
        value: shopeeReviews.length,
        unit: 'Count',
        observation_count: shopeeReviews.length,
        evidence_ids: shopeeReviews.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Count of ${shopeeReviews.length} verified customer reviews from Shopee Thailand.`,
      };
    },
  },

  PANTIP_CONSUMER_VOICE_COUNT: {
    metric_id: 'PANTIP_CONSUMER_VOICE_COUNT',
    name: 'Pantip Consumer Voice Posts',
    channel: 'Consumer Review',
    applicable_platforms: ['Pantip', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Count of qualitative consumer voice records captured from Pantip.com Thai forum community threads.',
    methodology: 'Count of legitimate Consumer Review records from Pantip, excluding off-topic hardware threads and tutorial essays.',
    calculate: (records) => {
      const pantipReviews = records.filter(
        (r) => isValidConsumerReview(r) && r.platform === 'Pantip'
      );
      return {
        value: pantipReviews.length,
        unit: 'Count',
        observation_count: pantipReviews.length,
        evidence_ids: pantipReviews.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Count of ${pantipReviews.length} community voice posts from Pantip.com.`,
      };
    },
  },

  POSITIVE_SENTIMENT_PCT: {
    metric_id: 'POSITIVE_SENTIMENT_PCT',
    name: 'Positive Consumer Sentiment %',
    channel: 'Consumer Review',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'JIB', 'Advice', 'Power Buy', 'All'],
    unit: 'Percentage',
    aggregation_type: 'PERCENTAGE',
    description: 'Percentage of verified customer reviews expressing positive sentiment (star rating >= 4).',
    methodology: '(Count of positive reviews [rating >= 4] / Total rated consumer reviews) * 100.',
    calculate: (records) => {
      const ratedReviews = records.filter(
        (r) => isValidConsumerReview(r) && typeof r.rating === 'number' && r.rating > 0
      );
      if (ratedReviews.length === 0) {
        return {
          value: null,
          unit: 'Percentage',
          observation_count: 0,
          evidence_ids: [],
          data_state: 'MISSING',
          methodology_note: 'No verified consumer reviews with ratings recorded to compute positive sentiment share.',
        };
      }
      const positiveCount = ratedReviews.filter((r) => (r.rating || 0) >= 4).length;
      const pct = Number(((positiveCount / ratedReviews.length) * 100).toFixed(1));
      return {
        value: pct,
        unit: 'Percentage',
        observation_count: ratedReviews.length,
        evidence_ids: ratedReviews.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Calculated as ${positiveCount} positive reviews (>=4★) / ${ratedReviews.length} total reviews * 100.`,
      };
    },
  },
};

export function getMetricDefinition(metricId: MetricId): MetricDefinition {
  const def = METRIC_DEFINITIONS[metricId];
  if (!def) {
    throw new Error(`Metric definition not found for ID: ${metricId}`);
  }
  return def;
}

export function getAllMetricDefinitions(): MetricDefinition[] {
  return Object.values(METRIC_DEFINITIONS);
}
