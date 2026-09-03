/**
 * Browser Escalation Layer (Bright Data Scraping Browser & Apify Playwright)
 */

import { createHash } from 'crypto';
import { getServerEnv } from '@/config/env';
import { brightDataProvider } from '@/services/scrapers/providers/brightdata';
import { apifyProvider } from '@/services/scrapers/providers/apify';
import { DirectHttpResult } from './directHttpFetcher';

export async function fetchWithBrowserEscalation(
  targetUrl: string,
  preferredProvider: 'brightdata' | 'apify' = 'brightdata'
): Promise<DirectHttpResult> {
  const startTime = Date.now();
  const env = getServerEnv();

  const hasBrightData = Boolean(env.BRIGHTDATA_API_KEY && env.BRIGHTDATA_API_KEY.trim().length > 0);
  const hasApify = Boolean(env.APIFY_API_KEY && env.APIFY_API_KEY.trim().length > 0);

  // 1. Try Bright Data Web Unlocker / Scraping Browser
  if (preferredProvider === 'brightdata' && hasBrightData) {
    try {
      const resp = await brightDataProvider.run({
        target: {
          target_id: 'LIVE-BROWSER-TARGET',
          source_id: 'src-generic-web',
          platform: 'Shopee',
          brand: 'HP',
          channel: 'E-commerce',
          country: 'Thailand',
          locale: 'th-TH',
          seed_url: targetUrl,
          status: 'ACTIVE_SEED',
        },
      });

      const html = typeof resp.data[0] === 'string' ? (resp.data[0] as string) : JSON.stringify(resp.data);
      const contentHash = createHash('sha256').update(html, 'utf8').digest('hex');

      return {
        success: resp.success,
        httpStatus: 200,
        finalUrl: targetUrl,
        redirectChain: [targetUrl],
        html,
        contentType: 'text/html',
        durationMs: Date.now() - startTime,
        contentHash,
      };
    } catch {
      // Fall through
    }
  }

  // 2. Try Apify Browser / Actor
  if (hasApify) {
    try {
      const resp = await apifyProvider.run({
        target: {
          target_id: 'LIVE-APIFY-TARGET',
          source_id: 'src-generic-web',
          platform: 'Meta',
          brand: 'HP',
          channel: 'Social',
          country: 'Thailand',
          locale: 'th-TH',
          seed_url: targetUrl,
          status: 'ACTIVE_SEED',
        },
      });

      const html = typeof resp.data[0] === 'string' ? (resp.data[0] as string) : JSON.stringify(resp.data);
      const contentHash = createHash('sha256').update(html, 'utf8').digest('hex');

      return {
        success: resp.success,
        httpStatus: 200,
        finalUrl: targetUrl,
        redirectChain: [targetUrl],
        html,
        contentType: 'text/html',
        durationMs: Date.now() - startTime,
        contentHash,
      };
    } catch {
      // Fall through
    }
  }

  // Fallback when providers are not configured
  return {
    success: false,
    httpStatus: null,
    finalUrl: targetUrl,
    redirectChain: [targetUrl],
    html: '',
    contentType: null,
    durationMs: Date.now() - startTime,
    contentHash: '',
    errorCode: 'PROVIDER_NOT_CONFIGURED',
    errorMessage: 'No browser provider credentials (BRIGHTDATA_API_KEY / APIFY_API_KEY) configured in .env.local.',
  };
}
