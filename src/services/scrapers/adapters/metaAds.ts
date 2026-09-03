/**
 * Meta Ad Library Thailand Scraper Adapter
 * Parses and normalizes raw ad creative payloads from Meta Ad Library.
 */

import { ScraperAdapter, RawObservation, ScraperHealth } from '../types';
import { CrawlTarget, getSeedsByPlatform } from '@/config/seeds';
import { convertBuddhistYearToGregorian } from '@/lib/dates';
import { CreativeFormat } from '@/types/evidence';

export class MetaAdsAdapter implements ScraperAdapter {
  public readonly sourceId = 'src-meta-ads';
  public readonly platform = 'Meta' as const;
  public readonly channel = 'Paid Media' as const;
  public readonly name = 'Meta Ad Library (Thailand)';

  public async discover(_config: CrawlTarget): Promise<CrawlTarget[]> {
    return getSeedsByPlatform('Meta').filter((s) => s.source_id === this.sourceId);
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
      const ad = item as Record<string, unknown>;

      const platformEntityId = String(ad.ad_id || ad.id || ad.ad_delivery_id || '');
      const rawTitle = String(ad.headline || ad.title || ad.ad_creative_headline || target.query_template || '');
      const rawContentTh = String(ad.body || ad.ad_creative_body || ad.text || '');
      const sourceUrl = String(ad.ad_snapshot_url || ad.url || target.seed_url);

      const rawPublishedAt = ad.start_date || ad.created_time || ad.published_at;
      const publishedAt = rawPublishedAt
        ? convertBuddhistYearToGregorian(String(rawPublishedAt).split('T')[0])
        : null;

      // Determine creative format
      let creativeFormat: CreativeFormat = 'Static Image';
      const formatStr = String(ad.format || ad.media_type || '').toLowerCase();
      if (formatStr.includes('video')) creativeFormat = 'Video';
      else if (formatStr.includes('carousel')) creativeFormat = 'Carousel';

      observations.push({
        platform: this.platform,
        channel: this.channel,
        brand: target.brand,
        source_url: sourceUrl,
        platform_entity_id: platformEntityId || `META-${target.brand}-${Date.now()}`,
        raw_title: rawTitle,
        raw_description: String(ad.link_description || ''),
        raw_content_th: rawContentTh,
        content_en_translation: String(ad.translation_en || ''),
        published_at: publishedAt,
        captured_at: capturedAt,
        creative_format: creativeFormat,
        creative_asset_url: ad.media_url ? String(ad.media_url) : null,
        activity_type: 'Ad Creative',
        evidence_tags: ['Paid Media', 'Meta Ads', 'Ad Creative'],
        raw_attributes: ad,
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
      message: 'Meta Ads adapter initialized and operational',
    };
  }
}

export const metaAdsAdapter = new MetaAdsAdapter();
