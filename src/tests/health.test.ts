import { describe, it, expect } from 'vitest';
import { PROJECT_METADATA } from '@/config/constants';
import { DATE_CONFIG } from '@/config/dates';
import { TARGET_BRANDS, CANONICAL_SKUS } from '@/config/brands';

describe('Project Health & Scope Invariants', () => {
  it('enforces Thailand geography and THB currency', () => {
    expect(PROJECT_METADATA.geography).toBe('Thailand');
    expect(PROJECT_METADATA.currency).toBe('THB');
    expect(PROJECT_METADATA.currency_symbol).toBe('฿');
  });

  it('enforces 90-day window covering June, July, August 2026', () => {
    expect(DATE_CONFIG.OBSERVATION_START).toBe('2026-05-28');
    expect(DATE_CONFIG.OBSERVATION_END).toBe('2026-08-28');
    expect(DATE_CONFIG.ANALYTICAL_MONTHS).toEqual(['2026-06', '2026-07', '2026-08']);
  });

  it('contains exactly 4 mandatory target brands', () => {
    expect(TARGET_BRANDS).toEqual(['HP', 'Epson', 'Canon', 'Brother']);
  });

  it('registers canonical SKUs across all 4 brands with valid launch RRPs', () => {
    expect(CANONICAL_SKUS.length).toBeGreaterThanOrEqual(16);
    CANONICAL_SKUS.forEach((sku) => {
      expect(sku.launch_rrp_thb).toBeGreaterThanOrEqual(2500);
      expect(sku.launch_rrp_thb).toBeLessThanOrEqual(25000);
      expect(TARGET_BRANDS).toContain(sku.brand);
    });
  });
});
