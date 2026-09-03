/**
 * Authoritative Brand Taxonomy, Colors, and Normalization Utilities
 */

import { TargetBrand, ProductFamily } from '@/types/brands';

export const TARGET_BRANDS: readonly TargetBrand[] = ['HP', 'Epson', 'Canon', 'Brother'] as const;

export const BRAND_FAMILIES: Record<TargetBrand, readonly ProductFamily[]> = {
  HP: ['Smart Tank'],
  Epson: ['EcoTank'],
  Canon: ['MegaTank'],
  Brother: ['InkBenefit'],
};

export const BRAND_COLORS: Record<TargetBrand, { primary: string; secondary: string; light: string }> = {
  HP: {
    primary: '#0096D6',
    secondary: '#007BB0',
    light: '#E0F2FE',
  },
  Epson: {
    primary: '#003399',
    secondary: '#002266',
    light: '#EEF2FF',
  },
  Canon: {
    primary: '#CC0000',
    secondary: '#990000',
    light: '#FEF2F2',
  },
  Brother: {
    primary: '#005BAC',
    secondary: '#004380',
    light: '#EFF6FF',
  },
};

/**
 * Flat hex color map for use in recharts, inline styles, and conditional classes.
 * Matches BRAND_COLORS primary values.
 */
export const BRAND_HEX_COLORS: Record<TargetBrand, string> = {
  HP: '#0096D6',
  Epson: '#003399',
  Canon: '#CC0000',
  Brother: '#005BAC',
};

/**
 * Deterministic Brand Normalizer
 * Normalizes Thai and English brand naming variants to canonical TargetBrand
 */
export function normalizeBrand(input: string): TargetBrand | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  if (/(^|[^a-zA-Z0-9])(hp|hewlett\s*packard|เอชพี)([^a-zA-Z0-9]|$)/i.test(trimmed)) {
    return 'HP';
  }
  if (/(^|[^a-zA-Z0-9])(epson|เอปสัน)([^a-zA-Z0-9]|$)/i.test(trimmed)) {
    return 'Epson';
  }
  if (/(^|[^a-zA-Z0-9])(canon|แคนนอน)([^a-zA-Z0-9]|$)/i.test(trimmed)) {
    return 'Canon';
  }
  if (/(^|[^a-zA-Z0-9])(brother|บราเดอร์)([^a-zA-Z0-9]|$)/i.test(trimmed)) {
    return 'Brother';
  }

  return null;
}

// Re-export SKU master registry from canonical single source of truth
export {
  CANONICAL_SKUS,
  getAllSkus,
  getSkusByBrand,
  getSkuById,
  getSkuByModelName,
  isCanonicalSku,
  getCompetitorEquivalents,
} from './skus';
