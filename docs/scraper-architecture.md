# Scraper Ingestion Architecture

**Phase:** 2B (Evidence Ingestion & Scraper Pipeline Contracts)  
**Authoritative Brief Reference:** `HP Thailand Ink Tank Technical Implementation Brief_v2.pdf` (Sections 3, 5, 6, 7, 10)  

---

## 1. High-Level Architecture Overview

The scraping and evidence ingestion layer is built as a provider-independent, deterministic, typed pipeline.

```
┌─────────────────────────┐
│     TARGET REGISTRY     │  (CRAWL_SEEDS: Seed URLs, Brands, Thailand Scope)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   SCRAPER PROVIDER      │  (Apify Actor / Bright Data Scraping Browser)
└────────────┬────────────┘
             │ Raw JSON Payload
             ▼
┌─────────────────────────┐
│   SOURCE ADAPTER        │  (Meta Ads, Google Ads, Shopee, Lazada, TikTok, JIB, Social)
└────────────┬────────────┘
             │ RawObservation[]
             ▼
┌─────────────────────────┐
│ 6-GATE CATEGORY ENGINE  │  (classifyPrinterItem: Rejects Cartridges/Lasers/Bottles)
└────────────┬────────────┘
             │ Accepted / Review
             ▼
┌─────────────────────────┐
│  DETERMINISTIC SKU MAP  │  (resolveSku: Canonical 28-SKU Master Registry)
└────────────┬────────────┘
             │ Canonical Model Assigned
             ▼
┌─────────────────────────┐
│  DETERMINISTIC HASHING  │  (generateDeterministicEvidenceId: EVID-{PLATFORM}-{SHA256})
└────────────┬────────────┘
             │ RawEvidenceRecord
             ▼
┌─────────────────────────┐
│  ZOD SCHEMA VALIDATOR   │  (validateEvidenceRecord: Type Safety & Integrity)
└────────────┬────────────┘
             │ Validated Record
             ▼
┌─────────────────────────┐
│ IDEMPOTENT EVIDENCE LAKE│  (EvidenceStore: Deduplication & Query Interfaces)
└─────────────────────────┘
```

---

## 2. Provider Abstraction (Apify vs. Bright Data)

The architecture isolates scraper infrastructure vendors behind the unified `ScraperProvider` interface:

* **Apify (`src/services/scrapers/providers/apify.ts`):** Orchestrates Meta Ad Library actors, Google Ads transparency scrapers, and official brand social feeds.
* **Bright Data (`src/services/scrapers/providers/brightdata.ts`):** Manages Scraping Browser and Web Unlocker sessions with residential Thai IP proxies to navigate marketplace anti-bot protections (Shopee, Lazada, JIB).
* **Direct Seed Mode:** Facilitates zero-mock, offline unit testing using verified JSON structures.

---

## 3. Targeted Crawling vs. Whole-Platform Crawling

In strict accordance with Brief Section 3, generic whole-platform crawling is explicitly prevented:
* All crawl runs require an explicit `CrawlTarget` defined in [src/config/seeds.ts](file:///Users/priteshhome/InkTank-analysis%20/src/config/seeds.ts).
* Targets specify the brand, seed URL, query term, Thailand country scope, and locale (`th-TH`).

---

## 4. Evidence Identity & Idempotency

* **Identity Generator:**
  $$\text{evidence\_id} = \text{EVID-}\{\text{PLATFORM}\}\text{-}\{\text{SHA256}(\text{platform} + \text{sourceUrl} + \text{publishedAt} + \text{platformEntityId})[0..12]\}$$
* **Idempotency Guarantee:** Re-running the pipeline on identical raw payloads updates the existing record in-place without creating duplicate entries in the Evidence Store.

---

## 5. What Is Deliberately Not Implemented in Phase 2B

* **No Synthetic Data:** Zero fake prices, fake ad counts, or fake reviews were created.
* **Live Scraper Invocation Without Credentials:** Scrapers will execute live network fetches once valid `APIFY_API_KEY` and `BRIGHTDATA_API_KEY` credentials are provided in `.env.local`.
