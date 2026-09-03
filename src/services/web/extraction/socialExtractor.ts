/**
 * Generic Social Post & Discussion Extractor
 */

import { extractMetaTags } from './metaExtractor';
import { inspectHtml } from './htmlExtractor';

export interface ExtractedSocialPost {
  text: string | null;
  author: string | null;
  published_at: string | null;
  likes: number | null;
  comments_count: number | null;
  shares: number | null;
}

export function extractSocialPostFromHtml(html: string): ExtractedSocialPost {
  const meta = extractMetaTags(html);
  const inspection = inspectHtml(html);

  const text = meta.ogDescription || meta.twitterDescription || inspection.visibleText.slice(0, 500) || null;
  const author = meta.ogSiteName || null;
  const published_at = meta.publishedTime || null;

  return {
    text,
    author,
    published_at,
    likes: null,
    comments_count: null,
    shares: null,
  };
}
