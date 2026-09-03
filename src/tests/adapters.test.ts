import { describe, it, expect } from 'vitest';
import { metaAdsAdapter } from '@/services/scrapers/adapters/metaAds';
import { googleAdsAdapter } from '@/services/scrapers/adapters/googleAds';
import { shopeeAdapter } from '@/services/scrapers/adapters/shopee';
import { lazadaAdapter } from '@/services/scrapers/adapters/lazada';
import { tiktokShopAdapter } from '@/services/scrapers/adapters/tiktokShop';
import { jibAdapter } from '@/services/scrapers/adapters/jib';
import { facebookAdapter } from '@/services/scrapers/adapters/social';
import { getSeedById } from '@/config/seeds';

describe('Source-Specific Scraper Adapters', () => {
  const crawlRunId = 'TEST-RUN-001';

  it('extracts Meta Ad Library payloads accurately', async () => {
    const target = getSeedById('SEED-META-HP')!;
    const mockAdPayload = [
      {
        ad_id: '9876543210',
        headline: 'HP Smart Tank 580 All-in-One Printer',
        body: 'พิมพ์ได้ถึง 6,000 แผ่น พร้อม Wi-Fi อัจฉริยะ',
        ad_snapshot_url: 'https://www.facebook.com/ads/library/?id=9876543210',
        start_date: '2026-07-15T00:00:00Z',
        format: 'video',
      },
    ];

    const observations = await metaAdsAdapter.extract(mockAdPayload, target, crawlRunId);
    expect(observations.length).toBe(1);
    expect(observations[0].platform).toBe('Meta');
    expect(observations[0].channel).toBe('Paid Media');
    expect(observations[0].brand).toBe('HP');
    expect(observations[0].platform_entity_id).toBe('9876543210');
    expect(observations[0].published_at).toBe('2026-07-15');
    expect(observations[0].creative_format).toBe('Video');
  });

  it('extracts Google Ads Transparency payloads accurately', async () => {
    const target = getSeedById('SEED-GADS-EPSON')!;
    const mockGadsPayload = [
      {
        creative_id: 'GADS-998877',
        headline: 'Epson EcoTank L3250 Promotion',
        body: 'เครื่องพิมพ์แท็งก์แท้ ประหยัดต้นทุน',
        ad_url: 'https://adstransparency.google.com/advertiser/12345',
        first_shown: '2026-06-20',
        type: 'display',
      },
    ];

    const observations = await googleAdsAdapter.extract(mockGadsPayload, target, crawlRunId);
    expect(observations.length).toBe(1);
    expect(observations[0].platform).toBe('Google Ads');
    expect(observations[0].brand).toBe('Epson');
    expect(observations[0].published_at).toBe('2026-06-20');
  });

  it('extracts Shopee Thailand marketplace payloads with THB price conversion', async () => {
    const target = getSeedById('SEED-SHOPEE-HP')!;
    const mockShopeePayload = [
      {
        itemid: 11223344,
        shopid: 556677,
        name: 'HP Smart Tank 580 Multifunction Wireless Printer',
        description: 'เครื่องพิมพ์ HP Smart Tank 580 พิมพ์ สแกน ถ่ายเอกสาร ไร้สาย',
        price: 549000000, // Raw Shopee price format (scaled by 100,000)
        price_before_discount: 599000000,
        historical_sold: '1.4k sold',
        rating_star: 4.85,
        rating_count: 320,
        is_official_shop: true,
      },
    ];

    const observations = await shopeeAdapter.extract(mockShopeePayload, target, crawlRunId);
    expect(observations.length).toBe(1);
    expect(observations[0].platform).toBe('Shopee');
    expect(observations[0].price_current_thb).toBe(5490);
    expect(observations[0].price_original_thb).toBe(5990);
    expect(observations[0].discount_pct).toBe(8);
    expect(observations[0].displayed_sales).toBe('1.4k sold');
    expect(observations[0].is_official_store).toBe(true);
  });

  it('extracts Lazada Thailand payloads accurately', async () => {
    const target = getSeedById('SEED-LAZADA-CANON')!;
    const mockLazadaPayload = [
      {
        itemId: 'LZD-554433',
        name: 'Canon PIXMA G3730 MegaTank Wireless All-in-One',
        price: 5390,
        originalPrice: 5890,
        discount: '9%',
        isLazMall: true,
        itemSold: '850 sold',
      },
    ];

    const observations = await lazadaAdapter.extract(mockLazadaPayload, target, crawlRunId);
    expect(observations.length).toBe(1);
    expect(observations[0].platform).toBe('Lazada');
    expect(observations[0].price_current_thb).toBe(5390);
    expect(observations[0].discount_pct).toBe(9);
  });

  it('extracts TikTok Shop Thailand payloads accurately', async () => {
    const target = getSeedById('SEED-TTSHOP-BROTHER')!;
    const mockTikTokPayload = [
      {
        product_id: 'TT-778899',
        title: 'Brother DCP-T520W Refill Tank Wireless',
        real_price: 5490,
        original_price: 5790,
        sold_count: '500+ sold',
      },
    ];

    const observations = await tiktokShopAdapter.extract(mockTikTokPayload, target, crawlRunId);
    expect(observations.length).toBe(1);
    expect(observations[0].platform).toBe('TikTok Shop');
    expect(observations[0].price_current_thb).toBe(5490);
  });

  it('extracts JIB IT Retailer payloads accurately', async () => {
    const target = getSeedById('SEED-JIB-TANK-CATEGORY')!;
    const mockJibPayload = [
      {
        product_id: 'JIB-12345',
        name: 'PRINTER HP SMART TANK 580 ALL-IN-ONE',
        price_total: 5490,
        price_normal: 5590,
        stock_status: 'in_stock',
      },
    ];

    const observations = await jibAdapter.extract(mockJibPayload, target, crawlRunId);
    expect(observations.length).toBe(1);
    expect(observations[0].platform).toBe('JIB');
    expect(observations[0].price_current_thb).toBe(5490);
    expect(observations[0].seller_name).toBe('JIB Computer Group Thailand');
  });

  it('extracts Social Feed payloads accurately', async () => {
    const target = getSeedById('SEED-FB-HP')!;
    const mockFbPayload = [
      {
        post_id: 'FB-POST-101',
        title: 'HP Smart Tank 580 New Back-to-School Campaign',
        caption: 'ปริ้นต์งานไม่มีสะดุด ด้วย HP Smart Tank 580',
        created_time: '2026-08-01',
        comments_count: 45,
      },
    ];

    const observations = await facebookAdapter.extract(mockFbPayload, target, crawlRunId);
    expect(observations.length).toBe(1);
    expect(observations[0].platform).toBe('Facebook');
    expect(observations[0].channel).toBe('Social');
    expect(observations[0].review_count).toBe(45);
  });
});
