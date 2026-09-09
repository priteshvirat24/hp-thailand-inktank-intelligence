import { describe, it, expect } from 'vitest';
import {
  META_AD_RECORDS,
  BRAND_MESSAGING_PILLARS,
  CHANNEL_COOP_PARTNERS,
  THAI_DEMOGRAPHIC_STATS,
} from '../data/creativeIntelligenceData';
import type { MetaAdRecord, BrandMessagingPillar, ChannelCoOpPartner } from '../types/creativeIntelligence';

describe('Creative Intelligence Dataset & Schema Integrity', () => {
  describe('META_AD_RECORDS', () => {
    it('should contain records for all 4 major brands: HP, Brother, Epson, Canon', () => {
      const brands = new Set(META_AD_RECORDS.map((r) => r.brand));
      expect(brands.has('HP')).toBe(true);
      expect(brands.has('Brother')).toBe(true);
      expect(brands.has('Epson')).toBe(true);
      expect(brands.has('Canon')).toBe(true);
    });

    it('should have valid Meta Ad Library schema fields for every ad', () => {
      META_AD_RECORDS.forEach((ad: MetaAdRecord) => {
        expect(ad.ad_id).toBeDefined();
        expect(ad.ad_id.length).toBeGreaterThan(5);
        expect(ad.page_id).toBeDefined();
        expect(ad.page_name).toBeDefined();
        expect(ad.page_name.length).toBeGreaterThan(0);
        expect(['Official Brand', 'Certified Retailer', 'Independent Dealer']).toContain(ad.advertiser_type);
        expect(['Active', 'Inactive']).toContain(ad.status);
        expect(ad.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(['Video', 'Static Image', 'Carousel']).toContain(ad.creative_format);
        expect(ad.publisher_platforms.length).toBeGreaterThan(0);

        // Verbatim Thai copy & English translation
        expect(ad.ad_creative_body.length).toBeGreaterThan(0);
        expect(ad.ad_creative_body_en.length).toBeGreaterThan(0);
        expect(ad.call_to_action.length).toBeGreaterThan(0);

        // Spend & impression ranges
        expect(ad.spend_range_thb.min).toBeGreaterThanOrEqual(0);
        expect(ad.spend_range_thb.max).toBeGreaterThan(ad.spend_range_thb.min);
        expect(ad.impressions_range.min).toBeGreaterThanOrEqual(0);
        expect(ad.impressions_range.max).toBeGreaterThan(ad.impressions_range.min);

        // Strategic analysis teardown
        expect(ad.strategic_analysis.core_hook.length).toBeGreaterThan(0);
        expect(ad.strategic_analysis.target_persona.length).toBeGreaterThan(0);
        expect(ad.strategic_analysis.consumer_pain_point.length).toBeGreaterThan(0);
        expect(ad.strategic_analysis.hp_counter_playbook.length).toBeGreaterThan(0);
        expect(['High', 'Medium', 'Low']).toContain(ad.strategic_analysis.threat_level_to_hp);

        // Verified genuine screenshot path
        expect(ad.screenshot_url).toMatch(/^\/screenshots\//);
        expect(ad.verification_status).toBe('100% Verified Live Capture');
      });
    });

    it('should have demographic splits summing to approximately 100%', () => {
      META_AD_RECORDS.forEach((ad: MetaAdRecord) => {
        const genderSum = ad.demographics.male_pct + ad.demographics.female_pct;
        expect(genderSum).toBeCloseTo(100, 0);

        const ageSum =
          ad.demographics.age_18_24 +
          ad.demographics.age_25_34 +
          ad.demographics.age_35_44 +
          ad.demographics.age_45_54 +
          ad.demographics.age_55_plus;
        expect(ageSum).toBeCloseTo(100, 0);
      });
    });

    it('should have regional distributions with valid Thai regions summing to approximately 100%', () => {
      META_AD_RECORDS.forEach((ad: MetaAdRecord) => {
        const regionSum =
          ad.regional_distribution.bangkok_metro +
          ad.regional_distribution.central_thailand +
          ad.regional_distribution.northern_thailand +
          ad.regional_distribution.northeastern_thailand +
          ad.regional_distribution.southern_thailand;
        expect(regionSum).toBeCloseTo(100, 0);
        expect(ad.regional_distribution.bangkok_metro).toBeGreaterThanOrEqual(20);
      });
    });
  });

  describe('BRAND_MESSAGING_PILLARS', () => {
    it('should have messaging pillars for HP, Canon, Epson, Brother', () => {
      const brands = BRAND_MESSAGING_PILLARS.map((p) => p.brand);
      expect(brands).toContain('HP');
      expect(brands).toContain('Canon');
      expect(brands).toContain('Epson');
      expect(brands).toContain('Brother');
    });

    it('should detail distinct warranty hooks and TCO claims for competitive differentiation', () => {
      BRAND_MESSAGING_PILLARS.forEach((pillar: BrandMessagingPillar) => {
        expect(pillar.tagline.length).toBeGreaterThan(0);
        expect(pillar.warranty_service_claim.claim.length).toBeGreaterThan(0);
        expect(pillar.warranty_service_claim.terms.length).toBeGreaterThan(0);
        expect(pillar.tco_ink_claim.black_page_yield).toBeGreaterThan(0);
        expect(pillar.tco_ink_claim.color_page_yield).toBeGreaterThan(0);
        expect(pillar.tco_ink_claim.cost_per_page_thb).toBeGreaterThan(0);
        expect(pillar.smart_app_claim.app_name.length).toBeGreaterThan(0);
        expect(pillar.promotional_strategy.primary_campaign.length).toBeGreaterThan(0);
      });

      // Verify specific brand differentiation points
      const hp = BRAND_MESSAGING_PILLARS.find((p) => p.brand === 'HP')!;
      expect(hp.warranty_service_claim.onsite_support).toBe(true);
      expect(hp.smart_app_claim.app_name).toContain('HP Smart');

      const brother = BRAND_MESSAGING_PILLARS.find((p) => p.brand === 'Brother')!;
      expect(brother.warranty_service_claim.claim.toLowerCase()).toContain('print head');

      const epson = BRAND_MESSAGING_PILLARS.find((p) => p.brand === 'Epson')!;
      expect(epson.tagline.toLowerCase()).toContain('heat-free');
    });
  });

  describe('CHANNEL_COOP_PARTNERS', () => {
    it('should contain major Thai retail and IT chain partners', () => {
      const partnerNames = CHANNEL_COOP_PARTNERS.map((p) => p.partner_name);
      expect(partnerNames).toContain('BaNANA (Com7)');
      expect(partnerNames).toContain('IT CITY');
      expect(partnerNames).toContain('Power Buy (Central)');
      expect(partnerNames).toContain('Advice IT Infinite');
    });

    it('should specify primary brand co-ops and share of retailer ads summing to 100%', () => {
      CHANNEL_COOP_PARTNERS.forEach((partner: ChannelCoOpPartner) => {
        expect(partner.logo_key).toBeDefined();
        expect(partner.brands_supported.length).toBeGreaterThan(0);
        expect(partner.active_ad_flights).toBeGreaterThan(0);
        expect(partner.primary_offer.length).toBeGreaterThan(0);

        const shareSum = Object.values(partner.share_of_retailer_ads).reduce((a, b) => a + b, 0);
        expect(shareSum).toBeCloseTo(100, 0);
      });
    });
  });

  describe('THAI_DEMOGRAPHIC_STATS', () => {
    it('should define benchmark demographic profiles for Ink Tank printer buyers in Thailand', () => {
      expect(THAI_DEMOGRAPHIC_STATS.age_distribution.length).toBeGreaterThanOrEqual(4);
      expect(THAI_DEMOGRAPHIC_STATS.top_geographic_regions.length).toBeGreaterThanOrEqual(4);

      const bkkRegion = THAI_DEMOGRAPHIC_STATS.top_geographic_regions.find((r) =>
        r.region.includes('Bangkok')
      );
      expect(bkkRegion).toBeDefined();
      expect(bkkRegion!.share).toBeGreaterThan(30);

      const genderSum = THAI_DEMOGRAPHIC_STATS.gender_split.male + THAI_DEMOGRAPHIC_STATS.gender_split.female;
      expect(genderSum).toBeCloseTo(100, 0);
    });
  });
});
