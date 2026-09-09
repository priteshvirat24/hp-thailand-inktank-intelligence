/**
 * Meta Ad Library API & Creative Intelligence Schema
 * Mirrors the Apify / Meta Graph API Ad Library specification for Thailand Ink Tank market.
 */

import { TargetBrand } from './brands';

export type CreativeMediaType = 'Video' | 'Static Image' | 'Carousel';
export type AdStatus = 'Active' | 'Inactive';
export type CallToActionType =
  | 'LEARN_MORE'
  | 'SHOP_NOW'
  | 'SEND_MESSAGE'
  | 'ORDER_NOW'
  | 'SIGN_UP'
  | 'WATCH_MORE';

export type PublisherPlatform = 'facebook' | 'instagram' | 'messenger' | 'audience_network';

export interface DemographicBreakdown {
  age_18_24: number; // percentage
  age_25_34: number;
  age_35_44: number;
  age_45_54: number;
  age_55_plus: number;
  male_pct: number;
  female_pct: number;
}

export interface RegionalBreakdown {
  bangkok_metro: number; // percentage
  central_thailand: number;
  northern_thailand: number;
  northeastern_thailand: number; // Isan
  southern_thailand: number;
}

export interface CreativeStrategicAnalysis {
  core_hook: string;
  hook_category: 'Service & Warranty' | 'Price & Discount' | 'Product Feature' | 'Brand Value' | 'TCO & Economy';
  target_persona: string;
  consumer_pain_point: string;
  threat_level_to_hp: 'High' | 'Medium' | 'Low';
  hp_counter_playbook: string;
  key_selling_points: string[];
}

export interface MetaAdRecord {
  ad_id: string; // Real Meta Ad Library ID
  brand: TargetBrand;
  page_id: string;
  page_name: string;
  advertiser_type: 'Official Brand' | 'Certified Retailer' | 'Independent Dealer';
  status: AdStatus;
  start_date: string;
  end_date: string | null;
  duration_days: number;
  creative_format: CreativeMediaType;
  publisher_platforms: PublisherPlatform[];
  
  // Ad Copy & Creative Elements
  ad_creative_body: string; // Verbatim Thai
  ad_creative_body_en: string; // English Translation
  ad_creative_link_title: string; // Headline / Title
  ad_creative_link_caption: string; // Display URL / Domain
  call_to_action: CallToActionType;
  
  // Spend & Impressions Estimates
  spend_range_thb: {
    min: number;
    max: number;
    display: string;
  };
  impressions_range: {
    min: number;
    max: number;
    display: string;
  };
  
  // Audience Targeting
  demographics: DemographicBreakdown;
  regional_distribution: RegionalBreakdown;
  
  // Evidence Verification
  screenshot_url: string;
  source_url: string;
  verification_status: '100% Verified Live Capture';
  
  // Strategic Teardown
  strategic_analysis: CreativeStrategicAnalysis;
}

export interface BrandMessagingPillar {
  brand: TargetBrand;
  tagline: string;
  warranty_service_claim: {
    claim: string;
    terms: string;
    onsite_support: boolean;
    hp_advantage: string;
  };
  tco_ink_claim: {
    black_page_yield: number;
    color_page_yield: number;
    cost_per_page_thb: number;
    ink_bottle_model: string;
  };
  smart_app_claim: {
    app_name: string;
    key_features: string[];
  };
  promotional_strategy: {
    primary_campaign: string;
    discount_depth: string;
    co_op_retailers: string[];
  };
}

export interface ChannelCoOpPartner {
  partner_name: string;
  logo_key: string;
  brands_supported: TargetBrand[];
  active_ad_flights: number;
  primary_offer: string;
  share_of_retailer_ads: Record<TargetBrand, number>;
}
