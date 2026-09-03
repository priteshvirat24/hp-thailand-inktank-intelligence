/**
 * Google Ads Transparency Center Thailand Scraper Adapter
 */

import { ScraperAdapter, RawObservation, ScraperHealth } from '../types';
import { CrawlTarget, getSeedsByPlatform } from '@/config/seeds';
import { convertBuddhistYearToGregorian } from '@/lib/dates';
import { CreativeFormat } from '@/types/evidence';

export class GoogleAdsAdapter implements ScraperAdapter {
  public readonly sourceId = 'src-google-ads';
  public readonly platform = 'Google Ads' as const;
  public readonly channel = 'Paid Media' as const;
  public readonly name = 'Google Ads Transparency Center (Thailand)';

  public async discover(_config: CrawlTarget): Promise<CrawlTarget[]> {
    return getSeedsByPlatform('Google Ads').filter((s) => s.source_id === this.sourceId);
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

      const platformEntityId = String(ad.ad_id || ad.creative_id || '');
      const rawTitle = String(ad.headline || ad.title || target.query_template || '');
      const rawContentTh = String(ad.body || ad.snippet || ad.ad_text || '');
      const sourceUrl = String(ad.ad_url || ad.landing_page_url || target.seed_url);

      const rawPublishedAt = ad.first_shown || ad.published_at || ad.date;
      const publishedAt = rawPublishedAt
        ? convertBuddhistYearToGregorian(String(rawPublishedAt).split('T')[0])
        : null;

      let creativeFormat: CreativeFormat = 'Search Text';
      const formatStr = String(ad.format || ad.type || '').toLowerCase();
      if (formatStr.includes('video')) creativeFormat = 'Video';
      else if (formatStr.includes('image') || formatStr.includes('display')) creativeFormat = 'Static Image';

      observations.push({
        platform: this.platform,
        channel: this.channel,
        brand: target.brand,
        source_url: sourceUrl,
        platform_entity_id: platformEntityId || `GADS-${target.brand}-${Date.now()}`,
        raw_title: rawTitle,
        raw_description: String(ad.description || ''),
        raw_content_th: rawContentTh,
        content_en_translation: String(ad.translation_en || ''),
        published_at: publishedAt,
        captured_at: capturedAt,
        creative_format: creativeFormat,
        creative_asset_url: ad.asset_url ? String(ad.asset_url) : null,
        activity_type: 'Ad Creative',
        evidence_tags: ['Paid Media', 'Google Ads', 'Ad Transparency'],
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
      message: 'Google Ads adapter operational',
    };
  }
}

export const googleAdsAdapter = new GoogleAdsAdapter();
