import { describe, it, expect } from 'vitest';
import {
  CRAWL_SEEDS,
  getSeedsByBrand,
  getSeedsByPlatform,
  getSeedById,
} from '@/config/seeds';
import { TARGET_BRANDS } from '@/config/brands';

describe('Authoritative Crawl Seeds & Target Registry', () => {
  it('contains verified seed targets for all 4 target brands', () => {
    TARGET_BRANDS.forEach((brand) => {
      const brandSeeds = getSeedsByBrand(brand);
      expect(brandSeeds.length).toBeGreaterThanOrEqual(4); // Meta, GAds, Shopee, Lazada, FB, IG, YT
    });
  });

  it('enforces Thailand country scope and th-TH locale across all seeds', () => {
    CRAWL_SEEDS.forEach((seed) => {
      expect(seed.country).toBe('Thailand');
      expect(seed.locale).toBe('th-TH');
      expect(seed.seed_url).toMatch(/^https?:\/\//);
      expect(seed.target_id).toMatch(/^SEED-[A-Z0-9_-]+$/);
    });
  });

  it('contains mandatory paid media, social, and e-commerce seeds', () => {
    const metaSeeds = getSeedsByPlatform('Meta');
    const gadsSeeds = getSeedsByPlatform('Google Ads');
    const shopeeSeeds = getSeedsByPlatform('Shopee');
    const lazadaSeeds = getSeedsByPlatform('Lazada');
    const tiktokShopSeeds = getSeedsByPlatform('TikTok Shop');
    const jibSeeds = getSeedsByPlatform('JIB');

    expect(metaSeeds.length).toBe(4);
    expect(gadsSeeds.length).toBe(4);
    expect(shopeeSeeds.length).toBe(4);
    expect(lazadaSeeds.length).toBe(4);
    expect(tiktokShopSeeds.length).toBe(4);
    expect(jibSeeds.length).toBe(1);
  });

  it('retrieves seeds by target ID accurately', () => {
    const seed = getSeedById('SEED-SHOPEE-HP');
    expect(seed).toBeDefined();
    expect(seed?.brand).toBe('HP');
    expect(seed?.platform).toBe('Shopee');
    expect(seed?.channel).toBe('E-commerce');
  });
});
