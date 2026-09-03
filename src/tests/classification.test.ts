import { describe, it, expect } from 'vitest';
import { classifyPrinterItem } from '@/services/classification/classifier';

describe('Category Classifier & Decision Synthesis Engine', () => {
  // 1. Positive Acceptance Tests
  describe('Positive Ink Tank Acceptance', () => {
    it('accepts canonical HP Smart Tank models', () => {
      const res = classifyPrinterItem('HP Smart Tank 580 Multifunction Printer', 5490);
      expect(res.decision).toBe('ACCEPT');
      expect(res.normalized_brand).toBe('HP');
      expect(res.normalized_sku).toBe('Smart Tank 580');
      expect(res.is_tank_hardware).toBe(true);
      expect(res.confidence).toBeGreaterThanOrEqual(0.95);
    });

    it('accepts canonical Epson EcoTank models', () => {
      const res = classifyPrinterItem('Epson EcoTank L3250', 5190);
      expect(res.decision).toBe('ACCEPT');
      expect(res.normalized_brand).toBe('Epson');
      expect(res.normalized_sku).toBe('EcoTank L3250');
      expect(res.is_tank_hardware).toBe(true);
    });

    it('accepts canonical Canon MegaTank models', () => {
      const res = classifyPrinterItem('Canon PIXMA G3730 Ink Tank Printer', 5390);
      expect(res.decision).toBe('ACCEPT');
      expect(res.normalized_brand).toBe('Canon');
      expect(res.normalized_sku).toBe('PIXMA G3730');
      expect(res.is_tank_hardware).toBe(true);
    });

    it('accepts canonical Brother InkBenefit models', () => {
      const res = classifyPrinterItem('Brother DCP-T520W Ink Tank', 5490);
      expect(res.decision).toBe('ACCEPT');
      expect(res.normalized_brand).toBe('Brother');
      expect(res.normalized_sku).toBe('DCP-T520W');
      expect(res.is_tank_hardware).toBe(true);
    });

    it('accepts Thai language Ink Tank titles', () => {
      const res = classifyPrinterItem('เครื่องพิมพ์ HP แท็งก์หมึก Smart Tank 580', 5490);
      expect(res.decision).toBe('ACCEPT');
      expect(res.normalized_brand).toBe('HP');
      expect(res.normalized_sku).toBe('Smart Tank 580');
      expect(res.is_tank_hardware).toBe(true);

      const resEpson = classifyPrinterItem('Epson เครื่องพิมพ์แท็งก์หมึก EcoTank L3250 ปริ้นเตอร์เติมหมึก', 5190);
      expect(resEpson.decision).toBe('ACCEPT');
      expect(resEpson.normalized_brand).toBe('Epson');
    });

    it('accepts ad/social items without price (price is null)', () => {
      const res = classifyPrinterItem('HP Smart Tank 580 Wireless All-in-One Printer New Campaign');
      expect(res.decision).toBe('ACCEPT');
      expect(res.price_signal.price_assessment).toBe('NO_PRICE');
      expect(res.is_tank_hardware).toBe(true);
    });
  });

  // 2. Hard Negative Exclusions
  describe('Hard Negative Exclusions', () => {
    it('strictly rejects cartridge-based inkjet printers', () => {
      const hpDeskjet = classifyPrinterItem('HP DeskJet 2820 All-in-One Printer', 1490);
      expect(hpDeskjet.decision).toBe('REJECT');
      expect(hpDeskjet.matched_negative_signals).toContain('Cartridge Inkjet');

      const canonTs = classifyPrinterItem('Canon PIXMA TS3470 Wireless Cartridge Printer', 1890);
      expect(canonTs.decision).toBe('REJECT');
      expect(canonTs.matched_negative_signals).toContain('Cartridge Inkjet');

      const thaiCartridge = classifyPrinterItem('HP หมึกตลับ DeskJet Ink Advantage', 1290);
      expect(thaiCartridge.decision).toBe('REJECT');
    });

    it('strictly rejects laser printers and toners', () => {
      const hpLaser = classifyPrinterItem('HP LaserJet MFP M141w Laser Printer', 4890);
      expect(hpLaser.decision).toBe('REJECT');
      expect(hpLaser.matched_negative_signals).toContain('Laser / Toner');

      const brotherHl = classifyPrinterItem('Brother HL-L2320D Monochrome Laser Printer', 2990);
      expect(brotherHl.decision).toBe('REJECT');
      expect(brotherHl.matched_negative_signals).toContain('Laser / Toner');

      const canonLaser = classifyPrinterItem('Canon imageCLASS LBP6030 เลเซอร์', 3590);
      expect(canonLaser.decision).toBe('REJECT');
    });

    it('strictly rejects standalone consumable refill ink bottles', () => {
      const epsonBottle = classifyPrinterItem('Epson 003 Black Ink Bottle', 250);
      expect(epsonBottle.decision).toBe('REJECT');
      expect(epsonBottle.matched_negative_signals).toContain('Standalone Consumable / Bottle');

      const canonBottle = classifyPrinterItem('Canon GI-71 Ink Bottle', 350);
      expect(canonBottle.decision).toBe('REJECT');
      expect(canonBottle.matched_negative_signals).toContain('Standalone Consumable / Bottle');

      const hpBottle = classifyPrinterItem('HP GT53 Refill Ink Bottle', 290);
      expect(hpBottle.decision).toBe('REJECT');

      const thaiBottle = classifyPrinterItem('Brother เฉพาะขวดหมึก BTD60BK', 260);
      expect(thaiBottle.decision).toBe('REJECT');
    });

    it('strictly rejects accessories, spare parts, printheads, and photo paper', () => {
      const printhead = classifyPrinterItem('HP Printhead Replacement Part for Smart Tank', 1250);
      expect(printhead.decision).toBe('REJECT');
      expect(printhead.matched_negative_signals).toContain('Accessory / Spare Part');

      const paper = classifyPrinterItem('Photo Paper for HP Color Printing 100 Sheets', 199);
      expect(paper.decision).toBe('REJECT');
      expect(paper.matched_negative_signals).toContain('Accessory / Spare Part');

      const maintBox = classifyPrinterItem('Epson กล่องซับหมึก Maintenance Box L3250', 350);
      expect(maintBox.decision).toBe('REJECT');
    });

    it('rejects adversarial combined titles like "HP Smart Tank 580 Ink Bottle"', () => {
      const res = classifyPrinterItem('HP Smart Tank 580 Ink Bottle', 290);
      expect(res.decision).toBe('REJECT');
      expect(res.matched_negative_signals.length).toBeGreaterThan(0);
    });

    it('rejects non-target brands', () => {
      const res = classifyPrinterItem('Samsung Xpress M2020 Laser Printer', 2890);
      expect(res.decision).toBe('REJECT');
      expect(res.normalized_brand).toBeNull();
    });
  });

  // 3. Price Validation & Ambiguity Review Behavior
  describe('Price Floor & Ambiguity Review Behavior', () => {
    it('returns REVIEW for ambiguous short query "HP 580" without explicit Tank keyword', () => {
      const res = classifyPrinterItem('HP 580', 5490);
      expect(res.decision).toBe('REVIEW');
      expect(res.normalized_brand).toBe('HP');
      expect(res.normalized_sku).toBe('Smart Tank 580');
      expect(res.review_reason).toContain('Ambiguous model number');
      expect(res.confidence).toBeLessThan(0.8);
    });

    it('returns REVIEW for legitimate Ink Tank printer with price below ฿2,500 threshold', () => {
      const res = classifyPrinterItem('HP Smart Tank 580 All-in-One Wireless Printer Flash Promo', 1990);
      expect(res.decision).toBe('REVIEW');
      expect(res.normalized_brand).toBe('HP');
      expect(res.normalized_sku).toBe('Smart Tank 580');
      expect(res.price_signal.price_assessment).toBe('BELOW_THRESHOLD');
      expect(res.review_reason).toContain('below hardware threshold');
    });

    it('returns REVIEW for consumer printer with price above ฿25,000 threshold', () => {
      const res = classifyPrinterItem('HP Smart Tank 580 Bundle with 50 Accessories', 28900);
      expect(res.decision).toBe('REVIEW');
      expect(res.price_signal.price_assessment).toBe('ABOVE_THRESHOLD');
      expect(res.review_reason).toContain('exceeds consumer/SMB hardware ceiling');
    });
  });
});
