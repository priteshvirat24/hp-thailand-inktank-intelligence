# Generalized Web Acquisition & Internet Evidence Discovery Architecture

**Version:** 1.0.0  
**Domain:** HP Thailand Ink Tank Competitive Intelligence  
**Authoritative Reference:** Technical Implementation Brief v2

---

## 1. Executive Summary

The Internet Web Acquisition Layer extends the existing provider-ready scraper infrastructure into an autonomous, provider-agnostic web discovery and evidence acquisition system. It acquires publicly accessible data from arbitrary web domains while strictly enforcing:
- **Zero Synthetic Data Invariant:** Missing fields remain explicit `null` / `MISSING`.
- **6-Gate Contamination Filter:** Automatic rejection of ink bottles, toner cartridges, and non-tank printers.
- **28-SKU Canonical Taxonomy:** Deterministic model normalization against the established catalog.
- **SSRF & Security Isolation:** Strict blocking of private IP ranges, localhost, and cloud metadata endpoints.
- **Deterministic Evidence ID & Provenance:** SHA-256 evidence hashing and dual lineage linking to the Analytical Cube and RAG Engine.

---

## 2. End-to-End Architecture Flow

```
                     USER / SEED / QUERY
                              │
                              ▼
                      DISCOVERY ENGINE
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
        Known URL        Search / SERP   Domain Discovery
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                              ▼
                       URL NORMALIZER
                  (SSRF & Tracking Filter)
                              │
                              ▼
                     ACQUISITION ROUTER
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
       DIRECT HTTP       BRIGHT DATA          APIFY
      (Server Fetch)   (Web Unlocker/Browser) (Actors/Browser)
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                              ▼
                     CONTENT EXTRACTION
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
         JSON-LD          Meta Tags        Visible DOM
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                              ▼
                    6-GATE CLASSIFICATION
                    (classifyPrinterItem)
                              │
                              ▼
                       SKU RESOLUTION
                        (resolveSku)
                              │
                              ▼
                    EVIDENCE VALIDATION
                  (validateEvidenceRecord)
                              │
                              ▼
                    GLOBAL EVIDENCE STORE
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
     ANALYTICAL CUBE                     RAG INTELLIGENCE
  (18 Standard Metrics)                (4-Part Grounded Answers)
            │                                   │
            └─────────────────┬─────────────────┘
                              │
                              ▼
                     EXECUTIVE DASHBOARD
```

---

## 3. Acquisition Strategies

| Strategy | Engine | Primary Domain Applicability |
|---|---|---|
| `DIRECT_HTTP` | Native Fetch | Static brand portals (e.g. `hp.com`, `epson.co.th`), lightweight HTML retailer sites. |
| `STRUCTURED_HTML` | Parser Pipeline | E-commerce detail pages containing Schema.org JSON-LD structured metadata. |
| `BRIGHTDATA_UNLOCKER` | Web Unlocker Proxy | Cloudflare/WAF-protected marketplaces (e.g. `shopee.co.th`, `lazada.co.th`). |
| `BRIGHTDATA_BROWSER` | Scraping Browser | Single-Page Applications (SPAs) and heavy JavaScript rendered catalog pages. |
| `APIFY_HTTP` / `APIFY_BROWSER` | Apify Actors | High-frequency pagination, dynamic feeds, and social media platforms (Meta, TikTok). |
| `CUSTOM_ADAPTER` | Platform Adapters | Dedicated Shopee, Lazada, Meta, and Google Ads scrapers. |
