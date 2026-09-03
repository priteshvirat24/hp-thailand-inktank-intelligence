# Specification Reconciliation Report

**Authoritative Source of Truth:** `HP Thailand Ink Tank Technical Implementation Brief_v2.pdf` (9 Pages)  
**Client / Lead Stakeholder:** David Chiu  
**Document Purpose:** Machine-oriented specification reconciliation comparing the authoritative brief against the initial codebase foundation.

---

## 1. Authoritative Scope

| Dimension | Brief Specification (Ground Truth) | Current Implementation | Status |
| :--- | :--- | :--- | :--- |
| **Project Title** | HP Ink Tank Competitive Intelligence | Defined in `PROJECT_METADATA.name` | **ALIGNED** |
| **Geography** | **Thailand only** (`country: TH`, `locale: th-TH`, `currency: THB`) | Enforced in `PROJECT_METADATA.geography` | **ALIGNED** |
| **Category Definition** | **Ink Tank printers only** — inkjet printers using refillable ink tanks/reservoirs rather than cartridge replacement. | Enforced in `src/services/classification/classifier.ts` | **ALIGNED** |
| **Target Brands** | Exactly 4: **HP, Epson, Canon, Brother** | Enforced in `TARGET_BRANDS` (`src/config/brands.ts`) | **ALIGNED** |
| **Target Audiences** | 1. Consumers (Home / Personal)<br>2. Small Businesses (SMB <100 employees) | Encoded in `TargetSegment` (`src/types/brands.ts`) | **ALIGNED** |
| **Analysis Window** | **28 May 2026 to 28 August 2026** (~90 days) | Enforced in `DATE_CONFIG` (`src/config/dates.ts`) | **ALIGNED** |
| **Primary Analytical Months** | **June 2026 (`2026-06`), July 2026 (`2026-07`), August 2026 (`2026-08`)** (Late May rolls into June baseline) | Enforced in `DATE_CONFIG.ANALYTICAL_MONTHS` | **ALIGNED** |
| **Currency** | **Thai Baht (`THB` / `฿`)** | Formatted via `src/lib/utils.ts` | **ALIGNED** |
| **Output Language** | **English only** (Original Thai content preserved as source evidence) | Dual fields in `RawEvidenceRecord` | **ALIGNED** |
| **Hosting & Delivery** | **Vercel-hosted POC web app with password protection** | Configured in Next.js + security verifier | **ALIGNED** |

---

## 2. Required Data Sources

| Source / Platform | Channel | Required Data Fields (Per Brief) | Historical Date Window | Geography | Expected Extraction Tooling | Brief Priority Tier | Implementation Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Meta Ad Library** | Paid Media | Ad creatives, creative format (video/static/carousel), headline/hook, key message, CTA, offers/promotions, product/SKU, campaign dates, target domain | 28 May – 28 Aug 2026 | Thailand | Apify Meta Ad Library Actor / Graph API | **Mandatory** (Section 5) | **Tier 1 (Core)** |
| **Google Ads Transparency Center** | Paid Media | Search/Display/Video ad creatives, messaging, offers/promotions, advertiser ID, first/last shown dates, format | 28 May – 28 Aug 2026 | Thailand | Apify Google Ads Scraper / Bright Data | **Mandatory** (Section 5) | **Tier 1 (Core)** |
| **YouTube** | Paid Media / Social | Video advertising approaches, official brand channel uploads, video hooks, views, engagement | 28 May – 28 Aug 2026 | Thailand | Apify YouTube Scraper / YouTube Data API | **Mandatory** (Sections 5 & 6) | **Tier 1 (Core)** |
| **Official Brand Facebook** | Social | Official brand posts, post type, content/theme, key message, reach, engagement (likes, comments, shares), promotional content, post URL | 28 May – 28 Aug 2026 | Thailand | Apify Facebook Post Scraper | **Mandatory** (Section 6) | **Tier 1 (Core)** |
| **Official Brand Instagram** | Social | Lifestyle hooks, student/home positioning, image/reel asset, caption, post date, engagement | 28 May – 28 Aug 2026 | Thailand | Apify Instagram Scraper | **Mandatory** (Section 6) | **Tier 1 (Core)** |
| **Official Brand TikTok** | Social | Short-form campaign videos, creator demonstrations, sound, likes, comments, shares, video URL | 28 May – 28 Aug 2026 | Thailand | Apify TikTok Scraper | **Secondary** (Section 6) | **Tier 2 (Secondary)** |
| **Official Brand LinkedIn** | Social | SMB positioning, B2B announcements, reactions, post date | 28 May – 28 Aug 2026 | Thailand | Apify LinkedIn Scraper | **Secondary** (Section 6) | **Tier 3 (Optional)** |
| **Shopee Thailand** | E-commerce | SKU, title, current price (THB), original/RRP price, discount %, promo/voucher, seller, official store badge, stock, units sold, rating, review count, freebies, URL | 28 May – 28 Aug 2026 (Observable) | Thailand (`shopee.co.th`) | Bright Data Scraping Browser / Shopee Actor | **Priority 1 E-com** (Section 7) | **Tier 1 (Core)** |
| **Lazada Thailand** | E-commerce | LazMall flagship listings, current & original price, discount %, voucher push, reviews, units sold, product claims, URL | 28 May – 28 Aug 2026 (Observable) | Thailand (`lazada.co.th`) | Bright Data Scraping Browser / Lazada Actor | **Priority 2 E-com** (Section 7) | **Tier 1 (Core)** |
| **TikTok Shop Thailand** | E-commerce | Social-commerce creator pricing, flash sales, promo vouchers, live selling indicators, product URL | 28 May – 28 Aug 2026 | Thailand | Apify TikTok Shop Scraper | **Priority 3 E-com** (Section 7) | **Tier 1 (Core)** |
| **JIB Thailand** | E-commerce | Specialist IT retailer pricing, stock availability, cash/promo discounts, warranty terms, bundles/free ink, product URL | 28 May – 28 Aug 2026 | Thailand (`jib.co.th`) | Direct HTTP / Playwright targeted scraping | **Priority 4 E-com** (Section 7) | **Tier 1 (Core)** |
| **Advice Thailand** | E-commerce | Secondary IT distributor pricing, student discounts, warranty specs, product URL | 28 May – 28 Aug 2026 | Thailand (`advice.co.th`) | Direct HTTP / DOM extraction | **Secondary E-com** (Section 7) | **Tier 2 (Secondary)** |
| **Power Buy Thailand** | E-commerce | Department retail chain pricing, store pickup availability, promotional tags, product URL | 28 May – 28 Aug 2026 | Thailand (`powerbuy.co.th`) | Direct HTTP / DOM extraction | **Secondary E-com** (Section 7) | **Tier 2 (Secondary)** |
| **Consumer Discussion Forums** | Consumer Review | Forum reviews/posts (e.g. Pantip.com), user sentiment, recurring complaints/praise, discussion threads | 28 May – 28 Aug 2026 | Thailand | Web Scraper | **Low Priority / Drop** (Section 9, Cut 5) | **Tier 3 (Drop for POC)** |

---

## 3. Exact SKU Requirements

### 3.1 Direct Mentions in Brief
The brief explicitly references the following canonical models and series:
* **HP:** `Smart Tank 580` (Sections 10.1, 10.2, 10.3), `Smart Tank series`, `Ink Tank series`.
* **Epson:** `EcoTank L3250` (Sections 10.1, 10.2, 10.3), `EcoTank series`, `Ink Tank series`.
* **Canon:** `PIXMA G3730` (Sections 10.1, 10.2, 10.3), `Canon MegaTank`, `Canon PIXMA G-series`.
* **Brother:** `DCP-T520W` (Sections 10.1, 10.2, 10.3), `Brother InkBenefit`, `Brother Refill Tank`, `Brother DCP-T series`.

### 3.2 Canonical Catalog Mapping (`src/config/brands.ts`)
To support accurate multi-SKU comparisons across price tiers (Home vs. SMB), the catalog encodes 28 verified models spanning all 4 families:

| Brand | Primary Family | Canonical Core SKUs |
| :--- | :--- | :--- |
| **HP** | *Smart Tank* | `Smart Tank 580`, `Smart Tank 515`, `Smart Tank 670`, `Smart Tank 720`, `Smart Tank 750`, `Smart Tank 315`, `Smart Tank 415` |
| **Epson** | *EcoTank* | `EcoTank L3210`, `EcoTank L3250`, `EcoTank L3256`, `EcoTank L4260`, `EcoTank L5290`, `EcoTank L6270`, `EcoTank L15150` |
| **Canon** | *MegaTank* | `PIXMA G1010`, `PIXMA G2010`, `PIXMA G2020`, `PIXMA G3010`, `PIXMA G3020`, `PIXMA G3730`, `PIXMA G4010`, `PIXMA G7070` |
| **Brother**| *InkBenefit / Refill Tank* | `DCP-T220`, `DCP-T420W`, `DCP-T520W`, `DCP-T720DW`, `DCP-T820DW`, `MFC-T920DW` |

---

## 4. Exact Keyword Requirements

### 4.1 Positive Keyword Dictionaries (Brief Section 8)

| Brand | Authoritative English Keywords | Authoritative Thai Equivalent Keywords |
| :--- | :--- | :--- |
| **HP** | `HP Smart Tank`, `HP Ink Tank`, `HP Smart Tank Printer`, `HP Ink Tank Printer`, `HP Smart Tank all-in-one`, `refillable ink printer` | `HP Smart Tank`, `HP แท็งก์หมึก`, `HP แทงค์หมึก`, `HP เครื่องพิมพ์แท็งก์หมึก`, `HP ปริ้นเตอร์เติมหมึก`, `HP เครื่องพิมพ์เติมหมึก` |
| **Epson** | `Epson EcoTank`, `Epson Ink Tank`, `Epson EcoTank Printer`, `Epson Ink Tank Printer`, `Epson EcoTank all-in-one`, `refillable ink printer` | `Epson EcoTank`, `Epson แท็งก์หมึก`, `Epson แทงค์หมึก`, `Epson เครื่องพิมพ์แท็งก์หมึก`, `Epson ปริ้นเตอร์เติมหมึก`, `Epson เครื่องพิมพ์เติมหมึก` |
| **Canon** | `Canon MegaTank`, `Canon Ink Tank`, `Canon MegaTank Printer`, `Canon Ink Tank Printer`, `Canon PIXMA G`, `Canon PIXMA G-series`, `refillable ink printer` | `Canon MegaTank`, `Canon แท็งก์หมึก`, `Canon แทงค์หมึก`, `Canon เครื่องพิมพ์แท็งก์หมึก`, `Canon PIXMA G`, `Canon ปริ้นเตอร์เติมหมึก`, `Canon เครื่องพิมพ์เติมหมึก` |
| **Brother** | `Brother Ink Tank`, `Brother Ink Tank Printer`, `Brother Refill Tank`, `Brother InkBenefit`, `Brother InkBenefit Printer`, `Brother DCP-T series` | `Brother Ink Tank`, `Brother แท็งก์หมึก`, `Brother แทงค์หมึก`, `Brother เครื่องพิมพ์แท็งก์หมึก`, `Brother เครื่องพิมพ์เติมหมึก`, `Brother InkBenefit` |

### 4.2 Exclusion & Negative Lexicon (Brief Category Rule)
* **Cartridge Inkjet:** `DeskJet`, `Envy`, `PIXMA TS`, `PIXMA MG`, `PIXMA E`, `Expression Home`, `หมึกตลับ`, `ตลับหมึก`, `เดสก์เจ็ท`.
* **Laser / Toner:** `LaserJet`, `Laser 107`, `imageCLASS`, `i-SENSYS`, `HL-L`, `DCP-L`, `MFC-L`, `Laser Printer`, `toner`, `ผงหมึก`, `โทนเนอร์`, `เลเซอร์`.
* **Standalone Consumables Alone:** `ink bottle`, `refill ink`, `bottle only`, `003`, `664`, `GT52`, `GT53`, `GI-790`, `GI-71`, `BTD60`, `BT5000`, `เฉพาะขวดหมึก`, `หมึกเติมขวด`, `น้ำหมึกเติม`.
* **Accessories & Parts:** `printhead`, `maintenance box`, `roller`, `cable`, `photo paper`, `sublimation`, `ribbon`, `หัวพิมพ์`, `กล่องซับหมึก`, `กระดาษโฟโต้`.

---

## 5. Exact Data Cuts

| Cut # | Data Cut Name | Scope & Dimensions | Priority Classification |
| :--- | :--- | :--- | :--- |
| **Cut 1** | **Online Visibility / SOV (Share of Voice)** | Number of ads, unique creatives, social posts, engagement (likes, comments, shares, views), e-commerce listings/SKUs, sellers, official listings, units sold indicators. Aggregated by `Brand × Month × Channel × Platform`. | **Must-Have (Core)** |
| **Cut 2** | **Advertising / Creatives** | Platform, date, product/SKU, creative format (video/static/carousel), headline/hook, key message, CTA, product claims/benefits, promotion, target audience. `1 row = 1 ad/creative with URL`. | **Must-Have (Core)** |
| **Cut 3** | **Social Media Activity** | Post date, platform, product/SKU, post type, content/theme, key message, reach, engagement (likes, comments, shares, views), promotional content, post URL. Aggregated by `Brand × Month × Platform × Theme`. | **Must-Have (Core)** |
| **Cut 4** | **E-Commerce Presence, Pricing, Promos & Traction** | SKU-level commercial signals: brand, model/SKU, product title, platform, seller status, current & original price, discount %, stock, ratings, review count, bestseller badge, delivery offers, promotions/freebies (free ink, warranty, vouchers, 0% installment), units sold. Aggregated by `Brand × Month × Platform × SKU`. | **Must-Have (Core)** |
| **Cut 5** | **Consumer Sentiment / Recommendation** | Positive/neutral/negative sentiment, recommendation signals, 8 recurring consumer themes (print quality, running cost, ink yield, refill experience, reliability, speed, connectivity, ease of use, value, setup, price). Capture Thai text, English summary, URL. | **Useful (Drop forum scraping; rely on e-commerce verified reviews)** |

---

## 6. Exact Metrics & Mathematical Formulations

| Metric Name | Mathematical Formula / Calculation | Required Source Fields | Granularity / Grain | Nature | Traceability Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Unique Active Ads** | $\text{Count}(\text{Distinct Ad IDs})_{\text{Brand}, \text{Month}}$ | `ad_id`, `platform`, `published_at`, `brand` | `Brand × Month × Platform` | Directly Observed | Array of Ad Library `evidence_id`s |
| **Total Social Posts** | $\text{Count}(\text{Distinct Post IDs})_{\text{Brand}, \text{Month}}$ | `platform_entity_id`, `source_url`, `brand` | `Brand × Month × Platform` | Directly Observed | Array of Social Post `evidence_id`s |
| **Total Social Engagement** | $\sum (\text{Likes} + \text{Comments} + \text{Shares} + \text{Views})$ | `engagement_counters`, `platform` | `Brand × Month × Platform` | Directly Observed | Linked Post Records |
| **Average Selling Price (THB)** | $\frac{1}{N} \sum_{i=1}^N \text{Price}_{\text{Current}, i}$ | `price_current_thb`, `brand`, `sku` | `Brand × Month × SKU` | Derived Metric | Array of verified Listing `evidence_id`s |
| **Median Selling Price (THB)** | $\text{Median}(\text{Price}_{\text{Current}, 1..N})$ | `price_current_thb`, `sku` | `Brand × Month × SKU` | Derived Metric | Array of verified Listing `evidence_id`s |
| **Average Discount %** | $\frac{1}{N} \sum_{i=1}^N \left( \frac{\text{RRP}_i - \text{Price}_i}{\text{RRP}_i} \times 100 \right)$ | `price_current_thb`, `price_original_thb` | `Brand × Month × SKU` | Derived Metric | Listing Evidence Records |
| **Active Sellers Count** | $\text{Count}(\text{Distinct Seller Names})_{\text{Brand}, \text{SKU}}$ | `seller_name`, `product_sku` | `Brand × Month × SKU` | Directly Observed | Verified Merchant Records |
| **Share of Voice %** | $\left( \frac{\text{Touchpoints}_{\text{Brand}, \text{Channel}}}{\sum \text{Touchpoints}_{\text{Channel}}} \right) \times 100$ | Active ads count, post count, listing count | `Brand × Month × Channel` | Derived Metric | Multi-channel Evidence Records |
| **Net Consumer Sentiment Score** | $\left( \frac{\text{Positive Mentions} - \text{Negative Mentions}}{\text{Total Mentions}} \right) \times 100$ | `sentiment_polarity`, `product_sku` | `Brand × Month × Theme` | Derived Metric | Verified Customer Review Records |
| **Promo Frequency / Penetration %**| $\left( \frac{\text{Listings with Active Promos}}{\text{Total Verified Listings}} \right) \times 100$ | `promotional_tags`, `product_sku` | `Brand × Month × SKU` | Derived Metric | Promo Banner / Badge Records |

---

## 7. Exact RAG Requirements

```
                                    [User Natural Language Question]
                                                   │
                                                   ▼
                       ┌────────────────────────────────────────────────────────┐
                       │               DYNAMIC REASONING PIPELINE               │
                       │ 1. Intent Extraction: Brand, Month, SKU, Theme         │
                       │ 2. Hybrid Retrieval: Analytical Cube + Evidence Lake   │
                       │ 3. Dynamic Synthesis: Compute SWOT/Signals on the fly  │
                       │    (NO static pre-compiled SWOT dataset)               │
                       └───────────────────────────┬────────────────────────────┘
                                                   │
                                                   ▼
                       ┌────────────────────────────────────────────────────────┐
                       │              MANDATORY 4-PART RESPONSE                 │
                       │ 1. Direct Answer Summary                               │
                       │ 2. Evidence & Supporting Metrics                       │
                       │ 3. Strategic Implication for HP                        │
                       │ 4. Verified Source Citations ([EVID-...])              │
                       │ + Optional Structured Chart Payload (JSON)             │
                       └────────────────────────────────────────────────────────┘
```

1. **Required Core Query Capabilities (Brief Section 11):**
   * *Competitive:* HP vs. Epson vs. Canon vs. Brother comparisons.
   * *Visibility:* Most visible brands/products and 3-month changes.
   * *Marketing/Messaging:* Competitor positioning hooks and claims vs. HP.
   * *Promotions:* Heavily pushed products and promotional tactics.
   * *Pricing:* Price spread across platforms, brands, and SKUs in THB.
   * *Product Push:* Strongest overall promoted SKUs.
   * *Consumer Response:* Top positive and negative themes.
   * *Emerging Signals:* Dynamic competitor threats and HP opportunities.
   * *Trends / Changes:* June vs. July vs. August MoM shifts.
   * *Implications:* Actionable strategic advice for HP leadership.
2. **Anti-Hallucination Guard:** Clearly distinguish observed facts from strategic hypotheses. Rejects queries outside Thailand Ink Tank scope.
3. **Traceable Citations:** Every key insight must link directly to clickable `evidence_id` source badges.

---

## 8. Exact Dashboard Requirements

### Information Hierarchy & Wireframe Layout (Brief Section 12)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER / FILTERS: HP Ink Tank Competitive Intelligence — Thailand | May–Aug 2026 | Brand | Month │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ASK INTELLIGENCE / RAG: Natural-language Q&A Bar + Evidence Answers + Dynamic Charts + Sources   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. EXECUTIVE SUMMARY — WHAT MATTERS? (3–5 Key Insights, Opportunities, Threats, Notable Changes) │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. COMPETITIVE VISIBILITY: Share of Voice (Paid Media vs Social vs E-Commerce) + MoM Trend Chart│
├────────────────────────────────┬─────────────────────────────────────────────────────────────────┤
│ 3. CREATIVE & MESSAGING        │ 4. PROMOTIONS & PRICING                                         │
│ - Themes, Claims, Hooks & Pos. │ - Current/Average Pricing in THB (฿)                            │
│ - Representative Creatives     │ - Discounts %, Vouchers, Bundles & Free Ink                     │
├────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 5. PRODUCT / SKU PUSH          │ 6. CONSUMER SENTIMENT                                           │
│ - Top Promoted Products / SKUs │ - Positive & Negative Themes (Print Quality, Refill, etc.)      │
│ - Observable Traction & Claims │ - Star Ratings, Net Sentiment Score & Review Snippets           │
├────────────────────────────────┴─────────────────────────────────────────────────────────────────┤
│ 7. COMPETITIVE SIGNALS / IMPLICATIONS FOR HP: Dynamic Strengths, Weaknesses, Threats, Opportunities│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 8. EVIDENCE / SOURCES: Searchable Audit Trail Drawer Linking Insights to Source URLs & Thai Text│
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Security & Deployment Requirements

* **Hosting Target:** Vercel (Edge & Node.js Serverless Runtime).
* **Password Protection Gate:** Single shared access passphrase (configured via `DASHBOARD_ACCESS_PASSWORD`).
* **Server-Only Secret Isolation:** Scraper keys (`APIFY_API_KEY`, `BRIGHTDATA_API_KEY`) and LLM keys (`OPENAI_API_KEY`, `GEMINI_API_KEY`) must never be bundled into client-side code (`NEXT_PUBLIC_` forbidden for secrets).
* **Deterministic Lineage:** All data models must maintain immutable evidence IDs linking to canonical URLs.

---

## 10. Conflict Audit & Codebase Reconciliation

| Requirement | Brief Specification (PDF) | Previous Implementation | Status | Required Correction / Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **Evidence Timestamps** | Retain original publication date AND date/time captured (Sections 3, 10.1). | Preliminary scaffold had single `date` field. | **RECONCILED** | Updated to explicit `published_at` and `captured_at` fields in `src/types/evidence.ts`. |
| **Classification Decisions** | Requires robust filtering with explicit validation reasons and price thresholds (Sections 7, 8). | Had binary `is_tank_hardware` boolean. | **RECONCILED** | Implemented 3-way `ACCEPT` / `REJECT` / `REVIEW` contract in `src/services/classification/classifier.ts`. |
| **Price Floor Behavior** | ฿2,500 threshold helps isolate hardware from ink bottles/accessories (Section 7). | Early draft hard-rejected any item $< ฿2,500$. | **RECONCILED** | Price $< ฿2,500$ with positive signals is now routed to `REVIEW` with diagnostic reason rather than silent loss. |
| **Canonical SKU Breadth** | Brief names 4 benchmark SKUs in examples and refers to complete brand series (Sections 8, 10). | Scaffold had 16 models with some hardcoded RRPs. | **RECONCILED** | Expanded to complete 28 canonical SKUs in `src/config/brands.ts`, representing unlisted RRPs as `null`. |
| **Source Priorities** | E-commerce prioritizes Shopee, Lazada, TikTok Shop, JIB; forums are marked low priority / drop. | Sources were scattered across unstructured strings. | **RECONCILED** | Formalized `DATA_SOURCES` in `src/config/sources.ts` with explicit `mandatory`, `secondary`, `dropped` priority tiers. |
| **Temporal Single Source of Truth** | May 28 to Aug 28, 2026 (June, July, August 2026 analytical months). | Date logic was duplicated across constants. | **RECONCILED** | Centralized in `src/config/dates.ts` and `src/lib/dates.ts` with Buddhist Era conversion utilities. |
| **RAG Dynamic Insights** | Mandates: *"Do not create a separate successes/issues dataset. Generate dynamically"* (Section 11). | Interface was stubbed without dynamic rules. | **ALIGNED** | RAG interface and prompts enforce dynamic calculation from underlying evidence. |

---

## 11. Source Prioritization

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               SOURCE PRIORITIZATION TIERS                                        │
├───────────────────────────────┬───────────────────────────────┬──────────────────────────────────┤
│    TIER 1: MANDATORY (CORE)   │      TIER 2: SECONDARY        │      TIER 3: CANDIDATE DROP      │
│  - Meta Ad Library            │  - Official Brand TikTok TH   │  - General Consumer Discussion   │
│  - Google Ads Transparency    │  - Advice Thailand            │    Forums (Pantip.com)           │
│  - Official Brand Facebook TH │  - Power Buy Thailand         │  - Official Brand LinkedIn TH    │
│  - Official Brand Instagram TH│  - YouTube Video Ad Crawler   │  - Unverified 3P Gray Market     │
│  - Official YouTube TH        │                               │    Marketplace Resellers         │
│  - Shopee Thailand (Mall)     │                               │                                  │
│  - Lazada Thailand (LazMall)  │                               │                                  │
│  - TikTok Shop Thailand       │                               │                                  │
│  - JIB Thailand               │                               │                                  │
└───────────────────────────────┴───────────────────────────────┴──────────────────────────────────┘
```

---

## 12. Technical Risk Register

| # | Technical Risk | Root Cause & Complexity | Data Quality Impact | Fallback / Mitigation Strategy | Drop Candidate? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R1** | **Shopee / Lazada Anti-Bot Blocking** | Akamai / Cloudflare bot challenges on marketplace product pages (High). | Incomplete pricing or missing seller discount vouchers. | Use Bright Data Scraping Browser with Thailand residential proxies; target official Mall seeds only. | **No (Core)** |
| **R2** | **Ephemeral Ad Library Media URLs** | Meta CDN video/image links expire after campaign ends (Medium). | Broken image thumbnails in Creative & Messaging view. | Cache creative metadata, headlines, and thumbnail assets locally at capture time. | **No (Core)** |
| **R3** | **Cumulative Sales vs Monthly Units Sold** | E-commerce platforms display lifetime units sold (Medium). | Inability to calculate exact monthly sales volume without daily crawl deltas. | Label metric explicitly as *Observable Cumulative Sales Indicator / Traction Index*. | **No (Mitigated)** |
| **R4** | **Thai Forum Scraping Signal-to-Noise** | Unstructured slang on Pantip.com with poor thread indexing (High). | Heavy NLP parsing overhead with low actionable Ink Tank signal. | **Drop forum scraping** per Brief Section 9 (Cut 5); rely strictly on verified e-commerce reviews on Shopee & Lazada. | **YES (Drop)** |
| **R5** | **Thai Buddhist Era (BE) Date Formats** | Thai sites publishing dates in BE (e.g. 2569 instead of 2026) (Low). | Out-of-window filtering false positives. | Implemented automated conversion (`BE - 543`) in `src/lib/dates.ts`. | **No (Resolved)** |

---

## 13. Non-Negotiable Implementation Contract

Every subsequent development step must strictly obey these non-negotiable rules:

1. **Thailand & Ink Tank Category Isolation:** All crawled and displayed records must originate from Thailand and represent refillable Ink Tank printers. Cartridges, laser printers, and standalone ink bottles must be rejected.
2. **Deterministic Evidence Traceability:** Every analytical metric and RAG insight must maintain an array of deterministic `evidence_id`s linking directly to verified source URLs, publication timestamps, and raw Thai content.
3. **No Fabricated Business Data:** Zero synthetic business observations or mock metrics may be introduced into production data stores. Missing data must be represented as `null`.
4. **Dynamic RAG Reasoning:** Strategic insights (HP strengths, weaknesses, opportunities, threats) must be generated dynamically from underlying analytical datasets, never read from static pre-compiled answer tables.
5. **Channel-Specific Share of Voice:** Paid Media SOV, Social SOV, and E-Commerce SOV must be computed and displayed independently to prevent misleading blended metrics.
6. **Strict Server-Side Secret Isolation:** Zero scraper credentials or LLM API keys may be exposed to the client bundle.
