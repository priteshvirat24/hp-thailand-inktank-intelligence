import { describe, it, expect } from 'vitest';
import {
  CANONICAL_SKUS,
  getAllSkus,
  getSkusByBrand,
  getSkuById,
  isCanonicalSku,
  getCompetitorEquivalents,
} from '@/config/skus';
import { TARGET_BRANDS, BRAND_FAMILIES } from '@/config/brands';

describe('Canonical SKU Master Registry & Taxonomy Invariants', () => {
  it('contains exactly 28 canonical SKUs across the 4 brands', () => {
    const skus = getAllSkus();
    expect(skus.length).toBe(28);

    const hpSkus = getSkusByBrand('HP');
    const epsonSkus = getSkusByBrand('Epson');
    const canonSkus = getSkusByBrand('Canon');
    const brotherSkus = getSkusByBrand('Brother');

    expect(hpSkus.length).toBe(7);
    expect(epsonSkus.length).toBe(7);
    expect(canonSkus.length).toBe(8);
    expect(brotherSkus.length).toBe(6);
  });

  it('ensures every SKU ID is globally unique and formatted with standard brand prefix', () => {
    const seenIds = new Set<string>();
    CANONICAL_SKUS.forEach((sku) => {
      expect(seenIds.has(sku.sku_id)).toBe(false);
      seenIds.add(sku.sku_id);
      expect(sku.sku_id).toMatch(/^(HP|EPSON|CANON|BROTHER)-/);
    });
  });

  it('ensures every SKU belongs to exactly one target brand and valid family', () => {
    CANONICAL_SKUS.forEach((sku) => {
      expect(TARGET_BRANDS).toContain(sku.brand);
      expect(BRAND_FAMILIES[sku.brand]).toContain(sku.family);
    });
  });

  it('ensures model names are unique within each brand', () => {
    TARGET_BRANDS.forEach((brand) => {
      const skus = getSkusByBrand(brand);
      const seenNames = new Set<string>();
      skus.forEach((sku) => {
        expect(seenNames.has(sku.model_name)).toBe(false);
        seenNames.add(sku.model_name);
      });
    });
  });

  it('ensures no canonical SKU contains exclusion keywords in its model name or aliases', () => {
    const exclusionRegex = /(DeskJet|LaserJet|Cartridge|Toner|Bottle\s*Only|Printhead|Photo\s*Paper)/i;
    CANONICAL_SKUS.forEach((sku) => {
      expect(sku.model_name).not.toMatch(exclusionRegex);
      sku.aliases.forEach((alias) => {
        expect(alias).not.toMatch(exclusionRegex);
      });
    });
  });

  it('ensures competitor equivalence references resolve to valid models in the registry', () => {
    const allModelNames = new Set(CANONICAL_SKUS.map((s) => s.model_name.toLowerCase()));
    CANONICAL_SKUS.forEach((sku) => {
      if (sku.competitor_equivalents) {
        sku.competitor_equivalents.forEach((equiv) => {
          expect(allModelNames.has(equiv.toLowerCase())).toBe(true);
        });
      }
    });
  });

  it('verifies public query methods return immutable and accurate results', () => {
    expect(isCanonicalSku('HP-ST-580')).toBe(true);
    expect(isCanonicalSku('UNKNOWN-SKU-999')).toBe(false);

    const sku580 = getSkuById('HP-ST-580');
    expect(sku580).toBeDefined();
    expect(sku580?.model_name).toBe('Smart Tank 580');
    expect(sku580?.brand).toBe('HP');

    const equivs = getCompetitorEquivalents('HP-ST-580');
    expect(equivs).toContain('EcoTank L3250');
    expect(equivs).toContain('PIXMA G3730');
    expect(equivs).toContain('DCP-T520W');
  });
});
