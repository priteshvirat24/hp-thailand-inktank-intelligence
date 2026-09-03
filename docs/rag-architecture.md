# Grounded RAG & Strategic Intelligence Architecture

**Version:** 1.0.0  
**Phase:** 4A (RAG Retrieval, Embedding Pipeline & Strategic Intelligence Engine)  
**Authoritative Reference:** `HP Thailand Ink Tank Technical Implementation Brief_v2.pdf`  
**Scope:** Thailand Refillable Ink Tank Printer Competitive Intelligence (HP vs Epson vs Canon vs Brother)

---

## 1. Executive Overview & Intelligence Flow

The RAG Strategic Intelligence Engine provides executive-level competitive insights grounded directly in verified market evidence and the 18-metric Analytical Cube.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 EVIDENCE LAYER                                         │
│  Raw Observations (Meta Ads, Google Ads, Shopee, Lazada, TikTok Shop, JIB, Social)     │
│                     │                                                                  │
│                     ▼                                                                  │
│  Deterministic Chunking & Document Builder (evidenceDocumentBuilder.ts)                │
└─────────────────────┬──────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                RETRIEVAL LAYER                                         │
│  ┌───────────────────────────────┐     ┌──────────────────────────────────────────┐    │
│  │   Analytical Cube Router      │     │  Hybrid Lexical & Semantic Retriever     │    │
│  │   - SOV Metrics               │     │  - Exact SKU / Brand Keyword Matching    │    │
│  │   - Pricing & Discount Cube   │     │  - Vector Semantic Ranking (if active)   │    │
│  │   - Sales Traction Index      │     │  - Deterministic Fallback Hybrid Layer   │    │
│  └──────────────┬────────────────┘     └────────────────────┬─────────────────────┘    │
└─────────────────┼───────────────────────────────────────────┼──────────────────────────┘
                  │                                           │
                  ▼                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                GROUNDING ENGINE                                        │
│  groundingEngine.ts                                                                    │
│  - Synthesizes 4-Part Answer Contract                                                  │
│  - Computes Evidence & Metric Lineage (Evidence IDs, URLs, Analytical Rows)            │
│  - Enforces Missing Data Semantics (null ≠ 0)                                          │
│  - Dynamic 10 Strategic Capabilities (Zero static SWOT files)                          │
└─────────────────────┬──────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              EXECUTIVE DELIVERY                                        │
│  POST /api/rag/query ──► Interactive Dashboard RAG Section (RagIntelligenceSection.tsx)│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 10 Strategic Intelligence Capabilities

The intelligence layer natively answers queries across 10 specialized competitive dimensions without static predefined SWOT files:

1. **Competitive Visibility & Touchpoint Volume:** Total touchpoint distribution and cross-platform presence.
2. **Share of Voice (SOV):** Paid media, Social media, and E-commerce channel SOV calculated against category totals.
3. **Paid Advertising Activity:** Active ad creative volume on Meta Ad Library and Google Ads Transparency Center.
4. **Creative Formats:** Distribution of Video, Static Image, and Carousel formats.
5. **Social Media Activity:** Brand publishing velocity across official Thai channels (FB, IG, YT, TT, LI).
6. **Audience Engagement:** Consumer discussion, comments, and engagement velocity.
7. **E-Commerce Marketplace Footprint:** Official Mall listing presence across Shopee, Lazada, TikTok Shop, and JIB.
8. **Pricing & Promotions:** Price envelopes in ฿ THB, discount depth %, and promotional penetration.
9. **Consumer Sentiment & Themes:** Verified customer themes (print quality, refill ease, running costs, reliability).
10. **Strategic Implications for HP:** Actionable strategic countermeasures derived strictly from verified competitor signals.

---

## 3. Strict 4-Part Answer Contract

Every generated intelligence response adheres to the deterministic 4-part structure:

| Section | Content & Lineage Guarantee |
|---|---|
| **1. Grounded Answer** | Direct answer synthesized strictly from verified evidence. If evidence is missing, returns clear disclosure without hallucinating numbers. |
| **2. Supporting Evidence & Metrics** | Structured evidence cards citing immutable `evidence_id`, platform, date, snippet, and analytical metric rows with `data_state`. |
| **3. Implication for HP** | Strategic implication derived directly from observed competitor behavior. |
| **4. Source Citations & Lineage** | Direct deep source links to live marketplace and social listings with full audit drilldown capability. |
