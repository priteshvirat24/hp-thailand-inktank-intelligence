/**
 * Brand Official Social Channels Scraper Adapter (Facebook, Instagram, YouTube, TikTok, LinkedIn)
 */

import { ScraperAdapter, RawObservation, ScraperHealth } from '../types';
import { CrawlTarget, getSeedsByPlatform } from '@/config/seeds';
import { convertBuddhistYearToGregorian } from '@/lib/dates';
import { PlatformType } from '@/types/sources';

export class BrandSocialAdapter implements ScraperAdapter {
  public readonly sourceId: string;
  public readonly platform: PlatformType;
  public readonly channel = 'Social' as const;
  public readonly name: string;

  constructor(sourceId: string, platform: PlatformType, name: string) {
    this.sourceId = sourceId;
    this.platform = platform;
    this.name = name;
  }

  public async discover(_config: CrawlTarget): Promise<CrawlTarget[]> {
    return getSeedsByPlatform(this.platform).filter((s) => s.source_id === this.sourceId);
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
      const post = item as Record<string, unknown>;

      const postId = String(post.post_id || post.id || post.video_id || '');
      const platformEntityId = postId || `${this.platform}-${Date.now()}`;
      const rawTitle = String(post.title || post.caption || post.text || `${target.brand} ${this.platform} Post`);
      const rawContentTh = String(post.caption || post.text || post.description || rawTitle);
      const sourceUrl = String(post.post_url || post.url || post.link || target.seed_url);

      const rawPublishedAt = post.created_time || post.published_at || post.date || post.timestamp;
      const publishedAt = rawPublishedAt
        ? convertBuddhistYearToGregorian(String(rawPublishedAt).split('T')[0])
        : null;

      // Extract engagement counts
      let reviewCount: number | null = null;
      if (typeof post.comments_count === 'number') reviewCount = post.comments_count;
      else if (typeof post.comments === 'number') reviewCount = post.comments;

      observations.push({
        platform: this.platform,
        channel: this.channel,
        brand: target.brand,
        source_url: sourceUrl,
        platform_entity_id: platformEntityId,
        raw_title: rawTitle,
        raw_description: String(post.description || ''),
        raw_content_th: rawContentTh,
        published_at: publishedAt,
        captured_at: capturedAt,
        seller_name: String(post.author || `${target.brand} Thailand Official`),
        is_official_store: true,
        review_count: reviewCount,
        activity_type: 'Social Post',
        evidence_tags: ['Social', this.platform, 'Brand Channel'],
        raw_attributes: post,
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
      message: `${this.name} adapter operational`,
    };
  }
}

export const facebookAdapter = new BrandSocialAdapter('src-facebook-th', 'Facebook', 'Official Facebook Thailand');
export const instagramAdapter = new BrandSocialAdapter('src-instagram-th', 'Instagram', 'Official Instagram Thailand');
export const youtubeSocialAdapter = new BrandSocialAdapter('src-youtube-th', 'YouTube', 'Official YouTube Thailand');
export const tiktokSocialAdapter = new BrandSocialAdapter('src-tiktok-brand-th', 'TikTok', 'Official TikTok Thailand');
export const linkedinAdapter = new BrandSocialAdapter('src-linkedin-th', 'LinkedIn', 'Official LinkedIn Thailand');
