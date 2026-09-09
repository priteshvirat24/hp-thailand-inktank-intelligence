/**
 * Authoritative Crawl Targets & Seed Registry
 * 
 * Defines seed targets for targeted crawling of official brand stores, ad libraries,
 * and social channels across HP, Epson, Canon, and Brother in Thailand.
 */

import { TargetBrand } from '@/types/brands';
import { ChannelType, PlatformType } from '@/types/sources';

export type SeedStatus = 'ACTIVE_SEED' | 'PENDING_VERIFICATION';

export interface CrawlTarget {
  readonly target_id: string;
  readonly source_id: string;
  readonly brand: TargetBrand;
  readonly platform: PlatformType;
  readonly channel: ChannelType;
  readonly seed_url: string;
  readonly query_template?: string;
  readonly country: 'Thailand';
  readonly locale: 'th-TH';
  readonly status: SeedStatus;
}

export const CRAWL_SEEDS: readonly CrawlTarget[] = [
  // ============================================================================
  // PAID MEDIA: Meta Ad Library Thailand (Mandatory)
  // ============================================================================
  {
    target_id: 'SEED-META-HP',
    source_id: 'src-meta-ads',
    brand: 'HP',
    platform: 'Meta',
    channel: 'Paid Media',
    seed_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=HP%20Smart%20Tank',
    query_template: 'HP Smart Tank',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-META-EPSON',
    source_id: 'src-meta-ads',
    brand: 'Epson',
    platform: 'Meta',
    channel: 'Paid Media',
    seed_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=Epson%20EcoTank',
    query_template: 'Epson EcoTank',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-META-CANON',
    source_id: 'src-meta-ads',
    brand: 'Canon',
    platform: 'Meta',
    channel: 'Paid Media',
    seed_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=Canon%20MegaTank',
    query_template: 'Canon MegaTank',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-META-BROTHER',
    source_id: 'src-meta-ads',
    brand: 'Brother',
    platform: 'Meta',
    channel: 'Paid Media',
    seed_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=Brother%20InkBenefit',
    query_template: 'Brother InkBenefit',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },

  // ============================================================================
  // PAID MEDIA: Google Ads Transparency Center Thailand (Mandatory)
  // ============================================================================
  {
    target_id: 'SEED-GADS-HP',
    source_id: 'src-google-ads',
    brand: 'HP',
    platform: 'Google Ads',
    channel: 'Paid Media',
    seed_url: 'https://adstransparency.google.com/?region=TH&domain=hp.com',
    query_template: 'HP Thailand',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-GADS-EPSON',
    source_id: 'src-google-ads',
    brand: 'Epson',
    platform: 'Google Ads',
    channel: 'Paid Media',
    seed_url: 'https://adstransparency.google.com/?region=TH&domain=epson.co.th',
    query_template: 'Epson Thailand',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-GADS-CANON',
    source_id: 'src-google-ads',
    brand: 'Canon',
    platform: 'Google Ads',
    channel: 'Paid Media',
    seed_url: 'https://adstransparency.google.com/?region=TH&domain=canon.co.th',
    query_template: 'Canon Thailand',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-GADS-BROTHER',
    source_id: 'src-google-ads',
    brand: 'Brother',
    platform: 'Google Ads',
    channel: 'Paid Media',
    seed_url: 'https://adstransparency.google.com/?region=TH&domain=brother.co.th',
    query_template: 'Brother Thailand',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },

  // ============================================================================
  // E-COMMERCE: Shopee Thailand (Shopee Mall Official Stores - Priority 1)
  // ============================================================================
  {
    target_id: 'SEED-SHOPEE-HP',
    source_id: 'src-shopee-th',
    brand: 'HP',
    platform: 'Shopee',
    channel: 'E-commerce',
    seed_url: 'https://shopee.co.th/hp_official_store',
    query_template: 'Smart Tank',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-SHOPEE-EPSON',
    source_id: 'src-shopee-th',
    brand: 'Epson',
    platform: 'Shopee',
    channel: 'E-commerce',
    seed_url: 'https://shopee.co.th/epson_official_store',
    query_template: 'EcoTank',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-SHOPEE-CANON',
    source_id: 'src-shopee-th',
    brand: 'Canon',
    platform: 'Shopee',
    channel: 'E-commerce',
    seed_url: 'https://shopee.co.th/canon_official_store',
    query_template: 'PIXMA G',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-SHOPEE-BROTHER',
    source_id: 'src-shopee-th',
    brand: 'Brother',
    platform: 'Shopee',
    channel: 'E-commerce',
    seed_url: 'https://shopee.co.th/brother_official_store',
    query_template: 'DCP-T',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },

  // ============================================================================
  // E-COMMERCE: Lazada Thailand (LazMall Flagships - Priority 2)
  // ============================================================================
  {
    target_id: 'SEED-LAZADA-HP',
    source_id: 'src-lazada-th',
    brand: 'HP',
    platform: 'Lazada',
    channel: 'E-commerce',
    seed_url: 'https://www.lazada.co.th/shop/hp-flagship-store',
    query_template: 'Smart Tank',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-LAZADA-EPSON',
    source_id: 'src-lazada-th',
    brand: 'Epson',
    platform: 'Lazada',
    channel: 'E-commerce',
    seed_url: 'https://www.lazada.co.th/shop/epson-flagship-store',
    query_template: 'EcoTank',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-LAZADA-CANON',
    source_id: 'src-lazada-th',
    brand: 'Canon',
    platform: 'Lazada',
    channel: 'E-commerce',
    seed_url: 'https://www.lazada.co.th/shop/canon-flagship-store',
    query_template: 'MegaTank',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-LAZADA-BROTHER',
    source_id: 'src-lazada-th',
    brand: 'Brother',
    platform: 'Lazada',
    channel: 'E-commerce',
    seed_url: 'https://www.lazada.co.th/shop/brother-flagship-store',
    query_template: 'InkBenefit',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },

  // ============================================================================
  // E-COMMERCE: TikTok Shop Thailand (Priority 3)
  // ============================================================================
  {
    target_id: 'SEED-TTSHOP-HP',
    source_id: 'src-tiktok-shop-th',
    brand: 'HP',
    platform: 'TikTok Shop',
    channel: 'E-commerce',
    seed_url: 'https://shop.tiktok.com/@hpthailand',
    query_template: 'HP Smart Tank',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-TTSHOP-EPSON',
    source_id: 'src-tiktok-shop-th',
    brand: 'Epson',
    platform: 'TikTok Shop',
    channel: 'E-commerce',
    seed_url: 'https://shop.tiktok.com/@epsonthailand',
    query_template: 'Epson EcoTank',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-TTSHOP-CANON',
    source_id: 'src-tiktok-shop-th',
    brand: 'Canon',
    platform: 'TikTok Shop',
    channel: 'E-commerce',
    seed_url: 'https://shop.tiktok.com/@canonthailand',
    query_template: 'Canon PIXMA G',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-TTSHOP-BROTHER',
    source_id: 'src-tiktok-shop-th',
    brand: 'Brother',
    platform: 'TikTok Shop',
    channel: 'E-commerce',
    seed_url: 'https://shop.tiktok.com/@brotherthailand',
    query_template: 'Brother Ink Tank',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },

  // ============================================================================
  // E-COMMERCE: JIB Thailand Specialist IT Retailer (Priority 4)
  // ============================================================================
  {
    target_id: 'SEED-JIB-TANK-CATEGORY',
    source_id: 'src-jib-th',
    brand: 'HP', // Primary target, category encompasses HP, Epson, Canon, Brother
    platform: 'JIB',
    channel: 'E-commerce',
    seed_url: 'https://www.jib.co.th/web/product/product_list/2/83/0',
    query_template: 'Ink Tank Printer',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },

  // ============================================================================
  // BRAND SOCIAL CHANNELS (Facebook, Instagram, YouTube, TikTok, LinkedIn)
  // ============================================================================
  // Facebook
  {
    target_id: 'SEED-FB-HP',
    source_id: 'src-facebook-th',
    brand: 'HP',
    platform: 'Facebook',
    channel: 'Social',
    seed_url: 'https://www.facebook.com/HPThailand',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-FB-EPSON',
    source_id: 'src-facebook-th',
    brand: 'Epson',
    platform: 'Facebook',
    channel: 'Social',
    seed_url: 'https://www.facebook.com/epsonthailand',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-FB-CANON',
    source_id: 'src-facebook-th',
    brand: 'Canon',
    platform: 'Facebook',
    channel: 'Social',
    seed_url: 'https://www.facebook.com/canon.thailand',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-FB-BROTHER',
    source_id: 'src-facebook-th',
    brand: 'Brother',
    platform: 'Facebook',
    channel: 'Social',
    seed_url: 'https://www.facebook.com/BrotherCommercialThailand',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  // Instagram
  {
    target_id: 'SEED-IG-HP',
    source_id: 'src-instagram-th',
    brand: 'HP',
    platform: 'Instagram',
    channel: 'Social',
    seed_url: 'https://www.instagram.com/hp_thailand/',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-IG-EPSON',
    source_id: 'src-instagram-th',
    brand: 'Epson',
    platform: 'Instagram',
    channel: 'Social',
    seed_url: 'https://www.instagram.com/epsonthailand/',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-IG-CANON',
    source_id: 'src-instagram-th',
    brand: 'Canon',
    platform: 'Instagram',
    channel: 'Social',
    seed_url: 'https://www.instagram.com/canonthailand/',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-IG-BROTHER',
    source_id: 'src-instagram-th',
    brand: 'Brother',
    platform: 'Instagram',
    channel: 'Social',
    seed_url: 'https://www.instagram.com/brotherthailand/',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  // YouTube
  {
    target_id: 'SEED-YT-HP',
    source_id: 'src-youtube-th',
    brand: 'HP',
    platform: 'YouTube',
    channel: 'Social',
    seed_url: 'https://www.youtube.com/@HPThailand',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'PENDING_VERIFICATION', // Brief marked HP YouTube as KIV
  },
  {
    target_id: 'SEED-YT-CANON',
    source_id: 'src-youtube-th',
    brand: 'Canon',
    platform: 'YouTube',
    channel: 'Social',
    seed_url: 'https://www.youtube.com/@CanonThailand',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
  {
    target_id: 'SEED-YT-BROTHER',
    source_id: 'src-youtube-th',
    brand: 'Brother',
    platform: 'YouTube',
    channel: 'Social',
    seed_url: 'https://www.youtube.com/@BrotherThailandOfficial',
    country: 'Thailand',
    locale: 'th-TH',
    status: 'ACTIVE_SEED',
  },
] as const;

export function getSeedsByBrand(brand: TargetBrand): readonly CrawlTarget[] {
  return CRAWL_SEEDS.filter((s) => s.brand === brand);
}

export function getSeedsBySource(sourceId: string): readonly CrawlTarget[] {
  return CRAWL_SEEDS.filter((s) => s.source_id === sourceId);
}

export function getSeedsByPlatform(platform: PlatformType): readonly CrawlTarget[] {
  return CRAWL_SEEDS.filter((s) => s.platform === platform);
}

export function getSeedById(targetId: string): CrawlTarget | undefined {
  return CRAWL_SEEDS.find((s) => s.target_id === targetId);
}
