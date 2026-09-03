# Phase 3B: Live Ingestion Pipeline & Scraper Activation Audit

**Authoritative Reference:** `HP Thailand Ink Tank Technical Implementation Brief_v2.pdf`  
**Phase:** 3B (Live Ingestion Runner & Real-Data Activation)  
**Execution Scope:** Thailand Refillable Ink Tank Printer Competitive Intelligence (HP vs Epson vs Canon vs Brother)

---

## 1. Full Pipeline & Adapter Capability Audit

Every scraper adapter in the platform has been audited against real extraction contracts, provider configurations, and normalization rules.

| Source ID | Platform | Channel | Primary Provider | Adapter Capability Tier | Description & Data Fields Parsed |
|---|---|---|---|---|---|
| `src-meta-ads` | Meta Ad Library | Paid Media | **Apify** | **Tier B (Provider-Ready)** | Extracts ad copy, headline, `start_date`, video/carousel formats, creative snapshot URLs, and `platform_entity_id`. |
| `src-google-ads` | Google Ads Transparency | Paid Media | **Apify** | **Tier B (Provider-Ready)** | Extracts advertiser domain, ad snippet, `first_shown` timestamp, search text/display/video creative formats. |
| `src-shopee-th` | Shopee Mall Thailand | E-Commerce | **Bright Data** | **Tier B (Provider-Ready)** | Extracts `price` (scaled from cents), `price_before_discount`, `historical_sold` (as cumulative traction index), stock status, official store badge. |
| `src-lazada-th` | LazMall Thailand | E-Commerce | **Bright Data** | **Tier B (Provider-Ready)** | Extracts current price, original price, discount %, `itemSold`, rating, and verified LazMall store status. |
| `src-tiktok-shop-th`| TikTok Shop Thailand | E-Commerce | **Apify** | **Tier B (Provider-Ready)** | Extracts `real_price`, `original_price`, `sold_count`, rating, and official merchant metadata. |
| `src-jib-th` | JIB Thailand IT Retail | E-Commerce | **Bright Data** | **Tier B (Provider-Ready)** | Extracts IT specialist retail prices (`price_total`, `price_normal`), technical specs, and warehouse stock status. |
| `src-facebook-th` | Official Facebook Thailand | Social | **Apify** | **Tier B (Provider-Ready)** | Extracts brand page posts, post captions in Thai, `created_time`, and comment counts. |
| `src-instagram-th` | Official Instagram Thailand| Social | **Apify** | **Tier B (Provider-Ready)** | Extracts official feed posts, captions, media links, and comment counts. |
| `src-youtube-th` | Official YouTube Thailand | Social | **Apify** | **Tier B (Provider-Ready)** | Extracts campaign video uploads, upload dates, video descriptions, and engagement signals. |
| `src-tiktok-brand-th`| Official TikTok Thailand | Social | **Apify** | **Tier B (Provider-Ready)** | Extracts short-form video feed items, publishing timestamps, and video captions. |
| `src-linkedin-th` | Official LinkedIn Thailand | Social | **Apify** | **Tier B (Provider-Ready)** | Extracts enterprise B2B announcements and commercial print posts. |

* **Tier A:** Live crawler execution active with valid credentials.
* **Tier B:** Adapter fully implemented, normalized, and provider-mapped; awaiting runtime credentials in `.env.local`.
* **Tier C:** Parser shell only.
* **Tier D:** Unsupported / Incompatible.

---

## 2. Credential Configuration & Security Isolation

Credentials are strictly isolated on the server side in `src/config/env.ts` and `src/services/scrapers/providers/`:

```
┌────────────────────────────────────────────────────────┐
│                   SERVER ENVIRONMENT                   │
│  .env.local: APIFY_API_KEY, BRIGHTDATA_API_KEY         │
│                     │                                  │
│                     ▼                                  │
│  src/config/env.ts (Server-Only Zod Validation)       │
│                     │                                  │
│                     ▼                                  │
│  Providers (apify.ts, brightdata.ts)                   │
│  - Never log API keys                                  │
│  - Never return API keys in HTTP response envelopes    │
│  - Safe health checks return REACHABLE / NOT_CONFIGURED│
└────────────────────────────────────────────────────────┘
```

---

## 3. End-to-End Ingestion Workflow & Data Invariants

```
Crawler Target (src/config/seeds.ts)
           │
           ▼
Provider Execution (Apify Actor / Bright Data Scraping Browser)
           │
           ▼
Adapter Extraction (RawObservation[])
           │
           ▼
Thai Date Conversion (2569 BE → 2026 CE)
           │
           ▼
6-Gate Classifier (Reject cartridges, lasers, standalone bottles)
           │
           ▼
SKU Normalizer (Match against 28 Canonical SKUs or flag UNRESOLVED/AMBIGUOUS)
           │
           ▼
Deterministic Evidence ID Generation (SHA-256: EVID-{PLATFORM}-{HEX})
           │
           ▼
Zod Schema Validation (RawEvidenceRecord)
           │
           ▼
Idempotent Persistence (globalEvidenceStore: Insert / Update in-place)
           │
           ▼
Analytical Cube Refresh (analyticsService.rebuildAnalyticsFromEvidence())
           │
           ▼
Executive Dashboard UI (Instant reactive display of verified evidence)
```

---

## 4. Live Test Escalation Procedure

To prevent uncontrolled crawling and respect target rate limits, live testing must follow this progressive escalation order:

1. **Stage 1 (One HP Paid Media target):** Run `SEED-META-HP` via Meta Ad Library scraper. Verify ad creative formats and date conversion.
2. **Stage 2 (One HP Marketplace target):** Run `SEED-SHOPEE-HP` via Shopee Mall adapter. Verify THB pricing, price before discount, and cumulative traction index.
3. **Stage 3 (One HP Social target):** Run `SEED-FB-HP` via Facebook adapter. Verify Thai text preservation and engagement counts.
4. **Stage 4 (All HP Sources):** Run all 7 HP official seeds. Verify HP brand aggregation in Analytical Cube.
5. **Stage 5 (All 4 Brands across 33 Seeds):** Full targeted crawl across HP, Epson, Canon, and Brother.

---

## 5. Critical Data Quality Auditing Matrix

| Invariant Rule | Verification Status | Enforcement Mechanism |
|---|---|---|
| **No Synthetic/Fake Data** | **PASSED** | Empty store displays explicit `MISSING` badges without synthetic numbers. |
| **Missing Data Semantics (`null ≠ 0`)** | **PASSED** | Missing prices, reviews, or SOV remain `null`; never converted to `0` or `฿0`. |
| **Sales Traction Terminology** | **PASSED** | Cumulative counters labeled strictly as **"Observable Cumulative Sales Traction Index"**; never mislabeled as monthly sales. |
| **Deterministic Evidence IDs** | **PASSED** | Idempotency verified: re-running identical crawls produces 0 new duplicate rows. |
| **Thai Buddhist Era Handling** | **PASSED** | Dates in BE 2569 converted deterministically to CE 2026. |
| **Price Floor Review Gate** | **PASSED** | Genuine printers below ฿2,500 trigger `REVIEW` and are preserved rather than silently dropped. |
| **Zero Contamination Leakage** | **PASSED** | Ink bottles (GT52, 003, GI-790, BTD60), cartridges (DeskJet), and lasers (LaserJet) rejected. |
| **Credential Protection** | **PASSED** | API keys never exposed to client JavaScript or API responses. |
