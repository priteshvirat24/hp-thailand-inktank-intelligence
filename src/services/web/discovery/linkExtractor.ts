/**
 * HTML Link Extractor & Discovery Filter
 */

import { resolveRelativeUrl, extractDomain } from './urlNormalizer';

const IGNORED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.ico',
  '.css',
  '.js',
  '.json',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.mp4',
  '.mp3',
  '.avi',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
]);

export interface DiscoveredLink {
  url: string;
  anchorText?: string;
  isSameDomain: boolean;
  domain: string;
}

/**
 * Extracts normalized, unique internal and external links from HTML markup.
 */
export function extractLinksFromHtml(html: string, baseUrl: string, maxLinks = 100): DiscoveredLink[] {
  if (!html || !baseUrl) return [];

  const baseDomain = extractDomain(baseUrl);
  const seenUrls = new Set<string>();
  const discovered: DiscoveredLink[] = [];

  // Match all <a href="..." ...>...</a>
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    if (discovered.length >= maxLinks) break;

    const rawHref = match[1];
    const rawAnchor = match[2]?.replace(/<[^>]*>/g, '').trim();

    const resolved = resolveRelativeUrl(rawHref, baseUrl);
    if (!resolved) continue;

    // Check extension
    try {
      const parsed = new URL(resolved);
      const pathname = parsed.pathname.toLowerCase();
      const dotIdx = pathname.lastIndexOf('.');
      if (dotIdx !== -1) {
        const ext = pathname.slice(dotIdx);
        if (IGNORED_EXTENSIONS.has(ext)) continue;
      }
    } catch {
      continue;
    }

    if (seenUrls.has(resolved)) continue;
    seenUrls.add(resolved);

    const targetDomain = extractDomain(resolved);
    const isSameDomain = targetDomain === baseDomain || targetDomain.endsWith(`.${baseDomain}`);

    discovered.push({
      url: resolved,
      anchorText: rawAnchor || undefined,
      isSameDomain,
      domain: targetDomain,
    });
  }

  return discovered;
}
