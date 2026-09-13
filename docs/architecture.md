# HP Thailand Ink Tank Competitive Intelligence Platform
## Complete System Architecture & Engineering Specification

---

## 1. Executive Summary & System Overview

The **HP Thailand Ink Tank Competitive Intelligence Platform** is an enterprise-grade competitive monitoring, market intelligence, and decision-support system designed to provide real-time, mathematically grounded visibility into Thailand's continuous refillable ink tank printer ecosystem.

The system continuously tracks the four dominant market contenders:
* **HP** (*Smart Tank* series: ST 580, ST 520, ST 720, ST 750, etc.)
* **Epson** (*EcoTank* series: L3250, L3210, L5290, L1210, L4260, etc.)
* **Canon** (*MegaTank / PIXMA G* series: G2010, G3010, G3020, G1010, etc.)
* **Brother** (*InkBenefit / Refill Tank* series: DCP-T420W, DCP-T430W, DCP-T520W, MFC-T920DW, etc.)

### Core Non-Negotiable Invariants
1. **Geographic Boundary:** Thailand only (`th-TH` locale, prices strictly denominated in Thai Baht `THB` / `฿`).
2. **Analysis Window:** Standard 90-day strategic focal window (**28 May 2026 – 28 August 2026**, spanning June, July, and August 2026).
3. **Category Boundary:** Refillable Ink Tank printers strictly. 6-Gate filters hard-reject cartridge inkjets, toner/laser printers, standalone ink bottles, printheads, photo paper, and non-printer electronics (e.g., HP OMEN laptops, SSDs, BIOS).
4. **Data Integrity & Traceability:** Deterministic SHA-256 evidence hashing (`EVID-{PLATFORM}-{HEX}`), 100% authentic Thai source text preservation, verified Mistral AI English translation, authentic publication timestamps (with Thai Buddhist Era calendar conversion), and strict missing-vs-zero semantics.

---

## 2. System Context & Domain Boundary Architecture

```mermaid
flowchart TB
    subgraph THAILAND_MARKET["THAILAND CONTINUOUS INK TANK MARKETPLACE"]
        direction TB
        subgraph TARGET_BRANDS["4 Canonical Brands"]
            B1["HP<br/>Smart Tank"]
            B2["Epson<br/>EcoTank"]
            B3["Canon<br/>MegaTank / PIXMA G"]
            B4["Brother<br/>InkBenefit / Refill Tank"]
        end

        subgraph CHANNELS["4 Marketing & Commerce Channels"]
            C1["Paid Advertising<br/>• Meta Ad Library<br/>• Google Ads Transparency"]
            C2["E-Commerce Marketplaces<br/>• Shopee Mall Thailand<br/>• LazMall Thailand<br/>• TikTok Shop Thailand"]
            C3["Commercial Retail<br/>• JIB Computer Group<br/>• Advice IT / Power Buy"]
            C4["Consumer Voice & Social<br/>• Pantip IT Discussions<br/>• Facebook Groups & YouTube"]
        end
    end

    subgraph SYSTEM_BOUNDARY["HP THAILAND COMPETITIVE INTELLIGENCE SYSTEM BOUNDARY"]
        direction TB
        GATE_IN["6-Gate Category Invariant Filter<br/>Reject: Cartridges, Toners, Bottles, Laptops"]
        CORE["Core Analytical Engine<br/>• Evidence Lake (3,653 Verified Records)<br/>• 5D Analytical Metric Cube<br/>• Grounded RAG Strategic Assistant"]
        UI_OUT["Executive Presentation Dashboard<br/>12 Specialized Intelligence Sections"]
    end

    subgraph EXCLUSIONS["STRICTLY REJECTED SCOPES (OUT-OF-SCOPE)"]
        EX1["Cartridge Inkjet Printers (HP DeskJet, Canon TS)"]
        EX2["Laser & Toner Printers (LaserJet, imageCLASS)"]
        EX3["Standalone Consumables (Ink Bottles, Printheads, Paper)"]
        EX4["Non-Printer Hardware (HP OMEN Laptops, SSDs, BIOS)"]
    end

    TARGET_BRANDS --> CHANNELS
    CHANNELS --> GATE_IN
    GATE_IN -- "Passes Refillable Ink Tank Check" --> CORE
    GATE_IN -. "Violates Category Invariant" .-> EXCLUSIONS
    CORE --> UI_OUT
```

---

## 3. End-to-End System Architecture

```mermaid
flowchart TB
    subgraph L1["1. EXTERNAL DATA ACQUISITION LAYER"]
        direction TB
        SRC_ADS["Paid Ads<br/>Meta Ad Library, Google Ads"]
        SRC_ECOM["E-Commerce<br/>Shopee, LazMall, TikTok Shop"]
        SRC_RETAIL["Retailers<br/>JIB, Advice IT"]
        SRC_VOICE["Consumer Forums<br/>Pantip, Social Communities"]
    end

    subgraph L2["2. SECURITY, STEALTH & CRAWLING"]
        direction TB
        SECURITY["Security Guardrails<br/>SSRF Check, Protocol Whitelist"]
        RATE_LIMIT["Policy Engine<br/>robots.txt, Domain Throttling"]
        CRAWLER["Scrapling Engine<br/>Stealth Browser & Playwright"]
        ESCALATION["Proxy Escalation<br/>Apify / Bright Data Network"]
    end

    subgraph L3["3. EXTRACTION, RESOLUTION & NORMALIZATION"]
        direction TB
        EXTRACTOR["Structural Extraction<br/>JSON-LD, OpenGraph, Thai Currency"]
        SKU_NORM["4-Stage SKU Normalizer<br/>Maps to 28 Canonical SKUs"]
        GATE_FILTER["6-Gate Invariant Filter<br/>Quarantines Off-Topic Records"]
        REVIEW_REPROCESSOR["Review Reprocessor<br/>Mistral Translation & Date Normalizer"]
    end

    subgraph L4["4. PERSISTENT EVIDENCE STORAGE"]
        direction TB
        EVID_STORE[("Evidence Lake Store<br/>scrapling_verified_lake.json<br/>3,653 Verified Records")]
        ASSET_STORE[("Verified Screenshot Manifest<br/>/public/screenshots/*.webp")]
        AUDIT_STORE[("Forensic Audit Reports<br/>review_audit_report.json")]
    end

    subgraph L5["5. ANALYTICAL OLAP CUBE"]
        direction TB
        OLAP_ENGINE["Multi-Dimensional Aggregator<br/>Brand × Month × Channel × Platform × SKU"]
        METRIC_REGISTRY["18 Certified Metrics<br/>SOV %, ASP, Promo Pressure, Net Sentiment"]
        LINEAGE_ENGINE["Evidence Lineage Index<br/>Cell-to-Evidence ID Mapping"]
    end

    subgraph L6["6. RAG STRATEGIC INTELLIGENCE ENGINE"]
        direction TB
        QUERY_PARSER["Query Understanding<br/>Intent & Entity Resolution"]
        SCOPE_GUARD["Unsupported Scope Guard<br/>Intercepts Non-Printer Queries"]
        HYBRID_RETRIEVER["Hybrid Retrieval<br/>Dense Vectors + BM25 Lexical"]
        NUM_VALIDATOR["Numerical Validator<br/>100% Metric Cube Consistency"]
        GROUNDING_SYNTH["Answer Synthesis<br/>4-Part Grounded Answer Contract"]
    end

    subgraph L7["7. API GATEWAY & SERVER RUNTIME (NEXT.JS 15)"]
        direction LR
        API_ANALYTICS["/api/analytics/*<br/>Summary, Trends, Brands, SKUs"]
        API_RAG["/api/rag/query<br/>Conversational Grounded Q&A"]
        API_WEB["/api/web/*<br/>Live Crawl & Diagnostics"]
    end

    subgraph L8["8. EXECUTIVE DASHBOARD (REACT 19 + TAILWIND CSS)"]
        direction TB
        DASH_HEADER["Sticky Navigation Header & Health Monitor"]
        DASH_VIEWS["12 Interactive Dashboard Views<br/>• Executive Overview & Visual Analytics<br/>• Online Visibility, Ads & Social Activity<br/>• E-Commerce, Pricing & SKU Explorer<br/>• Consumer Voice with Forensic Evidence Modal<br/>• Evidence Lake Explorer & Live Captures"]
        RAG_MODAL["Global Floating RAG Assistant Drawer"]
    end

    %% Inter-layer connections
    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> L5
    L4 --> L6
    L5 --> L6
    L5 --> L7
    L6 --> L7
    L4 --> L7
    L7 --> L8
```

---

## 4. Data Acquisition, Anti-Bot & Web Ingestion Architecture

```mermaid
flowchart TD
    REQ_IN(["Target URL / Scraping Task Initiated"]) --> SSRF_CHECK{"SSRF & Protocol<br/>Safety Validator"}
    
    SSRF_CHECK -- "Local IP, Private Net, Invalid Scheme" --> ABORT_SEC["Drop Job & Log Security Event"]
    SSRF_CHECK -- "Valid Public HTTPS URL" --> ROBOTS_EVAL{"Evaluate robots.txt<br/>& Domain Rate Limits"}
    
    ROBOTS_EVAL -- "Disallowed / Rate Exceeded" --> DELAY_QUEUE["Throttle in Queue / Apply Crawl-Delay"]
    ROBOTS_EVAL -- "Allowed" --> HTTP_ATTEMPT["Direct HTTP Acquisition<br/>(Scrapling / Python Requests)"]
    
    HTTP_ATTEMPT --> PAGE_ANALYZE{"Analyze Response<br/>HTTP Status & Body"}
    
    PAGE_ANALYZE -- "403 / Cloudflare Challenge / JS Shell" --> PROXY_ESCALATE["Escalate to Stealth Browser<br/>• Playwright Anti-Bot Fingerprint<br/>• Apify / Bright Data Proxy Pool"]
    PAGE_ANALYZE -- "200 OK & Server Rendered" --> PARSER
    PROXY_ESCALATE --> PARSER["Structural DOM & Metadata Parser<br/>• Schema.org JSON-LD<br/>• OpenGraph & Product Microdata<br/>• Thai Currency Regex: ฿ / THB / บาท"]
    
    PARSER --> FILTER_6GATE{"6-Gate Invariant Filter<br/>Category Classifier"}
    
    FILTER_6GATE -- "Consumable / Toner / Laptop" --> MARK_OFFTOPIC["Quarantine as OFF_TOPIC<br/>Attach exclusion_reason"]
    FILTER_6GATE -- "Valid Refillable Ink Tank" --> SKU_MATCH["4-Stage SKU Normalizer<br/>Resolve Canonical SKU"]
    
    SKU_MATCH --> REVIEW_DETECT{"Is Forum / Consumer<br/>Review Record?"}
    
    REVIEW_DETECT -- "No (Listing / Paid Ad / Post)" --> ID_HASH
    REVIEW_DETECT -- "Yes (Pantip / Shopee Review)" --> REVIEW_REPROCESS["Forensic Review Reprocessor<br/>• Thai BE to CE Date Conversion<br/>• Mistral AI English Translation<br/>• Preserve Original Thai Text<br/>• Multi-Brand Entity & Sentiment Linking"]
    
    REVIEW_REPROCESS --> ID_HASH["Generate SHA-256 Evidence ID<br/>EVID-{PLATFORM}-{HEX}"]
    MARK_OFFTOPIC --> ID_HASH
    
    ID_HASH --> ZOD_CHECK{"Zod Schema<br/>Validation"}
    ZOD_CHECK -- "Schema Error" --> ERROR_LOG["Log to scratch/ & Quarantine"]
    ZOD_CHECK -- "Contract Valid" --> LAKE_COMMIT[("Idempotent Commit to Evidence Lake<br/>data/evidence_lake/scrapling_verified_lake.json")]
    
    LAKE_COMMIT --> TRIGGER_REBUILD["Emit Cube & RAG Index Invalidation Event"]
```

---

## 5. Canonical SKU Resolution & 6-Gate Filtering Pipeline

The platform enforces strict category hygiene through a 6-gate invariant filter and a 4-stage SKU normalizer.

```mermaid
flowchart TD
    subgraph RAW_INPUT["Raw Marketplace / Web Text Stream"]
        TITLE["Raw Title: 'เครื่องพิมพ์ HP Smart Tank 580 All-in-One + หมึกแท้ GT53'"]
        DESC["Raw Description: 'มัลติฟังก์ชันปริ้นเตอร์ รองรับ Wifi ประกัน 2 ปี onsite'"]
    end

    subgraph SIX_GATE["6-GATE CATEGORY FILTER (classifier.ts)"]
        GATE1{"Gate 1: Brand Check<br/>HP, Epson, Canon, Brother?"}
        GATE2{"Gate 2: Non-Printer Rejection<br/>Laptop, SSD, Monitor, BIOS?"}
        GATE3{"Gate 3: Consumable Rejection<br/>Standalone Ink Bottle, Cartridge, Toner?"}
        GATE4{"Gate 4: Laser / Commercial Rejection<br/>LaserJet, Plotter, Press?"}
        GATE5{"Gate 5: Technology Check<br/>Continuous Refillable Reservoir?"}
        GATE6{"Gate 6: Geographic Rejection<br/>Thailand Market Relevant?"}
    end

    subgraph SKU_NORMALIZER["4-STAGE SKU NORMALIZER (skuNormalizer.ts)"]
        STAGE1["Stage 1: Direct Canonical Match<br/>Matches 'Smart Tank 580'"]
        STAGE2["Stage 2: Model Token Regex<br/>Extracts numbers (e.g. '580', '3250')"]
        STAGE3["Stage 3: Family Heuristic<br/>Identifies Smart Tank / EcoTank series"]
        STAGE4["Stage 4: Thai Retailer Alias Map<br/>Resolves local Thai abbreviations"]
    end

    subgraph RESOLUTION_OUTPUT["Resolved Canonical Output"]
        CANONICAL_SKU["Canonical SKU: HP-ST-580<br/>Brand: HP<br/>Family: Smart Tank<br/>Segment: Home / SMB"]
    end

    RAW_INPUT --> GATE1
    GATE1 -- Yes --> GATE2
    GATE2 -- No Hardware Contamination --> GATE3
    GATE3 -- Not Sole Consumable --> GATE4
    GATE4 -- Not Laser/Plotter --> GATE5
    GATE5 -- Continuous Tank --> GATE6
    GATE6 -- Thailand Locale --> STAGE1
    
    STAGE1 --> STAGE2
    STAGE2 --> STAGE3
    STAGE3 --> STAGE4
    STAGE4 --> CANONICAL_SKU

    GATE1 -- No --> REJECT_LAKE["Quarantine as OFF_TOPIC"]
    GATE2 -- Laptop/BIOS --> REJECT_LAKE
    GATE3 -- Standalone Bottle --> REJECT_LAKE
    GATE4 -- Laser/Plotter --> REJECT_LAKE
    GATE5 -- Cartridge Only --> REJECT_LAKE
    GATE6 -- Foreign Region --> REJECT_LAKE
```

---

## 6. Consumer Review Forensic Reprocessor & Translation Pipeline

```mermaid
flowchart TD
    subgraph REVIEW_INGESTION["Consumer Review Ingestion (Pantip / E-Commerce)"]
        RAW_THAI["Original Thai Content<br/>(e.g., 'HP Smart Tank 580 ใช้งานดีมาก ปริ้นท์ผ่าน wifi ไว...')"]
        RAW_DATES["Thai Calendar Timestamps<br/>(e.g., '15 มิ.ย. 2567 10:30 น.' or epoch data_utime)"]
    end

    subgraph DATE_ENGINE["Temporal Normalization Engine"]
        BUDDHIST_CONV["Buddhist Era Converter<br/>BE 2567 - 543 = 2024 CE<br/>BE 2568 - 543 = 2025 CE<br/>BE 2569 - 543 = 2026 CE"]
        WINDOW_TAG{"Analytical Window Check<br/>28 May 2026 – 28 Aug 2026"}
        TAG_IN["temporal_window_status: IN_WINDOW"]
        TAG_OUT["temporal_window_status: OUT_OF_WINDOW"]
    end

    subgraph CATEGORY_ENGINE["Review Taxonomy Classifier"]
        TAXONOMY_EVAL{"Classify Post Content"}
        CAT_VERIFIED["VERIFIED_REVIEW<br/>(Single brand ink tank review)"]
        CAT_COMP["VERIFIED_COMPARATIVE_REVIEW<br/>(Compares 2+ brands/SKUs)"]
        CAT_SUPPORT["SUPPORT_DISCUSSION<br/>(Troubleshooting, LED codes, reset)"]
        CAT_GENERAL["GENERAL_CATEGORY_CONTENT<br/>(Generic printer tutorial / essay)"]
        CAT_OFFTOPIC["OFF_TOPIC<br/>(OMEN laptops, BIOS, SSDs)"]
        CAT_AI["AI_COPIED_CONTENT<br/>(Chatbot copy-paste)"]
    end

    subgraph TRANSLATION_ENGINE["Authentic Translation Pipeline (Mistral AI)"]
        CACHE_LOOKUP{"Check Translation<br/>Cache on Disk"}
        CACHE_HIT["Load Verified Translation<br/>from Cache"]
        MISTRAL_GEN["Generate Fluent EN Translation<br/>via Mistral AI API"]
        VALIDATE_TRANS{"Validate Translation<br/>• No boilerplate wrappers<br/>• No untranslated Thai in EN"}
        RETRY_OR_FALLBACK["Fallback: Flag 'PENDING' / Log"]
    end

    subgraph ENTITY_SENTIMENT["Entity & Sentiment Resolution"]
        BRAND_ENTITY["Extract Mentioned Brands<br/>(HP, Epson, Canon, Brother)"]
        SENTIMENT_LINK["Link Brand-Specific Sentiments<br/>Brand A: POSITIVE, Brand B: NEGATIVE"]
        SKU_ATTR["Resolve Explicitly Mentioned SKUs<br/>(Prevent Thread Inheritance)"]
    end

    RAW_DATES --> BUDDHIST_CONV
    BUDDHIST_CONV --> WINDOW_TAG
    WINDOW_TAG -- Within Window --> TAG_IN
    WINDOW_TAG -- Outside Window --> TAG_OUT

    RAW_THAI --> TAXONOMY_EVAL
    TAXONOMY_EVAL --> CAT_VERIFIED
    TAXONOMY_EVAL --> CAT_COMP
    TAXONOMY_EVAL --> CAT_SUPPORT
    TAXONOMY_EVAL --> CAT_GENERAL
    TAXONOMY_EVAL --> CAT_OFFTOPIC
    TAXONOMY_EVAL --> CAT_AI

    RAW_THAI --> CACHE_LOOKUP
    CACHE_LOOKUP -- Hit --> CACHE_HIT
    CACHE_LOOKUP -- Miss --> MISTRAL_GEN
    MISTRAL_GEN --> VALIDATE_TRANS
    VALIDATE_TRANS -- Valid --> ENTITY_SENTIMENT
    VALIDATE_TRANS -- Invalid --> RETRY_OR_FALLBACK
    CACHE_HIT --> ENTITY_SENTIMENT

    ENTITY_SENTIMENT --> ASSEMBLE_RECORD[("Final Audited Review Record<br/>Preserves Original Thai + Authentic EN<br/>Lineage Linked to Evidence Lake")]
```

---

## 7. Analytical Metric Cube (OLAP In-Memory Engine)

```mermaid
flowchart LR
    subgraph LAKE_SOURCE["Verified Evidence Lake"]
        RECORDS[("3,653 Evidence Records<br/>Ads, Products, Social, Reviews")]
    end

    subgraph CUBE_GATING["Quality & Invariant Filters"]
        GATE_REVIEW["isValidConsumerReview()<br/>Excludes OFF_TOPIC, SUPPORT, GENERAL"]
        GATE_TIME["Temporal Window Filter<br/>Active 90-day vs Historical"]
    end

    subgraph CUBE_COORDINATES["5-Dimensional Coordinate Space"]
        DIM_BRAND["Brand (HP, Epson, Canon, Brother, All)"]
        DIM_MONTH["Month (2026-06, 2026-07, 2026-08, 90-Day)"]
        DIM_CHANNEL["Channel (Paid Ads, E-Commerce, Social, Retail)"]
        DIM_PLATFORM["Platform (Shopee, LazMall, TikTok, Meta, JIB, Pantip)"]
        DIM_SKU["SKU (28 Canonical SKUs + Family Totals)"]
    end

    subgraph METRICS_ENGINE["18 Certified Metric Formulations"]
        M_VOL["Volume Metrics<br/>• TOTAL_VISIBILITY_TOUCHPOINTS<br/>• VERIFIED_REVIEW_COUNT<br/>• RATED_OBSERVATION_COUNT"]
        M_SOV["Share Metrics<br/>• SHARE_OF_VOICE_PERCENT<br/>• CHANNEL_SHARE_PERCENT"]
        M_PRICE["Pricing & Commercial<br/>• AVG_SELLING_PRICE_THB<br/>• MIN / MAX PRICE<br/>• DISCOUNT_DEPTH_PERCENT<br/>• PROMO_PRESSURE_INDEX"]
        M_SENT["Sentiment Metrics<br/>• NET_SENTIMENT_SCORE<br/>• POSITIVE / NEGATIVE %"]
        M_TRAC["Market Traction<br/>• CUMULATIVE_SALES_INDEX"]
    end

    subgraph DATA_CUTS["5 Standard Analytical Cuts"]
        C1["Time Cut: MoM Growth & Trends"]
        C2["Brand Cut: Head-to-Head SOV & Sentiment"]
        C3["Channel Cut: Media Mix & Channel Power"]
        C4["SKU Cut: Price Elasticity & Model Rank"]
        C5["Metric Cut: Executive Scorecards"]
    end

    subgraph AUDIT_LINEAGE["Cell-to-Evidence Lineage Map"]
        TRACE["Every aggregated number links to<br/>underlying evidence IDs: [EVID-001, ...]"]
    end

    RECORDS --> CUBE_GATING
    CUBE_GATING --> CUBE_COORDINATES
    CUBE_COORDINATES --> METRICS_ENGINE
    METRICS_ENGINE --> DATA_CUTS
    METRICS_ENGINE --> AUDIT_LINEAGE
```

---

## 8. Strategic RAG Intelligence & Numerical Validation Pipeline

```mermaid
flowchart TD
    USER_QUERY(["User Enters Strategic Query<br/>(e.g., 'Compare HP and Epson ink tank pricing and SOV in August 2026')"]) --> QP["Query Understanding Engine<br/>(queryUnderstanding.ts)"]
    
    subgraph QUERY_ANALYSIS["Query Analysis & Scope Checking"]
        INTENT["Intent Classification<br/>(ANALYTICAL, COMPARATIVE, PRICE, REVIEWS)"]
        ENTITY_EXTRACT["Entity Extraction<br/>Brands: HP, Epson | Month: 2026-08"]
        SCOPE_CHECK{"Unsupported Scope Guard<br/>Is query asking for laptops/BIOS?"}
    end

    QP --> INTENT
    QP --> ENTITY_EXTRACT
    QP --> SCOPE_CHECK

    SCOPE_CHECK -- "Yes (e.g., OMEN Laptop)" --> REFUSAL["Generate Honest Boundary Refusal<br/>State platform focus is strictly Ink Tank printers.<br/>Zero hallucinated metrics."]
    
    SCOPE_CHECK -- "No (In-Scope Printer Query)" --> RETRIEVAL_COORDINATOR["Retrieval Coordinator<br/>(ragService.ts)"]

    subgraph RETRIEVAL_PHASE["Dual-Path Retrieval"]
        direction TB
        CUBE_RETRIEVE["Cube Metric Retrieval<br/>Extract ground-truth SOV, ASP, and touchpoints"]
        CHUNK_RETRIEVE["Hybrid Chunk Retrieval<br/>• BM25 Lexical Matching<br/>• Dense Vector Cosine Similarity<br/>• Category Filter Guard (isOffTopicForRag)"]
    end

    RETRIEVAL_COORDINATOR --> CUBE_RETRIEVE
    RETRIEVAL_COORDINATOR --> CHUNK_RETRIEVE

    CUBE_RETRIEVE --> GROUNDING["Grounding Engine (groundingEngine.ts)<br/>Draft Answer adhering to 4-Part Contract"]
    CHUNK_RETRIEVE --> GROUNDING

    subgraph NUM_VAL_PHASE["Numerical Ground-Truth Validation (numericalValidator.ts)"]
        CLAIM_EXTRACT["Claim Extractor<br/>Parse all numeric tokens (%, ฿, counts)"]
        CROSS_CHECK{"Cross-Check Against<br/>Analytical Metric Cube"}
        PASS_VAL["Certify Claim: 100% Consistent"]
        FAIL_VAL["Enforce Correction<br/>Replace with Exact Ground-Truth Number"]
    end

    GROUNDING --> CLAIM_EXTRACT
    CLAIM_EXTRACT --> CROSS_CHECK
    CROSS_CHECK -- Match --> PASS_VAL
    CROSS_CHECK -- Mismatch --> FAIL_VAL

    PASS_VAL --> FINAL_SYNTH["Synthesize Certified RAG Answer"]
    FAIL_VAL --> FINAL_SYNTH
    REFUSAL --> FINAL_SYNTH

    FINAL_SYNTH --> CLIENT_OUT(["Render Grounded Answer with Dual Citations<br/>(Metric Cube Lineage + Evidence Lake IDs)"])
```

---

## 9. Frontend Application Architecture & Component Hierarchy

```mermaid
flowchart TD
    subgraph ROOT["Next.js App Router (src/app/)"]
        LAYOUT["layout.tsx<br/>Global HTML Shell, Fonts, Metadata"]
        PAGE["page.tsx<br/>Primary Entrypoint"]
    end

    subgraph DASHBOARD_CONTAINER["Primary Container (src/components/Dashboard.tsx)"]
        NAV_BAR["Global Navigation Ribbon & System Health Badge"]
        TIME_SELECTOR["Analytical Window Selector (Default: 90-Day Focal Window)"]
        MAIN_VIEW["12 Rendered Intelligence Sections"]
    end

    subgraph SECTIONS_GRID["12 Domain Sections (src/components/sections/)"]
        direction TB
        subgraph SEC_EXECUTIVE["Executive & Strategic Slices"]
            SEC_OV["ExecutiveOverview.tsx<br/>High-level KPIs & Market Summary"]
            SEC_EVA["ExecutiveVisualAnalytics.tsx<br/>Multi-axis Recharts Visualizations"]
            SEC_INS["InsightsRecommendationsSection.tsx<br/>Strategic Action Plans"]
        end

        subgraph SEC_MEDIA["Market Visibility & Marketing Intelligence"]
            SEC_VIS["OnlineVisibilitySection.tsx<br/>Touchpoints & SOV Calculations"]
            SEC_ADV["AdvertisingSection.tsx<br/>Meta & Google Ad Creative Gallery"]
            SEC_SOC["SocialActivitySection.tsx<br/>TikTok, YouTube, Facebook Engagement"]
        end

        subgraph SEC_COMMERCIAL["Commercial, Pricing & Consumer Voice"]
            SEC_PRC["EcommercePricingSection.tsx<br/>ASP, Promo Pressure, Discounts"]
            SEC_SKU["SkuExplorerSection.tsx<br/>28 Canonical SKUs Matrix"]
            SEC_VOX["ConsumerSentimentSection.tsx<br/>Sentiment Breakdown & Testimonials"]
        end

        subgraph SEC_GOVERNANCE["Evidentiary Governance & Infrastructure"]
            SEC_LAK["EvidenceLakeSection.tsx<br/>Searchable Evidence Lake (3,653 records)"]
            SEC_CAP["LiveCapturesGallery.tsx<br/>Verified Screenshot Asset Viewer"]
            SEC_WEB["WebIntelligenceSection.tsx<br/>Crawler Diagnostics & Queues"]
        end
    end

    subgraph OVERLAYS["Interactive Modals & Assistants"]
        RAG_ASSIST["RagAssistant.tsx<br/>Global Floating Conversational Drawer"]
        MODAL_REVIEW["ForensicReviewModal<br/>Side-by-side Thai/EN & Attribute Inspector"]
        MODAL_EVID["EvidenceRecordModal<br/>Raw JSON & Screenshot Inspector"]
    end

    LAYOUT --> PAGE
    PAGE --> DASHBOARD_CONTAINER
    DASHBOARD_CONTAINER --> NAV_BAR
    DASHBOARD_CONTAINER --> TIME_SELECTOR
    DASHBOARD_CONTAINER --> MAIN_VIEW
    MAIN_VIEW --> SEC_EXECUTIVE
    MAIN_VIEW --> SEC_MEDIA
    MAIN_VIEW --> SEC_COMMERCIAL
    MAIN_VIEW --> SEC_GOVERNANCE
    DASHBOARD_CONTAINER -.-> OVERLAYS
```

---

## 10. Evidence Lake Cryptographic Lineage & Storage Architecture

```mermaid
flowchart LR
    subgraph WEB_SOURCE["External Web Touchpoint"]
        HTML_PAGE["Thai E-Commerce / Forum URL<br/>https://pantip.com/topic/39482910"]
    end

    subgraph HASH_INGEST["Cryptographic Ingestion Engine"]
        RAW_ATTRS["Attributes:<br/>• URL String<br/>• Published Timestamp<br/>• Source Platform<br/>• Authentic Thai Text"]
        SHA256_HASH["SHA-256 Hashing Algorithm<br/>sha256(url + timestamp + content)"]
        EVID_ID["Deterministic Evidence ID:<br/>EVID-PANTIP-9F3A1B..."]
    end

    subgraph STORAGE_TIER["Evidence Lake Storage"]
        LAKE_JSON[("data/evidence_lake/scrapling_verified_lake.json<br/>3,653 Immutable Records")]
        SCREENSHOT_FILE[("public/screenshots/pantip_39482910.webp<br/>Verified Visual Proof Asset")]
        MANIFEST[("screenshot_manifest.json<br/>Binds Evidence ID to Image Path")]
    end

    subgraph RAG_CHUNK_TIER["RAG Indexing Tier"]
        CHUNKER["EvidenceDocumentBuilder<br/>Splits into Retrieval Chunks"]
        CHUNK_ID["Deterministic Chunk ID:<br/>CHUNK-EVID-PANTIP-9F3A1B-001-C2E4"]
    end

    subgraph CONSUMPTION["Grounding & Presentation"]
        CLAIM_CITE["Claim Statement in RAG Answer<br/>'HP ST 580 onsite warranty praised'"]
        UI_BADGE["Clickable Citation Badge [EVID-PANTIP-9F3A1B]<br/>Opens Full Evidence Drawer with Visual Proof"]
    end

    WEB_SOURCE --> RAW_ATTRS
    RAW_ATTRS --> SHA256_HASH
    SHA256_HASH --> EVID_ID
    EVID_ID --> LAKE_JSON
    EVID_ID --> MANIFEST
    MANIFEST --> SCREENSHOT_FILE
    LAKE_JSON --> CHUNKER
    CHUNKER --> CHUNK_ID
    CHUNK_ID --> CLAIM_CITE
    CLAIM_CITE --> UI_BADGE
```

---

## 11. Automated Quality Gates & Continuous Verification Architecture

```mermaid
flowchart TD
    subgraph CODE_COMMIT["Codebase Change / Reprocessing Event"]
        TRIGGER(["git commit / automated audit run"])
    end

    subgraph GATE1["Gate 1: Unit & Integration Tests (vitest run)"]
        T1["38 Test Suites<br/>435 Passing Tests (0 Failures)"]
        T2["Adversarial Review Remediations<br/>(consumerReviewRemediationPhase22.test.ts)"]
        T3["Numerical Grounding Tests<br/>(numericalValidator.test.ts)"]
    end

    subgraph GATE2["Gate 2: TypeScript Strict Typecheck (tsc --noEmit)"]
        TS1["Zero Compilation Errors"]
        TS2["Strict Zod Contract Validation"]
    end

    subgraph GATE3["Gate 3: Static Code Linter (eslint src/)"]
        LINT1["Zero Lint Errors"]
        LINT2["Zero Unused Imports / Dead Code"]
    end

    subgraph GATE4["Gate 4: Review Data Integrity Audit (node scripts/audit-reviews.mjs)"]
        A_REV1["Zero Synthetic Translation Wrappers"]
        A_REV2["100% Authentic Thai Source Preserved"]
        A_REV3["Zero Invented Publication Dates"]
    end

    subgraph GATE5["Gate 5: Analytics Reconciliation Audit (node scripts/audit-analytics.mjs)"]
        A_AN1["Source Lake Review Count: 118"]
        A_AN2["Metric Cube Review Count: 118"]
        A_AN3["UI & RAG Review Count: 118"]
        A_AN4["Discrepancy: Exactly 0"]
    end

    subgraph GATE6["Gate 6: Production Next.js Build (next build)"]
        B1["Static Route Optimization"]
        B2["Client Bundle Minification"]
        B3["Zero SSR / Hydration Failures"]
    end

    subgraph VERDICT["Final Certified Deployment"]
        PASS(["Production Deployment Ready<br/>Vercel Live Build Verified"])
    end

    TRIGGER --> GATE1
    GATE1 --> GATE2
    GATE2 --> GATE3
    GATE3 --> GATE4
    GATE4 --> GATE5
    GATE5 --> GATE6
    GATE6 --> VERDICT
```

---

## 12. Complete Directory Structure Mapping

```
InkTank-analysis/
├── docs/
│   ├── architecture.md                 # Complete System Architecture & Diagrams (This file)
│   ├── analytics-cube.md               # OLAP Metric Cube Technical Specification
│   ├── dashboard-architecture.md       # Frontend UI Component Breakdown
│   ├── domain-model.md                 # Ink Tank Domain Invariants & Rules
│   ├── rag-architecture.md             # Grounded RAG Implementation Guide
│   ├── scraper-architecture.md         # Crawler & Scrapling Design
│   └── web-acquisition-architecture.md # Network Security & SSRF Rules
├── data/
│   ├── creative_intelligence/          # Marketing messaging, ad copy themes
│   └── evidence_lake/
│       ├── .pantip_timestamp_map.json  # Reconstructed authentic Pantip forum dates
│       ├── .review_translation_cache.json # Cached Mistral translations
│       ├── review_audit_report.json    # Forensic review audit report
│       ├── scrapling_verified_lake.json# 3,653 Verified Evidence Records (Master Lake)
│       └── screenshot_manifest.json    # Binds Evidence IDs to Screenshot Assets
├── public/
│   └── screenshots/                    # On-disk verified platform captures (.webp)
├── scripts/
│   ├── audit-analytics.mjs             # Layer reconciliation audit script
│   ├── audit-reviews.mjs               # Review integrity audit script
│   ├── reprocess-reviews.mjs           # Forensic review reprocessing engine
│   ├── verify-rag-reviews.ts           # Live RAG verification test harness
│   └── crawlers/                       # Scrapers for Shopee, Lazada, Pantip, Meta, etc.
├── src/
│   ├── app/                            # Next.js 15 App Router pages & API routes
│   │   ├── api/                        # REST endpoints for analytics, RAG, and crawling
│   │   ├── layout.tsx                  # Global App Layout
│   │   └── page.tsx                    # Main Dashboard Entrypoint
│   ├── components/
│   │   ├── Dashboard.tsx               # Primary dashboard container
│   │   ├── rag/                        # RAG Assistant drawer & query banners
│   │   ├── sections/                   # 12 domain-specific analytics sections
│   │   └── ui/                         # Reusable UI components (modals, tooltips, cards)
│   ├── config/                         # Canonical SKUs, brands, sources, dates, constants
│   ├── services/
│   │   ├── analytics/                  # Metric Cube aggregation & registry
│   │   ├── catalog/                    # SKU normalizer (4-stage matching)
│   │   ├── classification/             # 6-gate category filter
│   │   ├── evidence/                   # Evidence Store & validation
│   │   ├── insights/                   # Strategic recommendation engine
│   │   ├── rag/                        # RAG service, hybrid retrieval, numerical validator
│   │   ├── reviews/                    # Review reprocessor & translation validator
│   │   ├── scrapers/                   # Scraper provider abstractions (Apify, Bright Data)
│   │   └── web/                        # Web crawler, SSRF guard, robots parser, diagnostics
│   └── types/                          # Canonical TypeScript interfaces (reviews, evidence, rag, analytics)
├── src/tests/                          # 38 Vitest test suites (435 passing tests)
├── package.json                        # Node dependencies & project scripts
├── tsconfig.json                       # TypeScript compiler configuration
└── README.md                           # Project README & Quickstart
```

---

## 13. Quality Gates Certification Matrix

| # | Quality Gate | Command | Verification Outcome | Status |
| :-: | :--- | :--- | :--- | :---: |
| 1 | **Vitest Test Suite** | `npm test` | **435 tests passed** across 38 suites (0 failures) | **PASSED** |
| 2 | **TypeScript Typecheck** | `npm run typecheck` | Code 0; zero compiler errors | **PASSED** |
| 3 | **ESLint Linter** | `npm run lint` | Code 0; zero warnings or errors | **PASSED** |
| 4 | **Production Next.js Build** | `npm run build` | Code 0; static and dynamic routes compiled cleanly | **PASSED** |
| 5 | **Review Data Integrity Audit** | `npm run audit:reviews` | Code 0; 0 fake wrappers, 100% Thai preserved, 0 date issues | **PASSED** |
| 6 | **Analytics Reconciliation** | `npm run audit:analytics` | Code 0; exactly 118 verified reviews across all layers | **PASSED** |
