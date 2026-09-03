import { describe, it, expect } from 'vitest';
import { apifyProvider } from '@/services/scrapers/providers/apify';
import { brightDataProvider } from '@/services/scrapers/providers/brightdata';
import { CRAWL_SEEDS } from '@/config/seeds';

describe('Scraper Provider Abstraction Contract', () => {
  it('provides standardized health checks for Apify and Bright Data', async () => {
    const allowedStatuses = ['HEALTHY', 'REACHABLE', 'CONFIGURED', 'NOT_CONFIGURED', 'UNCONFIGURED'];
    const apifyHealth = await apifyProvider.healthCheck();
    expect(apifyHealth.provider).toBe('apify');
    expect(allowedStatuses).toContain(apifyHealth.status);

    const brightDataHealth = await brightDataProvider.healthCheck();
    expect(brightDataHealth.provider).toBe('brightdata');
    expect(allowedStatuses).toContain(brightDataHealth.status);
  });

  it('handles execution gracefully and returns standardized ProviderResponse', async () => {
    const target = CRAWL_SEEDS[0];
    const apifyRes = await apifyProvider.run({ target });

    expect(apifyRes.provider).toBe('apify');
    expect(typeof apifyRes.executionTimeMs).toBe('number');
    expect(Array.isArray(apifyRes.data)).toBe(true);

    const brightDataRes = await brightDataProvider.run({ target });
    expect(brightDataRes.provider).toBe('brightdata');
    expect(typeof brightDataRes.executionTimeMs).toBe('number');
    expect(Array.isArray(brightDataRes.data)).toBe(true);
  });
});
