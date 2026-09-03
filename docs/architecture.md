# Architecture & Data Flow Specification

## 1. Domain Invariants
* **Geography:** Thailand (`th-TH`, `THB` / `฿`).
* **Category:** Refillable Ink Tank printers only (HP Smart Tank, Epson EcoTank, Canon MegaTank, Brother InkBenefit).
* **Target Brands:** HP, Epson, Canon, Brother.
* **Period:** 28 May 2026 – 28 August 2026 (June, July, August 2026).

## 2. Ingestion to Presentation Pipeline
```
[Paid Ads / Social Feeds / E-Commerce Listings]
                      │
                      ▼
       [6-Gate Category Classifier]
 (Excludes Cartridges, Lasers, Bottles alone)
                      │
                      ▼
         [Raw Evidence Lake Store]
   (Retains Source URL, Dates, Thai Text)
                      │
                      ▼
    [Normalized Analytical Cube Service]
   (Brand × Month × Channel × Platform × SKU)
                      │
                      ▼
     [Grounded RAG & Dynamic Reasoning]
 (Dynamic SWOT & Implications for HP with Citations)
                      │
                      ▼
     [Single-Page Executive Dashboard]
```
