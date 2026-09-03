/**
 * Web Discovery & SERP Candidate Generation Test Suite
 */

import { describe, it, expect } from 'vitest';
import { generateDiscoveryCandidates } from '@/services/web/discovery/searchDiscovery';
import { discoveryService } from '@/services/web/discovery/discoveryService';

describe('Web Discovery: SERP & Candidate Target Generation', () => {
  it('generates targeted retail candidates for a user query', () => {
    const candidates = generateDiscoveryCandidates({
      query: 'HP Smart Tank 580 price',
      maxCandidates: 10,
    });

    expect(candidates.length).toBeGreaterThanOrEqual(1);
    expect(candidates.some((c) => c.domain === 'shopee.co.th')).toBe(true);
    expect(candidates.some((c) => c.domain === 'lazada.co.th')).toBe(true);
    expect(candidates[0].discovery_source).toBe('SEARCH_SERP');
  });

  it('generates canonical discovery targets filtered by brand', () => {
    const hpCandidates = generateDiscoveryCandidates({
      brand: 'HP',
      maxCandidates: 8,
    });

    expect(hpCandidates.length).toBe(8);
    expect(hpCandidates.every((c) => c.brand_hint === 'HP')).toBe(true);
    expect(hpCandidates.some((c) => c.domain === 'hp.com')).toBe(true);
  });

  it('discoveryService merges provided seed URLs and search candidates cleanly', async () => {
    const result = await discoveryService.discoverTargets({
      seedUrls: ['https://www.hp.com/th-th/printers/smart-tank-580.html'],
      brand: 'HP',
      maxCandidates: 5,
    });

    expect(result.some((c) => c.discovery_source === 'USER_PROVIDED')).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});
