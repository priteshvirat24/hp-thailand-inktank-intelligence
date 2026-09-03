/**
 * Bounded Domain Link Crawler & Page Discovery Engine
 */

import { extractLinksFromHtml } from './linkExtractor';
import { fetchDirectHttp } from '../acquisition/directHttpFetcher';
import { validateUrlSafety } from './urlNormalizer';

export interface DomainDiscoveryResult {
  domain: string;
  seedUrl: string;
  discoveredUrls: string[];
  pagesChecked: number;
}

export async function discoverDomainUrls(
  seedUrl: string,
  options: { maxDepth?: number; maxPages?: number } = {}
): Promise<DomainDiscoveryResult> {
  const maxDepth = options.maxDepth || 2;
  const maxPages = options.maxPages || 20;

  const safety = validateUrlSafety(seedUrl);
  if (!safety.safe) {
    return { domain: '', seedUrl, discoveredUrls: [], pagesChecked: 0 };
  }

  const domain = safety.domain;
  const visited = new Set<string>();
  const discovered = new Set<string>([safety.normalizedUrl]);
  const queue: { url: string; depth: number }[] = [{ url: safety.normalizedUrl, depth: 1 }];

  while (queue.length > 0 && visited.size < maxPages) {
    const item = queue.shift();
    if (!item) break;

    if (visited.has(item.url)) continue;
    visited.add(item.url);

    if (item.depth > maxDepth) continue;

    const res = await fetchDirectHttp(item.url, { timeoutMs: 4000 });
    if (!res.success || !res.html) continue;

    const links = extractLinksFromHtml(res.html, item.url, 30);
    for (const link of links) {
      if (link.isSameDomain && !discovered.has(link.url)) {
        discovered.add(link.url);
        if (item.depth + 1 <= maxDepth && queue.length < maxPages * 2) {
          queue.push({ url: link.url, depth: item.depth + 1 });
        }
      }
    }
  }

  return {
    domain,
    seedUrl: safety.normalizedUrl,
    discoveredUrls: Array.from(discovered),
    pagesChecked: visited.size,
  };
}
