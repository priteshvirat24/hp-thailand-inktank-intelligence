# Executive Dashboard Architecture & UI Specification

**Version:** 1.0.0  
**Phase:** 3A (Executive Dashboard & Analytics UI)  
**Authoritative Reference:** `HP Thailand Ink Tank Technical Implementation Brief_v2.pdf`  
**Scope:** Thailand Refillable Ink Tank Printer Competitive Intelligence (HP vs Epson vs Canon vs Brother)

---

## 1. Executive Dashboard Overview

The Executive Dashboard provides HP leadership, business analysts, and decision-makers with an evidence-grounded, multi-channel competitive intelligence platform for the Thailand Ink Tank printer market.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                APPLICATION SHELL                                       │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Header: App Identity • Month Selector (Jun/Jul/Aug 2026) • Brand Filter • Cache  │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Navigation: 8 Strategic Sections • Evidence Lake Counter • AI Badge              │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Active Section View (Overview / Visibility / Ads / Social / E-Com / SKUs / ...)  │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Evidence Audit Modal: Deep Source Link • SHA-256 Hashing • Thai Text • Timestamps│  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Information Architecture & Section Hierarchy

The dashboard is structured into 8 distinct strategic sections:

| Section # | Section Name | Primary Objective | Data Source APIs |
|---|---|---|---|
| **1** | **Executive Overview** | HP focal KPIs, 4-brand competitive matrix, strategic insights | `GET /api/analytics/summary` |
| **2** | **Online Visibility & SOV** | Multi-channel SOV trends and total touchpoint volume | `GET /api/analytics/brands`, `GET /api/analytics/trends` |
| **3** | **Paid Advertising** | Ad creative volume, Video/Static/Carousel format distribution | `GET /api/analytics/brands` (AD_PRESENCE, CREATIVE_FORMATs) |
| **4** | **Social Media Activity** | Brand post frequency, audience engagement, social SOV | `GET /api/analytics/brands` (POSTS, ENGAGEMENT) |
| **5** | **E-Commerce & Pricing** | Price envelope, discount depth, **Cumulative Sales Traction Index** | `GET /api/analytics/skus`, `GET /api/analytics/brands` |
| **6** | **SKU Explorer** | 28-model canonical catalog with live pricing & competitor mappings | Canonical registry + `GET /api/analytics/skus` |
| **7** | **Evidence Lake** | Searchable repository of raw observations with deep source links | `GET /api/analytics/evidence` |
| **8** | **RAG Intelligence** | Grounded Q&A entry point with 4-part answer contract | Planned `POST /api/rag/query` |

---

## 3. Component Tree & Client-Server Boundary

To guarantee security and eliminate accidental exposure of provider secrets (`APIFY_API_KEY`, `BRIGHTDATA_API_KEY`, etc.), all dashboard UI components operate strictly on the client side using typed API wrappers (`src/lib/apiClient.ts`) over server API endpoints.

```
src/
├── app/
│   ├── layout.tsx                # Root HTML shell & dark theme
│   ├── page.tsx                  # Mounts <Dashboard />
│   └── api/analytics/            # Server-only API Routes (Protected)
│       ├── summary/route.ts      # ExecutiveOverviewData
│       ├── brands/route.ts       # BrandComparisonRecord[]
│       ├── skus/route.ts         # SkuComparisonRecord[]
│       ├── platforms/route.ts    # PlatformBreakdownRecord[]
│       ├── trends/route.ts       # MonthlyTrendPoint[]
│       └── evidence/route.ts     # RawEvidenceRecord[]
│
├── lib/
│   ├── apiClient.ts              # Client-safe typed fetch wrappers (No secrets)
│   └── utils.ts                  # Currency & percentage formatting
│
└── components/
    ├── Dashboard.tsx             # Main client container ('use client')
    ├── layout/
    │   ├── Header.tsx            # Global month & brand filter controls
    │   └── Navigation.tsx        # Section tab navigation
    ├── sections/
    │   ├── ExecutiveOverview.tsx
    │   ├── OnlineVisibilitySection.tsx
    │   ├── AdvertisingSection.tsx
    │   ├── SocialActivitySection.tsx
    │   ├── EcommercePricingSection.tsx
    │   ├── SkuExplorerSection.tsx
    │   ├── EvidenceLakeSection.tsx
    │   └── RagIntelligenceSection.tsx
    └── ui/
        ├── Card.tsx              # Surface container
        ├── BrandPill.tsx         # Brand-specific color pill
        ├── MetricCard.tsx        # KPI display with drilldown
        ├── DataStateBadge.tsx    # Explicit data state indicator
        ├── EmptyState.tsx        # Zero-data guidance without fake data
        └── EvidenceModal.tsx     # Full evidence audit trail
```

---

## 4. Invariant Rules & Data Semantics

### 4.1 Missing Data Semantics (`null ≠ 0`)
* `null` metric values are **never converted to 0, 0%, or ฿0**.
* Unobserved metrics render with explicit `DataStateBadge` status indicators:
  * `MISSING`: No observations captured for the filter parameters.
  * `INSUFFICIENT_EVIDENCE`: Observations exist but category denominator is zero.
  * `OBSERVED`: Verified observations available.
* Confirmed zero (e.g. `0 ads` after crawling) is rendered as `0` only when explicitly computed as 0.

### 4.2 Cumulative Sales Traction Invariant
* Marketplace sold counters (e.g. Shopee "1.2k sold") are lifetime cumulative counters.
* The UI strictly labels this metric: **"Observable Cumulative Sales Traction Index"**.
* Mislabeling as "monthly sales", "units sold", or "POS revenue" is strictly forbidden.

### 4.3 Analytical Period Boundaries
* The 90-day observation window runs from **May 28, 2026 to August 28, 2026**.
* Analytical trend months are:
  1. **June 2026 (`2026-06`)**: Contains May 28 – June 30 observations (late-May baseline rolled into June).
  2. **July 2026 (`2026-07`)**: July 1 – July 31.
  3. **August 2026 (`2026-08`)**: August 1 – August 28.
* May is excluded from the month selector as late-May observations are aggregated into June.

---

## 5. Evidence Lineage & Audit Trail

Every aggregated metric card in the dashboard features a direct evidence inspection action:

$$\text{Metric Card} \longrightarrow \text{Analytical Cube Row} \longrightarrow \text{Evidence IDs} \longrightarrow \text{Raw Evidence Record} \longrightarrow \text{Deep Source URL}$$

When clicked, `<EvidenceModal />` displays:
1. Calculation methodology and scope notes.
2. Immutable SHA-256 evidence record IDs.
3. Dual timestamps (`published_at` vs. `captured_at` UTC).
4. Original raw Thai text (`raw_content_th`) and English translations.
5. Extraction method and crawler confidence scores.
6. Direct clickable deep source links to live marketplace or social listings.

---

## 6. RAG Strategic Intelligence Integration Boundary

The RAG Intelligence section establishes the interaction architecture contract for future AI query execution:

* **Answer Contract:**
  1. **Grounded Answer**: Concise response derived strictly from verified metric rows.
  2. **Supporting Evidence**: Tabulated metrics with explicit `data_state`.
  3. **Strategic Implication for HP**: Competitive positioning takeaway.
  4. **Source Attribution**: Underlying evidence IDs and platform citations.
* **Anti-Hallucination Guardrail**: The backend rejects queries if supporting evidence has `data_state !== 'OBSERVED'`.
