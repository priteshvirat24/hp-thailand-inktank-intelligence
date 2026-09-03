/**
 * Apify Scraper Provider
 * 
 * Encapsulates real Apify actor orchestration and dataset retrieval for Thailand crawlers.
 * Strict credential isolation: API keys are never logged, never returned in responses,
 * and never exposed to the client.
 */

import { ScraperProvider, ProviderRequest, ProviderResponse, ProviderHealth } from './types';
import { getServerEnv } from '@/config/env';

/**
 * Mapping of source IDs to recommended Apify Actor IDs
 */
export const APIFY_ACTOR_MAP: Record<string, { actorId: string; defaultInput: (targetUrl: string, query?: string) => Record<string, unknown> }> = {
  'src-meta-ads': {
    actorId: 'curious_coder/facebook-ads-library-scraper',
    defaultInput: (targetUrl, query) => ({
      startUrls: [{ url: targetUrl }],
      searchQuery: query || 'Ink Tank Printer',
      country: 'TH',
      adType: 'ALL',
      activeStatus: 'ALL',
      maxAds: 50,
    }),
  },
  'src-google-ads': {
    actorId: 'dtrungtin/google-ads-scraper',
    defaultInput: (targetUrl, query) => ({
      startUrls: [{ url: targetUrl }],
      query: query || 'Printer Thailand',
      countryCode: 'TH',
      maxResults: 50,
    }),
  },
  'src-facebook-th': {
    actorId: 'apify/facebook-posts-scraper',
    defaultInput: (targetUrl) => ({
      startUrls: [{ url: targetUrl }],
      resultsLimit: 25,
    }),
  },
  'src-instagram-th': {
    actorId: 'apify/instagram-scraper',
    defaultInput: (targetUrl) => ({
      directUrls: [targetUrl],
      resultsType: 'posts',
      resultsLimit: 25,
    }),
  },
  'src-youtube-th': {
    actorId: 'apify/youtube-scraper',
    defaultInput: (targetUrl) => ({
      startUrls: [{ url: targetUrl }],
      maxResults: 25,
    }),
  },
  'src-tiktok-shop-th': {
    actorId: 'clockworks/tiktok-shop-scraper',
    defaultInput: (targetUrl, query) => ({
      startUrls: [{ url: targetUrl }],
      searchQuery: query || 'Ink Tank',
      maxItems: 30,
    }),
  },
  'src-tiktok-brand-th': {
    actorId: 'apify/tiktok-scraper',
    defaultInput: (targetUrl) => ({
      profiles: [targetUrl],
      resultsPerPage: 25,
    }),
  },
  'src-linkedin-th': {
    actorId: 'apify/linkedin-post-search-scraper',
    defaultInput: (targetUrl) => ({
      urls: [targetUrl],
      limit: 20,
    }),
  },
};

export class ApifyProvider implements ScraperProvider {
  public readonly name = 'apify' as const;

  /**
   * Safe provider health check without exposing secrets
   */
  public async healthCheck(): Promise<ProviderHealth> {
    const env = getServerEnv();
    const apiKey = env.APIFY_API_KEY?.trim();

    if (!apiKey) {
      return {
        provider: this.name,
        status: 'NOT_CONFIGURED',
        configured: false,
        message: 'APIFY_API_KEY is not configured in server environment',
      };
    }

    try {
      // Lightweight authentication ping to Apify API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('https://api.apify.com/v2/users/me', {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (res.ok) {
        return {
          provider: this.name,
          status: 'REACHABLE',
          configured: true,
          message: 'Apify API connected and verified',
        };
      }

      if (res.status === 401 || res.status === 403) {
        return {
          provider: this.name,
          status: 'ERROR',
          configured: true,
          message: 'Apify API key is invalid or unauthorized',
        };
      }

      return {
        provider: this.name,
        status: 'ERROR',
        configured: true,
        message: `Apify health check returned HTTP ${res.status}`,
      };
    } catch (error) {
      return {
        provider: this.name,
        status: 'UNREACHABLE',
        configured: true,
        message: error instanceof Error ? `Apify connection failed: ${error.message}` : 'Apify host unreachable',
      };
    }
  }

  /**
   * Executes an Apify crawler task with retry capability
   */
  public async run(request: ProviderRequest): Promise<ProviderResponse> {
    const startTime = Date.now();
    const { target, customPayload } = request;

    // If explicit payload passed (test or mock-free fixture), return directly
    if (customPayload) {
      return {
        success: true,
        provider: this.name,
        data: customPayload,
        executionTimeMs: Date.now() - startTime,
        retriesAttempted: 0,
      };
    }

    const env = getServerEnv();
    const apiKey = env.APIFY_API_KEY?.trim();

    if (!apiKey) {
      return {
        success: false,
        provider: this.name,
        data: [],
        executionTimeMs: Date.now() - startTime,
        errorMessage: 'APIFY_API_KEY is not configured in server environment',
      };
    }

    const actorConfig = APIFY_ACTOR_MAP[target.source_id];
    if (!actorConfig) {
      return {
        success: false,
        provider: this.name,
        data: [],
        executionTimeMs: Date.now() - startTime,
        errorMessage: `No Apify actor configured for source ${target.source_id}`,
      };
    }

    const input = actorConfig.defaultInput(target.seed_url, target.query_template);
    const maxRetries = 2;
    let attempts = 0;
    let lastError = 'Unknown error';

    while (attempts <= maxRetries) {
      attempts++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for actor run

        // Run actor synchronously and fetch dataset items directly
        const runUrl = `https://api.apify.com/v2/acts/${encodeURIComponent(actorConfig.actorId)}/run-sync-get-dataset-items?timeout=55`;
        const res = await fetch(runUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(input),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        if (res.ok) {
          const datasetItems = (await res.json()) as unknown[];
          return {
            success: true,
            provider: this.name,
            data: Array.isArray(datasetItems) ? datasetItems : [],
            executionTimeMs: Date.now() - startTime,
            retriesAttempted: attempts - 1,
          };
        }

        // Handle non-retryable 4xx errors
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          return {
            success: false,
            provider: this.name,
            data: [],
            executionTimeMs: Date.now() - startTime,
            errorMessage: `Apify Actor ${actorConfig.actorId} rejected with HTTP ${res.status}`,
            retriesAttempted: attempts - 1,
          };
        }

        lastError = `Apify Actor returned HTTP ${res.status}`;
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Network error';
      }

      // Short delay before retry
      if (attempts <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }

    return {
      success: false,
      provider: this.name,
      data: [],
      executionTimeMs: Date.now() - startTime,
      errorMessage: `Apify run failed after ${attempts} attempts: ${lastError}`,
      retriesAttempted: attempts - 1,
    };
  }
}

export const apifyProvider = new ApifyProvider();
