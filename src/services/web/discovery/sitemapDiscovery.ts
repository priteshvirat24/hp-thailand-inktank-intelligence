/**
 * XML Sitemap Discovery & Parsing Engine
 */

import { fetchDirectHttp } from '../acquisition/directHttpFetcher';
import { resolveRelativeUrl, validateUrlSafety } from './urlNormalizer';

export async function discoverSitemapUrls(sitemapUrl: string, maxUrls = 100): Promise<string[]> {
  const safety = validateUrlSafety(sitemapUrl);
  if (!safety.safe) return [];

  const result = await fetchDirectHttp(safety.normalizedUrl, { timeoutMs: 6000 });
  if (!result.success || !result.html) return [];

  const xml = result.html;
  const urls: string[] = [];

  // Match all <loc>...</loc> tags
  const locRegex = /<loc>(.*?)<\/loc>/gis;
  let match: RegExpExecArray | null;

  while ((match = locRegex.exec(xml)) !== null) {
    if (urls.length >= maxUrls) break;

    const rawLoc = match[1]?.trim();
    if (!rawLoc) continue;

    const resolved = resolveRelativeUrl(rawLoc, safety.normalizedUrl);
    if (resolved && !urls.includes(resolved)) {
      urls.push(resolved);
    }
  }

  return urls;
}
