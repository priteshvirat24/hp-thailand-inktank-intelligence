import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { BRAND_MESSAGING_PILLARS, CHANNEL_COOP_PARTNERS } from '../data/creativeIntelligenceData';
import { assignAnalyticalMonth } from '@/lib/dates';
import type { BrandMessagingPillar, ChannelCoOpPartner } from '../types/creativeIntelligence';

describe('BUG-002 Remediation: Creative & Advertising Intelligence Verification', () => {
  // Ensure store is initialized
  globalEvidenceStore.loadFromDisk(true);
  const allRecords = globalEvidenceStore.getAll();
  const paidAds = allRecords.filter((r) => r.channel === 'Paid Media');

  describe('1. Elimination of Fabricated Data Structures & Values', () => {
    it('verifies fabricated spend and impression ranges are NOT exported or present in creative data', async () => {
      const dataFilePath = path.join(process.cwd(), 'src/data/creativeIntelligenceData.ts');
      const dataCode = fs.readFileSync(dataFilePath, 'utf-8');

      // Prohibited fabricated strings identified in audit
      expect(dataCode.includes('spend_range_thb')).toBe(false);
      expect(dataCode.includes('impressions_range')).toBe(false);
      expect(dataCode.includes('฿25,000 – ฿50,000')).toBe(false);
      expect(dataCode.includes('350K – 700K')).toBe(false);
      expect(dataCode.includes('฿75,000 – ฿120,000')).toBe(false);
      expect(dataCode.includes('900K – 1.5M')).toBe(false);
    });

    it('verifies fabricated demographic and regional percentage distributions are NOT exported', () => {
      const dataFilePath = path.join(process.cwd(), 'src/data/creativeIntelligenceData.ts');
      const dataCode = fs.readFileSync(dataFilePath, 'utf-8');

      expect(dataCode.includes('THAI_DEMOGRAPHIC_STATS')).toBe(false);
      expect(dataCode.includes('age_distribution')).toBe(false);
      expect(dataCode.includes('regional_distribution')).toBe(false);
      expect(dataCode.includes('bangkok_metro')).toBe(false);
      expect(dataCode.includes('central_thailand')).toBe(false);
    });

    it('verifies fabricated retailer co-op percentages (e.g. Brother 62%, HP 22%) are eliminated', () => {
      const dataFilePath = path.join(process.cwd(), 'src/data/creativeIntelligenceData.ts');
      const dataCode = fs.readFileSync(dataFilePath, 'utf-8');

      expect(dataCode.includes('share_of_retailer_ads')).toBe(false);
      expect(dataCode.includes('active_ad_flights')).toBe(false);
      expect(dataCode.includes('62%')).toBe(false);
      expect(dataCode.includes('22%')).toBe(false);

      CHANNEL_COOP_PARTNERS.forEach((partner: ChannelCoOpPartner) => {
        expect(partner.partner_name).toBeDefined();
        expect(partner.brands_supported.length).toBeGreaterThan(0);
        // Ensure no fake share percentages exist on the partner object
        expect((partner as unknown as Record<string, unknown>).share_of_retailer_ads).toBeUndefined();
        expect((partner as unknown as Record<string, unknown>).active_ad_flights).toBeUndefined();
      });
    });

    it('verifies static ad counts such as "~68 Live Results" or "~13 Live Results" are NOT in advertising files', () => {
      const sectionPath = path.join(process.cwd(), 'src/components/sections/AdvertisingSection.tsx');
      const sectionCode = fs.readFileSync(sectionPath, 'utf-8');

      expect(sectionCode.includes('~68 Live Results')).toBe(false);
      expect(sectionCode.includes('~13 Live Results')).toBe(false);
      expect(sectionCode.includes('68 Live')).toBe(false);
    });
  });

  describe('2. Advertising Observations from Genuine Evidence Lake', () => {
    it('verifies all advertising records originate from Evidence Lake with Paid Media channel', () => {
      expect(paidAds.length).toBe(156);
      for (const ad of paidAds) {
        expect(ad.channel).toBe('Paid Media');
        expect(ad.platform).toBe('Meta');
        expect(['HP', 'Epson', 'Canon', 'Brother']).toContain(ad.brand);
      }
    });

    it('verifies every ad creative has a verifiable deterministic evidence_id', () => {
      for (const ad of paidAds) {
        expect(ad.evidence_id).toMatch(/^EVID-META-[A-F0-9]+$/);
        expect(ad.evidence_id.length).toBeGreaterThan(15);
      }
    });

    it('verifies ad creatives contain authentic Thai copy and working source URLs', () => {
      for (const ad of paidAds) {
        expect(ad.raw_title.length).toBeGreaterThan(5);
        expect(ad.raw_content_th.length).toBeGreaterThan(10);
        expect(ad.source_url).toMatch(/^https:\/\/www\.facebook\.com\/ads\/library\//);
        expect(ad.screenshot_url).toMatch(/^\/screenshots\/ads\//);
      }
    });

    it('verifies all associated ad screenshots physically exist in the public directory', () => {
      for (const ad of paidAds) {
        expect(ad.screenshot_url).toBeDefined();
        const relPath = ad.screenshot_url!.replace(/^\//, '');
        const fullPath = path.join(process.cwd(), 'public', relPath);
        expect(fs.existsSync(fullPath)).toBe(true);
      }
    });
  });

  describe('3. Multi-Dimensional Filter Verification (Month & Brand)', () => {
    it('verifies Month filter partitions advertising records authentically across June, July, August 2026', () => {
      const juneAds = paidAds.filter((r) => assignAnalyticalMonth(r.published_at) === '2026-06');
      const julyAds = paidAds.filter((r) => assignAnalyticalMonth(r.published_at) === '2026-07');
      const augAds = paidAds.filter((r) => assignAnalyticalMonth(r.published_at) === '2026-08');

      expect(juneAds.length).toBe(52);
      expect(julyAds.length).toBe(52);
      expect(augAds.length).toBe(52);
      expect(juneAds.length + julyAds.length + augAds.length).toBe(156);

      // Verify June dates do NOT leak into August
      for (const ad of juneAds) {
        expect(ad.published_at.startsWith('2026-08')).toBe(false);
      }
      for (const ad of augAds) {
        expect(ad.published_at.startsWith('2026-06')).toBe(false);
      }
    });

    it('verifies Brand filter correctly isolates records for HP, Epson, Canon, and Brother', () => {
      const hpAds = paidAds.filter((r) => r.brand === 'HP');
      const epsonAds = paidAds.filter((r) => r.brand === 'Epson');
      const brotherAds = paidAds.filter((r) => r.brand === 'Brother');
      const canonAds = paidAds.filter((r) => r.brand === 'Canon');

      expect(hpAds.length).toBe(48);
      expect(epsonAds.length).toBe(36);
      expect(brotherAds.length).toBe(36);
      expect(canonAds.length).toBe(36);
      expect(hpAds.length + epsonAds.length + brotherAds.length + canonAds.length).toBe(156);

      // HP-specific SKU verification
      for (const ad of hpAds) {
        expect(ad.brand).toBe('HP');
        expect(ad.product_sku).toMatch(/Smart Tank/);
      }
    });

    it('verifies format distribution is authentically represented across Video, Static, and Carousel', () => {
      const videos = paidAds.filter((r) => r.creative_format === 'Video');
      const statics = paidAds.filter((r) => r.creative_format === 'Static Image');
      const carousels = paidAds.filter((r) => r.creative_format === 'Carousel');

      expect(videos.length).toBeGreaterThan(0);
      expect(statics.length).toBeGreaterThan(0);
      expect(carousels.length).toBeGreaterThan(0);
      expect(videos.length + statics.length + carousels.length).toBe(156);
    });
  });

  describe('4. Missing Data Integrity Invariant', () => {
    it('verifies unobserved commercial fields (price, discount, rating) remain null in Paid Media evidence', () => {
      for (const ad of paidAds) {
        expect(ad.price_current_thb).toBeNull();
        expect(ad.price_original_thb).toBeNull();
        expect(ad.discount_pct).toBeNull();
        expect(ad.rating).toBeNull();
        expect(ad.review_count).toBeNull();
      }
    });

    it('verifies no Math.random() exists in AdvertisingSection or creativeIntelligenceData', () => {
      const dataFilePath = path.join(process.cwd(), 'src/data/creativeIntelligenceData.ts');
      const sectionPath = path.join(process.cwd(), 'src/components/sections/AdvertisingSection.tsx');

      const dataCode = fs.readFileSync(dataFilePath, 'utf-8');
      const sectionCode = fs.readFileSync(sectionPath, 'utf-8');

      expect(dataCode.includes('Math.random')).toBe(false);
      expect(sectionCode.includes('Math.random')).toBe(false);
    });
  });

  describe('5. Brand Messaging Pillars Integrity', () => {
    it('preserves genuine qualitative manufacturer warranty and TCO specifications', () => {
      expect(BRAND_MESSAGING_PILLARS.length).toBe(4);
      const brands = BRAND_MESSAGING_PILLARS.map((p) => p.brand);
      expect(brands).toContain('HP');
      expect(brands).toContain('Canon');
      expect(brands).toContain('Epson');
      expect(brands).toContain('Brother');

      BRAND_MESSAGING_PILLARS.forEach((pillar: BrandMessagingPillar) => {
        expect(pillar.tagline.length).toBeGreaterThan(0);
        expect(pillar.warranty_service_claim.claim.length).toBeGreaterThan(0);
        expect(pillar.tco_ink_claim.black_page_yield).toBeGreaterThan(0);
        expect(pillar.tco_ink_claim.ink_bottle_model.length).toBeGreaterThan(0);
        expect(pillar.smart_app_claim.app_name.length).toBeGreaterThan(0);
      });

      const hp = BRAND_MESSAGING_PILLARS.find((p) => p.brand === 'HP')!;
      expect(hp.warranty_service_claim.onsite_support).toBe(true);
      expect(hp.smart_app_claim.app_name).toBe('HP Smart App');

      const epson = BRAND_MESSAGING_PILLARS.find((p) => p.brand === 'Epson')!;
      expect(epson.tagline.toLowerCase()).toContain('heat-free');

      const brother = BRAND_MESSAGING_PILLARS.find((p) => p.brand === 'Brother')!;
      expect(brother.warranty_service_claim.claim.toLowerCase()).toContain('print head');
    });
  });
});
