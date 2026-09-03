/**
 * Bright Data Scraper Provider
 * 
 * Encapsulates Bright Data Web Unlocker, Scraping Browser, and Data Collector APIs
 * for Thailand e-commerce extraction (Shopee, Lazada, JIB).
 * Strict credential isolation: API keys are never logged, never returned in responses,
 * and never exposed to the client.
 */

import { ScraperProvider, ProviderRequest, ProviderResponse, ProviderHealth } from './types';
import { getServerEnv } from '@/config/env';

export class BrightDataProvider implements ScraperProvider {
  public readonly name = 'brightdata' as const;

  /**
   * Safe provider health check without exposing secrets
   */
  public async healthCheck(): Promise<ProviderHealth> {
    const env = getServerEnv();
    const apiKey = env.BRIGHTDATA_API_KEY?.trim();

    if (!apiKey) {
      return {
        provider: this.name,
        status: 'NOT_CONFIGURED',
        configured: false,
        message: 'BRIGHTDATA_API_KEY is not configured in server environment',
      };
    }

    try {
      // Lightweight authentication ping to Bright Data API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('https://api.brightdata.com/zone', {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (res.ok) {
        return {
          provider: this.name,
          status: 'REACHABLE',
          configured: true,
          message: 'Bright Data API connected and verified',
        };
      }

      if (res.status === 401 || res.status === 403) {
        return {
          provider: this.name,
          status: 'ERROR',
          configured: true,
          message: 'Bright Data API key is invalid or unauthorized',
        };
      }

      return {
        provider: this.name,
        status: 'ERROR',
        configured: true,
        message: `Bright Data health check returned HTTP ${res.status}`,
      };
    } catch (error) {
      return {
        provider: this.name,
        status: 'UNREACHABLE',
        configured: true,
        message: error instanceof Error ? `Bright Data connection failed: ${error.message}` : 'Bright Data host unreachable',
      };
    }
  }

  /**
   * Executes a Bright Data scraping request targeting Thai e-commerce seeds
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
    const apiKey = env.BRIGHTDATA_API_KEY?.trim();
    const zone = env.BRIGHTDATA_ZONE?.trim() || 'web_unlocker';

    if (!apiKey) {
      return {
        success: false,
        provider: this.name,
        data: [],
        executionTimeMs: Date.now() - startTime,
        errorMessage: 'BRIGHTDATA_API_KEY is not configured in server environment',
      };
    }

    const maxRetries = 2;
    let attempts = 0;
    let lastError = 'Unknown error';

    while (attempts <= maxRetries) {
      attempts++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        // Bright Data Web Unlocker proxy request with Thailand geo-targeting
        const unlockerUrl = `https://api.brightdata.com/request`;
        const res = await fetch(unlockerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            zone,
            url: target.seed_url,
            country: 'th',
            format: 'json',
          }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        if (res.ok) {
          const payload = await res.json().catch(() => []);
          const items = Array.isArray(payload) ? payload : payload ? [payload] : [];

          return {
            success: true,
            provider: this.name,
            data: items,
            executionTimeMs: Date.now() - startTime,
            retriesAttempted: attempts - 1,
          };
        }

        if (res.status === 401 || res.status === 403) {
          return {
            success: false,
            provider: this.name,
            data: [],
            executionTimeMs: Date.now() - startTime,
            errorMessage: `Bright Data request unauthorized (HTTP ${res.status})`,
            retriesAttempted: attempts - 1,
          };
        }

        lastError = `Bright Data API returned HTTP ${res.status}`;
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Network error';
      }

      if (attempts <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }

    return {
      success: false,
      provider: this.name,
      data: [],
      executionTimeMs: Date.now() - startTime,
      errorMessage: `Bright Data run failed after ${attempts} attempts: ${lastError}`,
      retriesAttempted: attempts - 1,
    };
  }
}

export const brightDataProvider = new BrightDataProvider();
