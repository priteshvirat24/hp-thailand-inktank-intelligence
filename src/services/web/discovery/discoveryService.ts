/**
 * Master Internet Evidence Discovery Service
 */

import { WebDiscoveryCandidate } from '../acquisition/types';
import { generateDiscoveryCandidates, SearchQueryOptions } from './searchDiscovery';
import { discoverDomainUrls } from './domainDiscovery';
import { discoverSitemapUrls } from './sitemapDiscovery';
import { discoverRobotsTxt } from './robotsDiscovery';
import { extractDomain, validateUrlSafety } from './urlNormalizer';

export class DiscoveryService {
  /**
   * Discovers candidate URLs from query, brand, or single target.
   */
  public async discoverTargets(options: SearchQueryOptions & { seedUrls?: string[] }): Promise<WebDiscoveryCandidate[]> {
    const candidates: WebDiscoveryCandidate[] = [];

    // 1. Explicit seed URLs provided
    if (options.seedUrls && options.seedUrls.length > 0) {
      for (const url of options.seedUrls) {
        const safety = validateUrlSafety(url);
        if (safety.safe) {
          candidates.push({
            url: safety.normalizedUrl,
            domain: safety.domain,
            title: `Provided Seed: ${safety.normalizedUrl}`,
            discovery_source: 'USER_PROVIDED',
            discovered_at: new Date().toISOString(),
            brand_hint: options.brand,
            sku_hint: options.skuId,
          });
        }
      }
    }

    // 2. Search / Query Discovery
    if (options.query || options.brand || !options.seedUrls || options.seedUrls.length === 0) {
      const searchCandidates = generateDiscoveryCandidates(options);
      candidates.push(...searchCandidates);
    }

    return candidates;
  }

  /**
   * Discovers internal pages and sitemaps for a specific domain.
   */
  public async discoverDomain(domain: string, maxPages = 20): Promise<string[]> {
    const cleanDomain = extractDomain(`https://${domain}`);
    const robots = await discoverRobotsTxt(cleanDomain);

    const sitemapUrls: string[] = [];
    if (robots.sitemaps.length > 0) {
      for (const smUrl of robots.sitemaps.slice(0, 2)) {
        const urls = await discoverSitemapUrls(smUrl, maxPages);
        sitemapUrls.push(...urls);
      }
    }

    if (sitemapUrls.length >= maxPages) {
      return sitemapUrls.slice(0, maxPages);
    }

    const domainCrawl = await discoverDomainUrls(`https://${cleanDomain}`, { maxPages });
    const all = Array.from(new Set([...sitemapUrls, ...domainCrawl.discoveredUrls]));
    return all.slice(0, maxPages);
  }
}

export const discoveryService = new DiscoveryService();
