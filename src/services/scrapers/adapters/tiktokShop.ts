/**
 * TikTok Shop Thailand Scraper Adapter
 */

import { ScraperAdapter, RawObservation, ScraperHealth } from '../types';
import { CrawlTarget, getSeedsByPlatform } from '@/config/seeds';
import { convertBuddhistYearToGregorian } from '@/lib/dates';
import { StockStatus } from '@/types/evidence';

export class TikTokShopAdapter implements ScraperAdapter {
  public readonly sourceId = 'src-tiktok-shop-th';
  public readonly platform = 'TikTok Shop' as const;
  public readonly channel = 'E-commerce' as const;
  public readonly name = 'TikTok Shop Thailand';

  public async discover(_config: CrawlTarget): Promise<CrawlTarget[]> {
    return getSeedsByPlatform('TikTok Shop').filter((s) => s.source_id === this.sourceId);
  }

  public async extract(
    rawPayload: unknown[],
    target: CrawlTarget,
    crawlRunId: string
  ): Promise<RawObservation[]> {
    const observations: RawObservation[] = [];
    const capturedAt = new Date().toISOString();

    for (const item of rawPayload) {
      if (!item || typeof item !== 'object') continue;
      const product = item as Record<string, unknown>;

      const productId = String(product.product_id || product.id || '');
      const platformEntityId = productId || `TTS-${Date.now()}`;
      const rawTitle = String(product.title || product.name || '');
      const rawContentTh = String(product.description || rawTitle);
      const sourceUrl = String(product.product_url || product.url || target.seed_url);

      const rawPublishedAt = product.create_time || product.published_at;
      const publishedAt = rawPublishedAt
        ? convertBuddhistYearToGregorian(String(rawPublishedAt).split('T')[0])
        : null;

      let priceCurrent: number | null = null;
      if (typeof product.real_price === 'number') priceCurrent = product.real_price;
      else if (typeof product.price === 'number') priceCurrent = product.price;

      let priceOriginal: number | null = null;
      if (typeof product.original_price === 'number') priceOriginal = product.original_price;

      let discountPct: number | null = null;
      if (priceCurrent && priceOriginal && priceOriginal > priceCurrent) {
        discountPct = Math.round(((priceOriginal - priceCurrent) / priceOriginal) * 100);
      }

      let stockStatus: StockStatus = 'In Stock';
      if (product.stock === 0) stockStatus = 'Out of Stock';

      observations.push({
        platform: this.platform,
        channel: this.channel,
        brand: target.brand,
        source_url: sourceUrl,
        platform_entity_id: platformEntityId,
        raw_title: rawTitle,
        raw_description: String(product.description || ''),
        raw_content_th: rawContentTh,
        published_at: publishedAt,
        captured_at: capturedAt,
        price_current_thb: priceCurrent,
        price_original_thb: priceOriginal,
        discount_pct: discountPct,
        seller_name: String(product.seller_name || `${target.brand} Official TikTok Shop`),
        is_official_store: Boolean(product.is_official_store || true),
        stock_status: stockStatus,
        displayed_sales: product.sold_count ? String(product.sold_count) : null,
        rating: typeof product.rating === 'number' ? Number(product.rating.toFixed(1)) : null,
        review_count: typeof product.review_count === 'number' ? product.review_count : null,
        activity_type: 'Product Listing',
        evidence_tags: ['E-commerce', 'TikTok Shop', 'Social Commerce'],
        raw_attributes: product,
        provider: 'apify',
        crawl_run_id: crawlRunId,
      });
    }

    return observations;
  }

  public async healthCheck(_config: CrawlTarget): Promise<ScraperHealth> {
    return {
      status: 'HEALTHY',
      source_id: this.sourceId,
      platform: this.platform,
      message: 'TikTok Shop adapter operational',
    };
  }
}

export const tiktokShopAdapter = new TikTokShopAdapter();
