import { describe, it, expect } from 'vitest';
import { normalizeBrand, CANONICAL_SKUS, TARGET_BRANDS } from '@/config/brands';

describe('Brand Normalization & Canonical Registry', () => {
  it('normalizes English brand variations case-insensitively', () => {
    expect(normalizeBrand('HP')).toBe('HP');
    expect(normalizeBrand('hp')).toBe('HP');
    expect(normalizeBrand('Hewlett Packard')).toBe('HP');
    expect(normalizeBrand('HEWLETT PACKARD')).toBe('HP');
    expect(normalizeBrand('Epson')).toBe('Epson');
    expect(normalizeBrand('EPSON')).toBe('Epson');
    expect(normalizeBrand('Canon')).toBe('Canon');
    expect(normalizeBrand('canon')).toBe('Canon');
    expect(normalizeBrand('Brother')).toBe('Brother');
    expect(normalizeBrand('brother')).toBe('Brother');
  });

  it('normalizes Thai brand names correctly', () => {
    expect(normalizeBrand('เอชพี')).toBe('HP');
    expect(normalizeBrand('เครื่องพิมพ์ เอชพี')).toBe('HP');
    expect(normalizeBrand('เอปสัน')).toBe('Epson');
    expect(normalizeBrand('แคนนอน')).toBe('Canon');
    expect(normalizeBrand('บราเดอร์')).toBe('Brother');
  });

  it('returns null for non-target third-party brands', () => {
    expect(normalizeBrand('Samsung')).toBeNull();
    expect(normalizeBrand('Xerox')).toBeNull();
    expect(normalizeBrand('Ricoh')).toBeNull();
    expect(normalizeBrand('Kyocera')).toBeNull();
    expect(normalizeBrand('')).toBeNull();
  });

  it('contains exactly the 4 target brands in the registry', () => {
    expect(TARGET_BRANDS).toEqual(['HP', 'Epson', 'Canon', 'Brother']);
  });

  it('contains all 28 canonical SKUs referenced in the brief without null required keys', () => {
    expect(CANONICAL_SKUS.length).toBe(28);
    CANONICAL_SKUS.forEach((sku) => {
      expect(TARGET_BRANDS).toContain(sku.brand);
      expect(sku.sku_id).toMatch(/^(HP|EPSON|CANON|BROTHER)-/);
      expect(sku.model_name.length).toBeGreaterThan(0);
      expect(sku.aliases.length).toBeGreaterThan(0);
    });
  });
});
