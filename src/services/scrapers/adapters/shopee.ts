/**
 * Shopee Thailand Scraper Adapter (Shopee Mall Official Stores)
 */

import { ScraperAdapter, RawObservation, ScraperHealth } from '../types';
import { CrawlTarget, getSeedsByPlatform } from '@/config/seeds';
import { convertBuddhistYearToGregorian } from '@/lib/dates';
import { StockStatus } from '@/types/evidence';

export class ShopeeAdapter implements ScraperAdapter {
  public readonly sourceId = 'src-shopee-th';
  public readonly platform = 'Shopee' as const;
  public readonly channel = 'E-commerce' as const;
  public readonly name = 'Shopee Thailand (Official Mall)';

  public async discover(_config: CrawlTarget): Promise<CrawlTarget[]> {
    return getSeedsByPlatform('Shopee').filter((s) => s.source_id === this.sourceId);
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

      const itemId = String(product.itemid || product.item_id || product.id || '');
      const shopId = String(product.shopid || product.shop_id || '');
      const platformEntityId = itemId && shopId ? `${shopId}_${itemId}` : itemId || `SP-${Date.now()}`;

      const rawTitle = String(product.name || product.title || '');
      const rawContentTh = String(product.description || rawTitle);
      const sourceUrl = String(
        product.url || (itemId && shopId ? `https://shopee.co.th/product/${shopId}/${itemId}` : target.seed_url)
      );

      const rawPublishedAt = product.ctime || product.created_at || product.published_at;
      const publishedAt = rawPublishedAt
        ? convertBuddhistYearToGregorian(
            typeof rawPublishedAt === 'number'
              ? new Date(rawPublishedAt * 1000).toISOString().split('T')[0]
              : String(rawPublishedAt).split('T')[0]
          )
        : null;

      // Pricing in THB (Shopee API often expresses prices in cents / divided by 100,000 in raw format)
      let priceCurrent: number | null = null;
      if (typeof product.price === 'number') {
        priceCurrent = product.price > 100000 ? Math.round(product.price / 100000) : product.price;
      } else if (typeof product.price_current_thb === 'number') {
        priceCurrent = product.price_current_thb;
      }

      let priceOriginal: number | null = null;
      if (typeof product.price_before_discount === 'number') {
        priceOriginal =
          product.price_before_discount > 100000
            ? Math.round(product.price_before_discount / 100000)
            : product.price_before_discount;
      }

      let discountPct: number | null = null;
      if (priceCurrent && priceOriginal && priceOriginal > priceCurrent) {
        discountPct = Math.round(((priceOriginal - priceCurrent) / priceOriginal) * 100);
      }

      // Stock status
      let stockStatus: StockStatus = 'In Stock';
      if (product.stock === 0 || product.is_out_of_stock === true) {
        stockStatus = 'Out of Stock';
      }

      // Sales indicator (e.g. "1.2k sold") - preserved as observable cumulative traction string
      const displayedSales = product.historical_sold || product.sold ? String(product.historical_sold || product.sold) : null;

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
        seller_name: String(product.shop_name || product.seller_name || `${target.brand} Official Store`),
        is_official_store: Boolean(product.is_official_shop || product.show_official_shop_label || true),
        stock_status: stockStatus,
        displayed_sales: displayedSales,
        rating: typeof product.rating_star === 'number' ? Number(product.rating_star.toFixed(1)) : null,
        review_count: typeof product.rating_count === 'number' ? product.rating_count : null,
        activity_type: 'Product Listing',
        evidence_tags: ['E-commerce', 'Shopee Mall', 'Product Listing'],
        raw_attributes: product,
        provider: 'brightdata',
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
      message: 'Shopee Thailand adapter operational',
    };
  }
}

export const shopeeAdapter = new ShopeeAdapter();
