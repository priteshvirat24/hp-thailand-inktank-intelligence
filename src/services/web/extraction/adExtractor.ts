/**
 * Generic Ad Creative Extractor
 */

import { extractMetaTags } from './metaExtractor';

export interface ExtractedAdCreative {
  headline: string | null;
  body: string | null;
  creative_format: 'Video' | 'Static Image' | 'Carousel' | 'Search Ad';
  advertiser_name: string | null;
}

export function extractAdFromHtml(html: string): ExtractedAdCreative {
  const meta = extractMetaTags(html);
  const headline = meta.ogTitle || meta.title || null;
  const body = meta.ogDescription || null;

  let format: ExtractedAdCreative['creative_format'] = 'Static Image';
  if (html.includes('<video') || (meta.ogType && meta.ogType.includes('video'))) {
    format = 'Video';
  }

  return {
    headline,
    body,
    creative_format: format,
    advertiser_name: meta.ogSiteName || null,
  };
}
