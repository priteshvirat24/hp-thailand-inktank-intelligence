import { describe, it, expect } from 'vitest';
import { resolveSku } from '@/services/catalog/skuNormalizer';

describe('Deterministic SKU Normalizer Service', () => {
  describe('Canonical Model Resolution (Clean & Retailer Titles)', () => {
    it('resolves HP Smart Tank 580 across varied retailer title formats', () => {
      const titles = [
        'HP Smart Tank 580 Multifunction Printer',
        'HP Smart Tank 580 All-in-One Printer',
        'HP 580 Wireless Smart Tank Printer',
        'เครื่องพิมพ์ HP Smart Tank 580 All-in-One',
        'HP Smart Tank 580 (Print/Scan/Copy/Wi-Fi)',
        'HP SmartTank 580 Wireless',
      ];

      titles.forEach((title) => {
        const res = resolveSku(title);
        expect(res.status).toBe('MATCHED');
        expect(res.canonical_sku_id).toBe('HP-ST-580');
        expect(res.canonical_model_name).toBe('Smart Tank 580');
        expect(res.brand).toBe('HP');
        expect(res.family).toBe('Smart Tank');
        expect(res.confidence).toBeGreaterThanOrEqual(0.9);
      });
    });

    it('resolves Epson EcoTank L3250 across varied retailer formats', () => {
      const titles = [
        'Epson EcoTank L3250 AIO Wi-Fi Printer',
        'EPSON L3250 EcoTank All-in-One',
        'เครื่องพิมพ์แท็งก์แท้ Epson EcoTank L3250 Wi-Fi',
        'Epson EcoTank L3250 Wi-Fi Direct',
      ];

      titles.forEach((title) => {
        const res = resolveSku(title);
        expect(res.status).toBe('MATCHED');
        expect(res.canonical_sku_id).toBe('EPSON-ET-L3250');
        expect(res.canonical_model_name).toBe('EcoTank L3250');
        expect(res.brand).toBe('Epson');
        expect(res.family).toBe('EcoTank');
      });
    });

    it('resolves Canon PIXMA G3730 across varied retailer formats', () => {
      const titles = [
        'Canon PIXMA G3730 MegaTank Wireless All-in-One',
        'CANON G3730 All in One Wi-Fi Printer',
        'เครื่องพิมพ์ Canon MegaTank PIXMA G3730',
        'Canon PIXMA G3730 Ink Tank Printer',
      ];

      titles.forEach((title) => {
        const res = resolveSku(title);
        expect(res.status).toBe('MATCHED');
        expect(res.canonical_sku_id).toBe('CANON-MT-G3730');
        expect(res.canonical_model_name).toBe('PIXMA G3730');
        expect(res.brand).toBe('Canon');
        expect(res.family).toBe('MegaTank');
      });
    });

    it('resolves Brother DCP-T520W across varied retailer formats', () => {
      const titles = [
        'Brother DCP-T520W InkBenefit All-in-One',
        'BROTHER DCP-T520W Wireless Refill Tank',
        'Brother T520W Refill Tank Printer',
        'เครื่องพิมพ์ Brother DCP-T520W เติมหมึก',
      ];

      titles.forEach((title) => {
        const res = resolveSku(title);
        expect(res.status).toBe('MATCHED');
        expect(res.canonical_sku_id).toBe('BROTHER-IB-T520W');
        expect(res.canonical_model_name).toBe('DCP-T520W');
        expect(res.brand).toBe('Brother');
        expect(res.family).toBe('InkBenefit');
      });
    });
  });

  describe('Exclusion & Contamination Safety', () => {
    it('never resolves standalone ink bottles to printer SKUs', () => {
      const bottleTitles = [
        'HP GT53 Black Ink Bottle for Smart Tank 580',
        'Epson 003 Black Ink Bottle for L3250',
        'Canon GI-71 Cyan Ink Bottle for PIXMA G3730',
        'Brother BTD60BK Refill Ink Bottle for DCP-T520W',
        'HP Smart Tank 580 Ink Bottle',
        'Epson L3250 bottle only 003',
      ];

      bottleTitles.forEach((title) => {
        const res = resolveSku(title);
        expect(res.status).toBe('UNRESOLVED');
        expect(res.canonical_sku_id).toBeNull();
        expect(res.confidence).toBe(0.0);
        expect(res.reason).toContain('negative exclusion');
      });
    });

    it('never resolves cartridge or laser models to Ink Tank SKUs', () => {
      const nonTankTitles = [
        'HP DeskJet 2820 All-in-One Printer',
        'Canon PIXMA TS3470 Wireless Cartridge Printer',
        'HP LaserJet MFP M141w Laser Printer',
        'Brother HL-L2320D Monochrome Laser Printer',
        'HP Cartridge Printer DeskJet',
      ];

      nonTankTitles.forEach((title) => {
        const res = resolveSku(title);
        expect(res.status).toBe('UNRESOLVED');
        expect(res.canonical_sku_id).toBeNull();
        expect(res.confidence).toBe(0.0);
      });
    });

    it('never resolves accessories, printheads, or paper to printer SKUs', () => {
      const accessoryTitles = [
        'HP Printhead replacement for Smart Tank 580',
        'Epson Maintenance Box L3250 กล่องซับหมึก',
        'Canon Photo Paper Plus Glossy II for PIXMA G3730',
      ];

      accessoryTitles.forEach((title) => {
        const res = resolveSku(title);
        expect(res.status).toBe('UNRESOLVED');
        expect(res.canonical_sku_id).toBeNull();
      });
    });
  });

  describe('Ambiguity & Unknown Handling', () => {
    it('returns AMBIGUOUS when multiple canonical models are referenced', () => {
      const ambiguousTitle = 'HP Smart Tank 580 vs Smart Tank 515 Comparison Bundle';
      const res = resolveSku(ambiguousTitle);
      expect(res.status).toBe('AMBIGUOUS');
      expect(res.canonical_sku_id).toBeNull();
      expect(res.confidence).toBeLessThan(0.5);
    });

    it('returns UNRESOLVED for unknown target brand products without fabricating closest SKU', () => {
      const unknownHp = 'HP Smart Tank 9999 Commercial Edition';
      const res = resolveSku(unknownHp);
      expect(res.status).toBe('UNRESOLVED');
      expect(res.canonical_sku_id).toBeNull();
      expect(res.brand).toBe('HP');
      expect(res.family).toBe('Smart Tank');
      expect(res.reason).toContain('not found in the 28-SKU catalog');
    });

    it('returns UNRESOLVED for non-target brands', () => {
      const samsungPrinter = 'Samsung Xpress M2020 Wireless Printer';
      const res = resolveSku(samsungPrinter);
      expect(res.status).toBe('UNRESOLVED');
      expect(res.canonical_sku_id).toBeNull();
      expect(res.brand).toBeNull();
    });

    it('returns UNRESOLVED for empty input string', () => {
      const res = resolveSku('');
      expect(res.status).toBe('UNRESOLVED');
      expect(res.canonical_sku_id).toBeNull();
    });
  });
});
