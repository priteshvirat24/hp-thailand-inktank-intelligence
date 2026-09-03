/**
 * Web Acquisition, Security, Parsing & Evidence Integration Test Suite
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { validateUrlSafety, normalizeUrl } from '@/services/web/discovery/urlNormalizer';
import { extractCanonicalUrl } from '@/services/web/discovery/canonicalizer';
import { extractLinksFromHtml } from '@/services/web/discovery/linkExtractor';
import { RobotsPolicyEngine } from '@/services/web/policies/robotsPolicy';
import { extractPriceFromText } from '@/services/web/extraction/priceExtractor';
import { extractSocialProof } from '@/services/web/extraction/reviewExtractor';
import { extractJsonLd } from '@/services/web/extraction/jsonLdExtractor';
import { inspectHtml } from '@/services/web/extraction/htmlExtractor';
import { routeAcquisitionStrategy } from '@/services/web/acquisition/acquisitionRouter';
import { acquisitionService } from '@/services/web/acquisition/acquisitionService';
import { genericWebAdapter } from '@/services/web/adapters/genericWebAdapter';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { runDomainDiagnostics } from '@/services/web/diagnostics/acquisitionDiagnostics';
import { globalCrawlSessionStore } from '@/services/web/sessionStore';

describe('Web Acquisition: SSRF & URL Safety Guardrails', () => {
  it('blocks localhost, 127.0.0.1, 0.0.0.0, and cloud metadata 169.254.169.254', () => {
    expect(validateUrlSafety('http://localhost:3000/printers').safe).toBe(false);
    expect(validateUrlSafety('http://127.0.0.1/admin').safe).toBe(false);
    expect(validateUrlSafety('http://0.0.0.0/').safe).toBe(false);
    expect(validateUrlSafety('http://169.254.169.254/latest/meta-data/').safe).toBe(false);
  });

  it('blocks private IPv4 subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)', () => {
    expect(validateUrlSafety('http://10.0.0.1/api').safe).toBe(false);
    expect(validateUrlSafety('http://172.16.5.10/').safe).toBe(false);
    expect(validateUrlSafety('http://192.168.1.1/router').safe).toBe(false);
  });

  it('blocks dangerous non-HTTP schemes (file://, ftp://, javascript:, data:)', () => {
    expect(validateUrlSafety('file:///etc/passwd').safe).toBe(false);
    expect(validateUrlSafety('ftp://ftp.example.com').safe).toBe(false);
    expect(validateUrlSafety('javascript:alert(1)').safe).toBe(false);
    expect(validateUrlSafety('data:text/html,<html></html>').safe).toBe(false);
  });

  it('allows safe public HTTP and HTTPS URLs and extracts domain', () => {
    const res1 = validateUrlSafety('https://www.hp.com/th-th/printers/smart-tank-580.html');
    expect(res1.safe).toBe(true);
    expect(res1.domain).toBe('hp.com');

    const res2 = validateUrlSafety('https://shopee.co.th/product/123/456');
    expect(res2.safe).toBe(true);
    expect(res2.domain).toBe('shopee.co.th');
  });

  it('strips marketing tracking parameters while preserving product identifying query params', () => {
    const dirtyUrl =
      'https://www.advice.co.th/product/inkjet-printer/hp-smart-tank-580?item_id=12345&utm_source=facebook&utm_medium=cpc&fbclid=abc123xyz#specifications';
    const cleanUrl = normalizeUrl(dirtyUrl);

    expect(cleanUrl).toContain('item_id=12345');
    expect(cleanUrl).not.toContain('utm_source');
    expect(cleanUrl).not.toContain('utm_medium');
    expect(cleanUrl).not.toContain('fbclid');
    expect(cleanUrl).not.toContain('#specifications');
  });
});

describe('Web Acquisition: Robots.txt Parsing & Link Extraction', () => {
  it('parses robots.txt disallow rules and checks path permissions', () => {
    const robotsContent = `
      User-agent: *
      Disallow: /admin/
      Disallow: /checkout/
      Allow: /products/
      Sitemap: https://example.com/sitemap.xml
    `;

    const engine = new RobotsPolicyEngine();
    const parsed = engine.parseRobotsTxt(robotsContent);

    expect(parsed.sitemaps).toContain('https://example.com/sitemap.xml');
    expect(engine.isAllowed(parsed, '/products/hp-580')).toBe(true);
    expect(engine.isAllowed(parsed, '/admin/login')).toBe(false);
    expect(engine.isAllowed(parsed, '/checkout/cart')).toBe(false);
  });

  it('extracts canonical URLs from HTML', () => {
    const html = `
      <html>
        <head>
          <link rel="canonical" href="https://www.hp.com/th-th/printers/smart-tank-580" />
        </head>
      </html>
    `;
    const canonical = extractCanonicalUrl(html, 'https://www.hp.com/th-th/printers/smart-tank-580.html?ref=123');
    expect(canonical).toBe('https://www.hp.com/th-th/printers/smart-tank-580');
  });

  it('extracts unique same-domain links from HTML', () => {
    const html = `
      <div>
        <a href="/th/printers/580">HP 580</a>
        <a href="/th/printers/520">HP 520</a>
        <a href="https://external.com/ad">External</a>
        <a href="/image.jpg">Image</a>
      </div>
    `;
    const links = extractLinksFromHtml(html, 'https://www.hp.com/th-th');
    expect(links.some((l) => l.url.includes('/th/printers/580'))).toBe(true);
    expect(links.some((l) => l.url.includes('external.com') && !l.isSameDomain)).toBe(true);
    expect(links.some((l) => l.url.endsWith('.jpg'))).toBe(false); // Ignored extension
  });
});

describe('Web Acquisition: Structured Data & Thai Currency Extraction', () => {
  it('extracts Schema.org JSON-LD Product, Offer, and AggregateRating', () => {
    const html = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": "HP Smart Tank 580 All-in-One Printer",
        "brand": { "@type": "Brand", "name": "HP" },
        "sku": "HP-ST-580",
        "offers": {
          "@type": "Offer",
          "price": "5590",
          "priceCurrency": "THB",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "320"
        }
      }
      </script>
    `;

    const jsonLd = extractJsonLd(html);
    expect(jsonLd.products).toHaveLength(1);
    const prod = jsonLd.products[0];
    expect(prod.name).toBe('HP Smart Tank 580 All-in-One Printer');
    expect(prod.brand).toBe('HP');
    expect(prod.price).toBe(5590);
    expect(prod.priceCurrency).toBe('THB');
    expect(prod.ratingValue).toBe(4.8);
    expect(prod.reviewCount).toBe(320);
  });

  it('parses Thai currency representations accurately into numeric THB', () => {
    expect(extractPriceFromText('ราคาพิเศษ ฿5,590 ปกติ ฿6,290').price_current_thb).toBe(5590);
    expect(extractPriceFromText('ราคาพิเศษ ฿5,590 ปกติ ฿6,290').price_original_thb).toBe(6290);
    expect(extractPriceFromText('ราคาพิเศษ ฿5,590 ปกติ ฿6,290').discount_pct).toBe(11);

    expect(extractPriceFromText('เครื่องพิมพ์ราคา 4,490 บาท').price_current_thb).toBe(4490);
    expect(extractPriceFromText('ลดเหลือ 5,990.-').price_current_thb).toBe(5990);
    expect(extractPriceFromText('Sale 4990 THB').price_current_thb).toBe(4990);
  });

  it('extracts ratings and cumulative sold traction text', () => {
    const proof = extractSocialProof('Rating 4.9 ดาว (450 รีวิว) ขายแล้ว 2.5k ชิ้น');
    expect(proof.rating).toBe(4.9);
    expect(proof.review_count).toBe(450);
    expect(proof.sold_count).toContain('2.5k');
  });

  it('detects block pages and JavaScript-rendered shells', () => {
    const blockHtml = '<html><head><title>403 Forbidden</title></head><body>Access Denied. Cloudflare Ray ID: 12345</body></html>';
    const inspectBlock = inspectHtml(blockHtml);
    expect(inspectBlock.isBlocked).toBe(true);

    const jsShellHtml = '<html><head><title>App</title><script src="app.js"></script></head><body><div id="root">You need to enable JavaScript to run this app.</div></body></html>';
    const inspectJs = inspectHtml(jsShellHtml);
    expect(inspectJs.isJsRequired).toBe(true);
  });
});

describe('Web Acquisition: Strategy Routing & Ingestion Pipeline Integration', () => {
  beforeEach(() => {
    globalEvidenceStore.clear();
  });

  it('routes marketplace domains to Bright Data and brand sites to Direct HTTP', () => {
    const shopeeRoute = routeAcquisitionStrategy('https://shopee.co.th/product/123/456');
    expect(shopeeRoute.strategy).toBe('BRIGHTDATA_UNLOCKER');

    const hpRoute = routeAcquisitionStrategy('https://www.hp.com/th-th/printers');
    expect(hpRoute.strategy).toBe('DIRECT_HTTP');
  });

  it('acquires custom HTML page, filters contamination, resolves SKU, and inserts into Evidence Lake', async () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>HP Smart Tank 580 Wireless All-in-One Printer</title>
          <meta property="og:title" content="HP Smart Tank 580 Wireless All-in-One Printer" />
          <meta property="og:description" content="พิมพ์เยอะ จุใจ ประหยัดสุดคุ้มด้วย HP Smart Tank 580" />
        </head>
        <body>
          <h1>HP Smart Tank 580 Wireless All-in-One Printer</h1>
          <div class="price">฿5,590</div>
          <div class="rating">4.8 / 5 (340 รีวิว) ขายแล้ว 1.5k ชิ้น</div>
        </body>
      </html>
    `;

    const acq = await acquisitionService.acquireUrl('https://www.advice.co.th/product/hp-smart-tank-580', {
      customHtml: mockHtml,
    });

    expect(acq.status).toBe('SUCCESS');
    expect(acq.title).toContain('HP Smart Tank 580');

    // Ingest into Evidence Lake via GenericWebAdapter
    const obs = genericWebAdapter.ingestAcquisition(acq);
    expect(obs.accepted).toBe(1);
    expect(obs.rejected).toBe(0);
    expect(globalEvidenceStore.getCount()).toBe(1);

    // Verify record in store
    const stored = globalEvidenceStore.getAll()[0];
    expect(stored.brand).toBe('HP');
    expect(stored.product_sku).toBe('Smart Tank 580');
    expect(stored.price_current_thb).toBe(5590);
    expect(stored.displayed_sales).toContain('1.5k');
  });

  it('rejects standalone ink refill bottles at the contamination gate', async () => {
    const bottleHtml = `
      <html>
        <body>
          <h1>หมึกแท้ HP GT53 Black Ink Bottle for Smart Tank</h1>
          <div>฿350</div>
        </body>
      </html>
    `;

    const acq = await acquisitionService.acquireUrl('https://www.advice.co.th/product/hp-gt53-ink', {
      customHtml: bottleHtml,
    });

    const obs = genericWebAdapter.ingestAcquisition(acq);
    expect(obs.accepted).toBe(0);
    expect(obs.rejected).toBe(1);
    expect(globalEvidenceStore.getCount()).toBe(0);
  });
});

describe('Web Acquisition: Crawl Session Store & Diagnostics', () => {
  beforeEach(() => {
    globalEvidenceStore.clear();
    globalCrawlSessionStore.clear();
  });

  it('executes crawl session with budget limits and records session report', async () => {
    const mockHtml1 = `
      <html>
        <head><title>HP Smart Tank 580 Printer</title></head>
        <body>
          <h1>HP Smart Tank 580 All-in-One Printer</h1>
          <div>฿5,590</div>
          <a href="https://www.hp.com/th-th/printers/smart-tank-520">HP 520</a>
        </body>
      </html>
    `;

    const mockHtml2 = `
      <html>
        <head><title>HP Smart Tank 520 Printer</title></head>
        <body>
          <h1>HP Smart Tank 520 All-in-One Printer</h1>
          <div>฿4,490</div>
        </body>
      </html>
    `;

    const session = await globalCrawlSessionStore.runCrawl({
      seedUrls: ['https://www.hp.com/th-th/printers/smart-tank-580'],
      maxPages: 2,
      customHtmlMap: {
        'https://www.hp.com/th-th/printers/smart-tank-580': mockHtml1,
        'https://www.hp.com/th-th/printers/smart-tank-520': mockHtml2,
      },
    });

    expect(session.crawl_id).toMatch(/^CRAWL-/);
    expect(session.status).toBe('SUCCESS');
    expect(session.evidence_created).toBeGreaterThanOrEqual(1);

    const history = globalCrawlSessionStore.getRecentSessions(1);
    expect(history).toHaveLength(1);
    expect(history[0].crawl_id).toBe(session.crawl_id);
  });

  it('runs domain diagnostics on a target URL safely', async () => {
    const unsafeDiag = await runDomainDiagnostics('http://127.0.0.1/admin');
    expect(unsafeDiag.is_safe).toBe(false);
    expect(unsafeDiag.is_blocked).toBe(true);
    expect(unsafeDiag.crawlability_status).toBe('BLOCKED');

    const mockProbe = {
      success: true,
      httpStatus: 200,
      finalUrl: 'https://www.hp.com/th-th/printers/smart-tank-580',
      redirectChain: ['https://www.hp.com/th-th/printers/smart-tank-580'],
      html: '<html><head><title>HP Smart Tank</title></head><body><h1>HP Smart Tank 580</h1><div>฿5,590</div></body></html>',
      contentType: 'text/html',
      durationMs: 25,
      contentHash: 'abc123hash',
    };

    const diag = await runDomainDiagnostics('https://www.hp.com/th-th/printers/smart-tank-580', { mockProbe });
    expect(diag.domain).toBe('hp.com');
    expect(diag.is_safe).toBe(true);
    expect(diag.crawlability_status).toBe('EASY');
    expect(diag.recommended_strategy).toBe('DIRECT_HTTP');
  });
});
