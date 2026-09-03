/**
 * JIB Thailand Specialist IT Retailer Scraper Adapter
 */

import { ScraperAdapter, RawObservation, ScraperHealth } from '../types';
import { CrawlTarget, getSeedsByPlatform } from '@/config/seeds';
import { convertBuddhistYearToGregorian } from '@/lib/dates';
import { StockStatus } from '@/types/evidence';

export class JibAdapter implements ScraperAdapter {
  public readonly sourceId = 'src-jib-th';
  public readonly platform = 'JIB' as const;
  public readonly channel = 'E-commerce' as const;
  public readonly name = 'JIB Thailand Specialist IT Retailer';

  public async discover(_config: CrawlTarget): Promise<CrawlTarget[]> {
    return getSeedsByPlatform('JIB').filter((s) => s.source_id === this.sourceId);
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
      const platformEntityId = productId || `JIB-${Date.now()}`;
      const rawTitle = String(product.name || product.title || '');
      const rawContentTh = String(product.spec || product.description || rawTitle);
      const sourceUrl = String(product.link || product.url || target.seed_url);

      const rawPublishedAt = product.created_at || product.published_at;
      const publishedAt = rawPublishedAt
        ? convertBuddhistYearToGregorian(String(rawPublishedAt).split('T')[0])
        : null;

      let priceCurrent: number | null = null;
      if (typeof product.price_total === 'number') priceCurrent = product.price_total;
      else if (typeof product.price === 'number') priceCurrent = product.price;

      let priceOriginal: number | null = null;
      if (typeof product.price_normal === 'number') priceOriginal = product.price_normal;

      let discountPct: number | null = null;
      if (priceCurrent && priceOriginal && priceOriginal > priceCurrent) {
        discountPct = Math.round(((priceOriginal - priceCurrent) / priceOriginal) * 100);
      }

      let stockStatus: StockStatus = 'In Stock';
      if (product.stock_status === 'out_of_stock' || product.stock === 0) stockStatus = 'Out of Stock';

      observations.push({
        platform: this.platform,
        channel: this.channel,
        brand: target.brand,
        source_url: sourceUrl,
        platform_entity_id: platformEntityId,
        raw_title: rawTitle,
        raw_description: String(product.spec || ''),
        raw_content_th: rawContentTh,
        published_at: publishedAt,
        captured_at: capturedAt,
        price_current_thb: priceCurrent,
        price_original_thb: priceOriginal,
        discount_pct: discountPct,
        seller_name: 'JIB Computer Group Thailand',
        is_official_store: true,
        stock_status: stockStatus,
        displayed_sales: null, // JIB does not expose historical sold counters
        rating: null,
        review_count: null,
        activity_type: 'Product Listing',
        evidence_tags: ['E-commerce', 'JIB Thailand', 'IT Retailer'],
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
      message: 'JIB Thailand adapter operational',
    };
  }
}

export const jibAdapter = new JibAdapter();
