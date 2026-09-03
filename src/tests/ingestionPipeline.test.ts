import { describe, it, expect, beforeEach } from 'vitest';
import { ingestionPipeline } from '@/services/scrapers/ingestionPipeline';
import { shopeeAdapter } from '@/services/scrapers/adapters/shopee';
import { brightDataProvider } from '@/services/scrapers/providers/brightdata';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { getSeedById } from '@/config/seeds';

describe('Authoritative Ingestion Pipeline & Lifecycle', () => {
  beforeEach(() => {
    globalEvidenceStore.clear();
  });

  it('orchestrates end-to-end ingestion, classification, SKU resolution, and idempotent persistence', async () => {
    const target = getSeedById('SEED-SHOPEE-HP')!;
    const mockPayload = [
      // 1. Valid Smart Tank 580 listing
      {
        itemid: 101,
        shopid: 202,
        name: 'HP Smart Tank 580 Wireless All-in-One Printer',
        description: 'เครื่องพิมพ์ HP Smart Tank 580',
        price: 5490,
        price_before_discount: 5990,
        historical_sold: '1.2k sold',
        rating_star: 4.8,
        rating_count: 150,
        created_at: '2569-07-15', // Buddhist Era date (2569 -> 2026)
        is_official_shop: true,
      },
      // 2. Contaminated item (DeskJet cartridge printer -> Should be REJECTED)
      {
        itemid: 102,
        shopid: 202,
        name: 'HP DeskJet 2820 All-in-One Printer',
        description: 'HP DeskJet',
        price: 1490,
      },
      // 3. Contaminated item (Refill bottle alone -> Should be REJECTED)
      {
        itemid: 103,
        shopid: 202,
        name: 'HP GT53 Black Ink Bottle for Smart Tank',
        description: 'หมึกขวด GT53',
        price: 290,
      },
    ];

    const report = await ingestionPipeline.runIngestion(
      target,
      brightDataProvider,
      shopeeAdapter,
      mockPayload
    );

    expect(report.extracted).toBe(3);
    expect(report.accepted).toBe(1); // Only Smart Tank 580
    expect(report.rejected).toBe(2); // DeskJet + GT53 bottle rejected
    expect(report.duplicate).toBe(0);
    expect(report.failed).toBe(0);

    const persisted = globalEvidenceStore.getAll();
    expect(persisted.length).toBe(1);
    expect(persisted[0].product_sku).toBe('Smart Tank 580');
    expect(persisted[0].published_at).toBe('2026-07-15'); // BE converted to Gregorian
    expect(persisted[0].brand).toBe('HP');
    expect(persisted[0].evidence_id).toMatch(/^EVID-SHOPEE-[A-F0-9]{12}$/);
  });

  it('enforces strict idempotency when the same crawl payload is processed multiple times', async () => {
    const target = getSeedById('SEED-SHOPEE-HP')!;
    const mockPayload = [
      {
        itemid: 505,
        shopid: 606,
        name: 'HP Smart Tank 580 Wireless Printer',
        price: 5490,
        created_at: '2026-08-01',
      },
    ];

    // Crawl Run #1
    const report1 = await ingestionPipeline.runIngestion(
      target,
      brightDataProvider,
      shopeeAdapter,
      mockPayload
    );
    expect(report1.accepted).toBe(1);
    expect(report1.duplicate).toBe(0);
    expect(globalEvidenceStore.getCount()).toBe(1);

    // Crawl Run #2 (identical payload)
    const report2 = await ingestionPipeline.runIngestion(
      target,
      brightDataProvider,
      shopeeAdapter,
      mockPayload
    );
    expect(report2.accepted).toBe(0);
    expect(report2.duplicate).toBe(1); // Marked as duplicate/updated
    expect(globalEvidenceStore.getCount()).toBe(1); // Count remains 1!
  });
});
