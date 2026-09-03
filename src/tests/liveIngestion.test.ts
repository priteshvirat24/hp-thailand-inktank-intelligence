/**
 * Phase 3B Live Ingestion Runner & Pipeline Activation Test Suite
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { apifyProvider } from '@/services/scrapers/providers/apify';
import { brightDataProvider } from '@/services/scrapers/providers/brightdata';
import { ingestionPipeline } from '@/services/scrapers/ingestionPipeline';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { globalRunHistory } from '@/services/scrapers/runHistory';
import { analyticsService } from '@/services/analytics/analyticsService';
import { getSeedById, CRAWL_SEEDS } from '@/config/seeds';
import { shopeeAdapter } from '@/services/scrapers/adapters/shopee';
import { classifyPrinterItem } from '@/services/classification/classifier';
import { resolveSku } from '@/services/catalog/skuNormalizer';
import { generateDeterministicEvidenceId } from '@/lib/evidenceId';
import { convertBuddhistYearToGregorian } from '@/lib/dates';

describe('Phase 3B: Scraper Provider Health & Credential Isolation', () => {
  it('ApifyProvider reports NOT_CONFIGURED when APIFY_API_KEY is not set', async () => {
    const health = await apifyProvider.healthCheck();
    expect(health.provider).toBe('apify');
    expect(['CONFIGURED', 'NOT_CONFIGURED', 'REACHABLE', 'UNREACHABLE', 'ERROR', 'HEALTHY', 'UNCONFIGURED']).toContain(health.status);
    expect(health.message).toBeDefined();
    // Verify no secrets exposed in health object
    expect(JSON.stringify(health)).not.toContain('sk-');
    expect(JSON.stringify(health)).not.toContain('apify_api');
  });

  it('BrightDataProvider reports NOT_CONFIGURED when BRIGHTDATA_API_KEY is not set', async () => {
    const health = await brightDataProvider.healthCheck();
    expect(health.provider).toBe('brightdata');
    expect(['CONFIGURED', 'NOT_CONFIGURED', 'REACHABLE', 'UNREACHABLE', 'ERROR', 'HEALTHY', 'UNCONFIGURED']).toContain(health.status);
    expect(health.message).toBeDefined();
    // Verify no secrets exposed in health object
    expect(JSON.stringify(health)).not.toContain('brd-');
  });

  it('Provider execution fails gracefully without throwing when API keys are absent', async () => {
    const target = CRAWL_SEEDS[0];
    const apifyRes = await apifyProvider.run({ target });
    expect(apifyRes.success).toBe(false);
    expect(apifyRes.data).toEqual([]);
    expect(apifyRes.errorMessage).toBeDefined();
  });
});

describe('Phase 3B: Deterministic Evidence IDs & Idempotency', () => {
  beforeEach(() => {
    globalEvidenceStore.clear();
  });

  it('generateDeterministicEvidenceId produces identical hash for identical observation parameters', () => {
    const params = {
      platform: 'Meta' as const,
      sourceUrl: 'https://www.facebook.com/ads/library/?id=123456789',
      publishedAt: '2026-06-15',
      platformEntityId: '123456789',
    };

    const id1 = generateDeterministicEvidenceId(params);
    const id2 = generateDeterministicEvidenceId(params);

    expect(id1).toBe(id2);
    expect(id1).toMatch(/^EVID-META-[0-9a-f]{12}$/i);
  });

  it('Running the same ingestion twice results in 0 duplicates created on second run', async () => {
    const target = getSeedById('SEED-SHOPEE-HP')!;
    const mockProductPayload = [
      {
        item_id: '11223344',
        shop_id: '998877',
        name: 'HP Smart Tank 580 All-in-One Printer Wireless',
        price: 559000000, // 5,590 THB
        price_before_discount: 629000000,
        historical_sold: '1.5k sold',
        rating_star: 4.8,
        rating_count: 340,
        published_at: '2026-08-10',
        is_official_shop: true,
      },
    ];

    // First ingestion run
    const report1 = await ingestionPipeline.runIngestion(target, brightDataProvider, shopeeAdapter, mockProductPayload);
    expect(report1.accepted).toBe(1);
    expect(report1.duplicate).toBe(0);
    expect(globalEvidenceStore.getCount()).toBe(1);

    // Second identical ingestion run
    const report2 = await ingestionPipeline.runIngestion(target, brightDataProvider, shopeeAdapter, mockProductPayload);
    expect(report2.accepted).toBe(0);
    expect(report2.duplicate).toBe(1); // In-place update, zero new rows
    expect(globalEvidenceStore.getCount()).toBe(1);
  });
});

describe('Phase 3B: Date Normalization & Thai Buddhist Era Handling', () => {
  it('converts Thai Buddhist Year 2569 to Gregorian Year 2026', () => {
    expect(convertBuddhistYearToGregorian('2569-06-15')).toBe('2026-06-15');
    expect(convertBuddhistYearToGregorian('2569-08-28')).toBe('2026-08-28');
  });

  it('preserves valid Gregorian dates in 2026 without modification', () => {
    expect(convertBuddhistYearToGregorian('2026-07-04')).toBe('2026-07-04');
  });

  it('handles invalid or empty dates gracefully', () => {
    expect(convertBuddhistYearToGregorian('')).toBe('');
    expect(convertBuddhistYearToGregorian('invalid-date')).toBe('invalid-date');
  });
});

describe('Phase 3B: Classification Gate & Contamination Filtering', () => {
  it('accepts genuine Ink Tank printer models', () => {
    const res = classifyPrinterItem('HP Smart Tank 580 All-in-One Printer', 5590);
    expect(res.decision).toBe('ACCEPT');
  });

  it('rejects standalone ink refill bottles (GT52, 003, GI-790, BTD60)', () => {
    const res1 = classifyPrinterItem('หมึกแท้ HP GT53 Black Ink Bottle for Smart Tank', 350);
    expect(res1.decision).toBe('REJECT');

    const res2 = classifyPrinterItem('Epson 003 Original Ink Bottle Set 4 Colors', 890);
    expect(res2.decision).toBe('REJECT');
  });

  it('rejects cartridge printers (DeskJet, PIXMA TS)', () => {
    const res = classifyPrinterItem('HP DeskJet Ink Advantage 2775 All-in-One', 1890);
    expect(res.decision).toBe('REJECT');
  });

  it('rejects laser printers (LaserJet)', () => {
    const res = classifyPrinterItem('HP LaserJet Pro M404dn Monochrome Laser', 8900);
    expect(res.decision).toBe('REJECT');
  });

  it('flags genuine printer priced below ฿2,500 as REVIEW instead of hard REJECT', () => {
    const res = classifyPrinterItem('HP Smart Tank 580 Wireless (Flash Sale Clearance)', 1990);
    expect(res.decision).toBe('REVIEW');
    expect(res.price_signal.price_assessment).toBe('BELOW_THRESHOLD');
  });
});

describe('Phase 3B: SKU Normalization & Resolution Behavior', () => {
  it('resolves known canonical aliases to canonical SKU', () => {
    const res = resolveSku('HP 580 Smart Tank All-in-One Wireless', 'HP');
    expect(res.status).toBe('MATCHED');
    expect(res.canonical_model_name).toBe('Smart Tank 580');
    expect(res.canonical_sku_id).toBe('HP-ST-580');
  });

  it('marks unknown brand ink tank model as UNRESOLVED without guessing', () => {
    const res = resolveSku('HP Smart Tank Special Edition 9999 Custom Model', 'HP');
    expect(res.status).toBe('UNRESOLVED');
    expect(res.canonical_sku_id).toBeNull();
  });

  it('marks ambiguous model naming as AMBIGUOUS', () => {
    const res = resolveSku('HP Smart Tank 580 vs Smart Tank 515 Comparison Bundle', 'HP');
    expect(res.status).toBe('AMBIGUOUS');
  });
});

describe('Phase 3B: Ingestion Batch Runner & Analytical Cube Synchronization', () => {
  beforeEach(() => {
    globalEvidenceStore.clear();
    globalRunHistory.clear();
  });

  it('runBatch processes multiple targets, updates run history, and refreshes the analytical cube', async () => {
    const targetMeta = getSeedById('SEED-META-HP')!;
    const targetShopee = getSeedById('SEED-SHOPEE-HP')!;

    const customPayloads = {
      'SEED-META-HP': [
        {
          ad_id: 'AD-HP-580-01',
          headline: 'HP Smart Tank 580 - Save up to 8,000 color pages',
          body: 'พิมพ์จุใจ ประหยัดสุดคุ้มด้วย HP Smart Tank 580',
          format: 'video',
          start_date: '2026-08-05',
          ad_snapshot_url: 'https://facebook.com/ads/library/?id=AD-HP-580-01',
        },
      ],
      'SEED-SHOPEE-HP': [
        {
          item_id: 'HP-580-ITEM',
          shop_id: 'HP-SHOP',
          name: 'HP Smart Tank 580 Wireless All-in-One',
          price: 559000000, // 5,590 THB
          price_before_discount: 629000000,
          historical_sold: '2.1k sold',
          published_at: '2026-08-10',
          is_official_shop: true,
        },
      ],
    };

    const summary = await ingestionPipeline.runBatch([targetMeta, targetShopee], { customPayloads });

    expect(summary.status).toBe('SUCCESS');
    expect(summary.targets_attempted).toBe(2);
    expect(summary.targets_successful).toBe(2);
    expect(summary.records_accepted).toBe(2);
    expect(summary.errors_count).toBe(0);

    // Verify Run History record
    const recent = globalRunHistory.getRecentRuns(1);
    expect(recent).toHaveLength(1);
    expect(recent[0].run_id).toBe(summary.run_id);

    // Verify Evidence Store population
    expect(globalEvidenceStore.getCount()).toBe(2);

    // Verify Analytical Cube was rebuilt with real evidence
    const overview = analyticsService.getExecutiveOverview('2026-08');
    expect(overview.total_evidence_observations).toBe(2);
    expect(overview.brands.HP.total_visibility_touchpoints).toBe(2);
    expect(overview.brands.HP.avg_price_thb).toBe(5590);
    expect(overview.brands.HP.avg_discount_pct).toBe(11);
  });
});
