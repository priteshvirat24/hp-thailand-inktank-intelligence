/**
 * Authoritative Metric Definitions & Calculation Registry
 * 
 * Central repository for all analytical formulas, aggregation semantics,
 * and lineage requirements across the 5 Data Cuts.
 */

import { MetricId, MetricName, MetricUnit, AggregationType, DataState } from '@/types/analytics';
import { ChannelType, PlatformType } from '@/types/sources';
import { RawEvidenceRecord } from '@/types/evidence';

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

/**
 * Metric Definitions Registry
 */
export const METRIC_DEFINITIONS: Record<MetricId, MetricDefinition> = {
  // ============================================================================
  // DATA CUT 1: Online Visibility & Share of Voice
  // ============================================================================
  AD_PRESENCE_COUNT: {
    metric_id: 'AD_PRESENCE_COUNT',
    name: 'Unique Active Ads',
    channel: 'Paid Media',
    applicable_platforms: ['Meta', 'Google Ads', 'YouTube', 'All'],
    unit: 'Count',
    aggregation_type: 'COUNT',
    description: 'Count of unique active paid ad creatives observed during the analytical window.',
    methodology: 'Count of distinct ad observations filtered by brand, month, and paid media platforms.',
    calculate: (records) => {
      const ads = records.filter((r) => r.channel === 'Paid Media');
      return {
        value: ads.length > 0 ? ads.length : 0,
        unit: 'Count',
        observation_count: ads.length,
        evidence_ids: ads.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: 'Direct count of observed paid media ad creatives.',
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
    description: 'Sum of all verified observations (Paid Media Ads + Social Posts + E-Commerce Listings).',
    methodology: 'Count of all valid evidence records for the brand and month.',
    calculate: (records) => {
      return {
        value: records.length > 0 ? records.length : 0,
        unit: 'Count',
        observation_count: records.length,
        evidence_ids: records.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: 'Combined sum of active ads, social posts, and marketplace listings.',
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
      'Sum of parsed cumulative sales badges. Explicitly treated as a traction signal, NOT monthly POS volume.',
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

      let totalTraction = 0;
      for (const rec of withSales) {
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
        observation_count: withSales.length,
        evidence_ids: withSales.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Cumulative marketplace traction index aggregated across ${withSales.length} listings.`,
      };
    },
  },

  // ============================================================================
  // DATA CUT 5: Consumer Sentiment
  // ============================================================================
  AVG_CONSUMER_RATING: {
    metric_id: 'AVG_CONSUMER_RATING',
    name: 'Average Star Rating (out of 5)',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'All'],
    unit: 'Score',
    aggregation_type: 'AVERAGE',
    description: 'Mean star rating from verified buyer reviews on marketplace flagships.',
    methodology: 'Average of rating observations across product listings.',
    calculate: (records) => {
      const rated = records.filter((r) => typeof r.rating === 'number' && r.rating > 0);
      if (rated.length === 0) {
        return {
          value: null,
          unit: 'Score',
          observation_count: 0,
          evidence_ids: [],
          data_state: 'MISSING',
          methodology_note: 'No buyer ratings recorded for this segment.',
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
        methodology_note: `Average star rating from ${rated.length} verified listings.`,
      };
    },
  },

  TOTAL_CONSUMER_REVIEWS_COUNT: {
    metric_id: 'TOTAL_CONSUMER_REVIEWS_COUNT',
    name: 'Total Verified Customer Reviews',
    channel: 'E-commerce',
    applicable_platforms: ['Shopee', 'Lazada', 'TikTok Shop', 'All'],
    unit: 'Count',
    aggregation_type: 'SUM',
    description: 'Cumulative count of verified customer reviews captured across listings.',
    methodology: 'Sum of review_count observations across e-commerce records.',
    calculate: (records) => {
      const withReviews = records.filter(
        (r) => r.channel === 'E-commerce' && typeof r.review_count === 'number' && r.review_count > 0
      );
      if (withReviews.length === 0) {
        return {
          value: null,
          unit: 'Count',
          observation_count: 0,
          evidence_ids: [],
          data_state: 'MISSING',
          methodology_note: 'No customer review counts recorded.',
        };
      }
      const total = withReviews.reduce((acc, r) => acc + (r.review_count || 0), 0);
      return {
        value: total,
        unit: 'Count',
        observation_count: withReviews.length,
        evidence_ids: withReviews.map((r) => r.evidence_id),
        data_state: 'OBSERVED',
        methodology_note: `Summed from ${withReviews.length} listings.`,
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
