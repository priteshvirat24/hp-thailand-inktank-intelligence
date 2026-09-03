/**
 * Lazada Thailand Scraper Adapter (LazMall Flagship Stores)
 */

import { ScraperAdapter, RawObservation, ScraperHealth } from '../types';
import { CrawlTarget, getSeedsByPlatform } from '@/config/seeds';
import { convertBuddhistYearToGregorian } from '@/lib/dates';
import { StockStatus } from '@/types/evidence';

export class LazadaAdapter implements ScraperAdapter {
  public readonly sourceId = 'src-lazada-th';
  public readonly platform = 'Lazada' as const;
  public readonly channel = 'E-commerce' as const;
  public readonly name = 'Lazada Thailand (LazMall)';

  public async discover(_config: CrawlTarget): Promise<CrawlTarget[]> {
    return getSeedsByPlatform('Lazada').filter((s) => s.source_id === this.sourceId);
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

      const itemId = String(product.nid || product.itemId || product.id || '');
      const platformEntityId = itemId || `LZD-${Date.now()}`;
      const rawTitle = String(product.name || product.title || '');
      const rawContentTh = String(product.description || rawTitle);
      const sourceUrl = String(product.itemUrl || product.url || target.seed_url);

      const rawPublishedAt = product.created_at || product.published_at;
      const publishedAt = rawPublishedAt
        ? convertBuddhistYearToGregorian(String(rawPublishedAt).split('T')[0])
        : null;

      let priceCurrent: number | null = null;
      if (typeof product.price === 'number') priceCurrent = product.price;
      else if (typeof product.price === 'string') priceCurrent = parseFloat(product.price.replace(/[^0-9.]/g, ''));

      let priceOriginal: number | null = null;
      if (typeof product.originalPrice === 'number') priceOriginal = product.originalPrice;
      else if (typeof product.originalPrice === 'string') priceOriginal = parseFloat(product.originalPrice.replace(/[^0-9.]/g, ''));

      let discountPct: number | null = null;
      if (typeof product.discount === 'string') {
        const parsed = parseInt(product.discount.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsed)) discountPct = parsed;
      } else if (priceCurrent && priceOriginal && priceOriginal > priceCurrent) {
        discountPct = Math.round(((priceOriginal - priceCurrent) / priceOriginal) * 100);
      }

      let stockStatus: StockStatus = 'In Stock';
      if (product.inStock === false || product.stock === 0) stockStatus = 'Out of Stock';

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
        price_current_thb: priceCurrent || null,
        price_original_thb: priceOriginal || null,
        discount_pct: discountPct,
        seller_name: String(product.sellerName || `${target.brand} Flagship Store`),
        is_official_store: Boolean(product.isLazMall || true),
        stock_status: stockStatus,
        displayed_sales: product.itemSold ? String(product.itemSold) : null,
        rating: typeof product.ratingScore === 'number' ? Number(product.ratingScore.toFixed(1)) : null,
        review_count: typeof product.reviewCount === 'number' ? product.reviewCount : null,
        activity_type: 'Product Listing',
        evidence_tags: ['E-commerce', 'LazMall', 'Product Listing'],
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
      message: 'Lazada Thailand adapter operational',
    };
  }
}

export const lazadaAdapter = new LazadaAdapter();
