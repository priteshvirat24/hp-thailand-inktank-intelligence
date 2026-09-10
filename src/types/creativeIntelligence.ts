/**
 * Creative Intelligence Schema Contracts
 * Clean schema for advertising creative intelligence and brand messaging claims.
 * All competitive observations are traceable to RawEvidenceRecord.
 */

import { TargetBrand } from './brands';

export type CreativeMediaType = 'Video' | 'Static Image' | 'Carousel';
export type AdStatus = 'Active' | 'Inactive';

export interface CreativeStrategicAnalysis {
  core_hook: string;
  hook_category: 'Service & Warranty' | 'Price & Discount' | 'Product Feature' | 'Brand Value' | 'TCO & Economy';
  target_persona: string;
  consumer_pain_point: string;
  threat_level_to_hp: 'High' | 'Medium' | 'Low';
  hp_counter_playbook: string;
  key_selling_points: string[];
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
  channel_presence: string;
  primary_channel: string;
}
