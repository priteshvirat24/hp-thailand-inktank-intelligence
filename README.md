# HP Thailand Ink Tank Competitive Intelligence POC

[![Framework: Next.js 15](https://img.shields.io/badge/framework-Next.js_15-black.svg)](https://nextjs.org/)
[![Language: TypeScript](https://img.shields.io/badge/language-TypeScript_5.8-blue.svg)](https://www.typescriptlang.org/)
[![Styling: Tailwind CSS](https://img.shields.io/badge/styling-Tailwind_CSS-38bdf8.svg)](https://tailwindcss.com/)
[![Tests: Vitest (435 Passed)](https://img.shields.io/badge/tests-435%20passing-emerald.svg)](https://vitest.dev/)
[![Status: Phase 7 Verified](https://img.shields.io/badge/status-Phase_7_Verified-emerald.svg)](#project-overview)
[![Live Demo](https://img.shields.io/badge/deployment-Vercel_Live-blue.svg)](https://hp-thailand-inktank-intelligence.vercel.app)

## Project Overview
Production-grade competitive intelligence platform providing automated tracking, multi-dimensional analytics, verified evidence lineage, and RAG retrieval across HP, Epson, Canon, and Brother Ink Tank printers in Thailand for the 90-day window (28 May 2026 – 28 August 2026).

**Live Production URL:** [https://hp-thailand-inktank-intelligence.vercel.app](https://hp-thailand-inktank-intelligence.vercel.app)

## System Architecture & Engineering Specification
The platform features an enterprise-grade architecture across web acquisition, forensic data processing, multi-dimensional OLAP aggregation, grounded RAG, and executive visualization.

👉 **[Read the Full System Architecture Specification & Mermaid Diagrams](docs/architecture.md)**

### Key Subsystems:
* **Canonical SKU Master & Invariant Filtering:** 28 Canonical SKUs, deterministic 4-stage SKU normalizer, 6-gate category filter rejecting consumables, cartridges, lasers, and non-printer hardware.
* **Forensic Review Reprocessor & Translation:** Mistral AI authentic English translation, 100% Thai source preservation, Buddhist Era date normalization (`BE 2567 -> 2024 CE`), multi-brand entity attribution, and zero synthetic wrappers.
* **Analytical Metric Cube (OLAP):** Multi-dimensional aggregation engine ($Brand \times Month \times Channel \times Platform \times SKU \times Metric$) across 18 specialized metric definitions, 5 Data Cuts, cell-to-evidence lineage preservation, and missing-vs-zero semantics.
* **Strategic RAG Intelligence Engine:** 4-part grounded answer contract, hybrid dense/lexical retrieval, conversational query understanding, unsupported scope interception, and deterministic numerical validation (`numericalValidator.ts`).
* **Executive Dashboard UI:** Single-page Next.js 15 + React 19 dashboard featuring 12 interactive domain sections, global floating RAG drawer, and the forensic review evidence modal.
* **Cryptographic Evidence Lake:** 3,653 immutable records with SHA-256 evidence hashing (`EVID-{PLATFORM}-{HEX}`) and visual screenshot manifest bindings.

## How Web Crawling & Discovery Works

```
1. Provide Target URL / Query
      ↓
2. Validate URL (SSRF & Protocol Safety)
      ↓
3. Check Robots Policy (robots.txt) & Apply Domain Throttling
      ↓
4. Attempt Direct Server HTTP Fetch
      ↓
5. Inspect HTML & Detect Page Type (Static vs JS Shell vs WAF Block)
      ↓
6. Escalate to Bright Data / Apify if JS or Proxy Required
      ↓
7. Extract Schema.org JSON-LD, OpenGraph & Thai Currency Text
      ↓
8. 6-Gate Contamination Filter (Reject Ink Bottles, Cartridges, Lasers)
      ↓
9. Resolve SKU against 28 Canonical Universe
      ↓
10. Generate Deterministic Evidence ID & Validate Schema via Zod
      ↓
11. Idempotently Insert into Global Evidence Store
      ↓
12. Automatically Rebuild Analytical Cube & Index into RAG Engine
```

## Running the Dashboard Locally

```bash
# 1. Run local Next.js development server
npm run dev

# 2. Run test suites (261 tests across 28 files)
npm test

# 3. Validate TypeScript type safety
npm run typecheck

# 4. Validate ESLint rules
npm run lint

# 5. Build optimized production bundle
npm run build
```

## Server Web & Analytics API Endpoints
* `POST /api/web/crawl` — Trigger bounded internet web crawl with auto-escalation
* `GET /api/web/crawl/[id]` — Crawl session progress and audit report
* `GET /api/web/diagnostics?url=...` — Real-time domain crawlability and strategy diagnostics
* `GET /api/web/history` — Recent crawl session history
* `POST /api/rag/query` — Grounded strategic intelligence Q&A
* `GET /api/analytics/summary?month=2026-08` — Executive overview & brand touchpoint totals
* `GET /api/analytics/trends?metric=TOTAL_VISIBILITY_TOUCHPOINTS&brand=All` — Month-on-month trend series
* `GET /api/analytics/brands?metric=TOTAL_VISIBILITY_TOUCHPOINTS&month=2026-08` — 4-Brand head-to-head metrics & SOV comparison
* `GET /api/analytics/skus?brand=HP&month=2026-08` — Canonical SKU pricing, discount %, and traction index
* `GET /api/analytics/platforms?channel=E-commerce&month=2026-08` — Channel and platform breakdowns
* `GET /api/analytics/evidence?metric=AVG_SELLING_PRICE_THB&brand=HP&month=2026-08` — Traceability drill-down from metric to raw evidence
* `POST /api/ingestion/run` — Targeted scraper provider run

---

## Scope & Category Invariants

* **Geography:** **Thailand only** (Locale: `th-TH`, Currency: `THB` / `฿`).
* **Target Brands:**
  1. **HP** (Product Family: *Smart Tank*)
  2. **Epson** (Product Family: *EcoTank*)
  3. **Canon** (Product Family: *MegaTank / PIXMA G-Series*)
  4. **Brother** (Product Family: *InkBenefit / Refill Tank / DCP-T & MFC-T Series*)
* **Category Focus:** **Refillable Ink Tank Printers only** (Inkjet printers utilizing continuous, refillable internal ink reservoirs).
* **Hard Exclusions:**
  * Cartridge inkjet printers (e.g., HP DeskJet, Canon PIXMA TS/MG, Epson Expression)
  * Laser / Toner printers (e.g., HP LaserJet, Canon imageCLASS, Brother HL-L)
  * Standalone ink refill bottles / multipacks (e.g., Epson 003, HP GT52/GT53, Canon GI-790, Brother BTD60)
  * Printheads, maintenance boxes, spare parts, photo paper, and sublimation consumables
  * Large-format industrial architectural plotters and press hardware
* **Target Audience:**
  1. Consumers (Home, Student, Family)
  2. Micro / Small Business (SMB under 100 employees)
* **Analysis Window:** **28 May 2026 to 28 August 2026** (90-day window covering June, July, August 2026).
* **Missing Data Invariant:** `null` is never rendered as 0, 0%, or ฿0. Unobserved metrics display as explicit states (`MISSING`, `INSUFFICIENT_EVIDENCE`).
* **Cumulative Sales Traction Invariant:** Cumulative marketplace counters are strictly termed **"Observable Cumulative Sales Traction Index"** and never misrepresented as monthly sales.
