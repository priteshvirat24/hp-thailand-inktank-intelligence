# Canonical Catalog Audit & Product Taxonomy Report

**Phase:** 2A (Canonical SKU Master + Product Taxonomy)  
**Authoritative Brief:** `HP Thailand Ink Tank Technical Implementation Brief_v2.pdf`  
**Single Source of Truth:** [src/config/skus.ts](file:///Users/priteshhome/InkTank-analysis%20/src/config/skus.ts)  

---

## A. Number of Canonical SKUs per Brand

| Brand | Canonical SKU Count | Segment Coverage |
| :--- | :--- | :--- |
| **HP** | **7 Models** | 4 Consumer / Home, 3 Small Business / SMB (<100 emp) |
| **Epson** | **7 Models** | 3 Consumer / Home, 4 Small Business / SMB (<100 emp) |
| **Canon** | **8 Models** | 6 Consumer / Home, 2 Small Business / SMB (<100 emp) |
| **Brother** | **6 Models** | 3 Consumer / Home, 3 Small Business / SMB (<100 emp) |
| **Total Universe** | **28 Canonical SKUs** | **16 Consumer / Home, 12 Small Business / SMB** |

---

## B. Product Families per Brand

| Brand | Canonical Family Name | Primary Distinctive Characteristics |
| :--- | :--- | :--- |
| **HP** | *Smart Tank* | High-yield refillable reservoir, HP Smart App integration, self-healing Wi-Fi. |
| **Epson** | *EcoTank* | Heat-Free PrecisionCore / Micro Piezo technology, front-facing integrated tanks. |
| **Canon** | *MegaTank* (PIXMA G) | High-yield continuous ink supply system, user-replaceable maintenance cartridges. |
| **Brother** | *InkBenefit* (Refill Tank) | Transparent tank cover embedded in front chassis, spill-free bottle keying. |

---

## C. Exact Source Section & Support in Specification

| SKU ID | Brand | Model Name | Brief Support Section & Page | Canonical Role |
| :--- | :--- | :--- | :--- | :--- |
| `HP-ST-580` | HP | Smart Tank 580 | Sections 10.1, 10.2, 10.3 (Pages 5, 6, 7) | **Primary Benchmark SKU for HP** |
| `HP-ST-515` | HP | Smart Tank 515 | Section 8 (Page 4 - Smart Tank family) | Mid-tier consumer wireless tank |
| `HP-ST-670` | HP | Smart Tank 670 | Section 8 (Page 4 - Smart Tank family) | Entry SMB auto-duplex tank |
| `HP-ST-720` | HP | Smart Tank 720 | Section 8 (Page 4 - Smart Tank family) | SMB wireless auto-duplex tank |
| `HP-ST-750` | HP | Smart Tank 750 | Section 8 (Page 4 - Smart Tank family) | SMB ADF auto-duplex tank |
| `HP-ST-315` | HP | Smart Tank 315 | Section 8 (Page 4 - Ink Tank family) | Entry consumer USB tank |
| `HP-ST-415` | HP | Smart Tank 415 | Section 8 (Page 4 - Ink Tank family) | Entry consumer wireless tank |
| `EPSON-ET-L3210` | Epson | EcoTank L3210 | Section 8 (Page 4 - EcoTank series) | Entry consumer 3-in-1 tank |
| `EPSON-ET-L3250` | Epson | EcoTank L3250 | Sections 10.1, 10.2, 10.3 (Pages 5, 6, 7) | **Primary Benchmark SKU for Epson** |
| `EPSON-ET-L3256` | Epson | EcoTank L3256 | Section 8 (Page 4 - EcoTank series) | Consumer white chassis Wi-Fi tank |
| `EPSON-ET-L4260` | Epson | EcoTank L4260 | Section 8 (Page 4 - EcoTank series) | SMB auto-duplex tank |
| `EPSON-ET-L5290` | Epson | EcoTank L5290 | Section 8 (Page 4 - EcoTank series) | SMB ADF fax tank |
| `EPSON-ET-L6270` | Epson | EcoTank L6270 | Section 8 (Page 4 - EcoTank series) | High-volume SMB PrecisionCore tank |
| `EPSON-ET-L15150`| Epson | EcoTank L15150| Section 8 (Page 4 - EcoTank series) | Commercial A3+ wide-format tank |
| `CANON-MT-G1010` | Canon | PIXMA G1010 | Section 8 (Page 4 - PIXMA G series) | Single-function entry tank |
| `CANON-MT-G2010` | Canon | PIXMA G2010 | Section 8 (Page 4 - PIXMA G series) | Consumer entry 3-in-1 tank |
| `CANON-MT-G2020` | Canon | PIXMA G2020 | Section 8 (Page 4 - PIXMA G series) | Consumer replaceable-cartridge tank |
| `CANON-MT-G3010` | Canon | PIXMA G3010 | Section 8 (Page 4 - PIXMA G series) | Consumer wireless 3-in-1 tank |
| `CANON-MT-G3020` | Canon | PIXMA G3020 | Section 8 (Page 4 - PIXMA G series) | Consumer wireless economy tank |
| `CANON-MT-G3730` | Canon | PIXMA G3730 | Sections 10.1, 10.2, 10.3 (Pages 5, 6, 7) | **Primary Benchmark SKU for Canon** |
| `CANON-MT-G4010` | Canon | PIXMA G4010 | Section 8 (Page 4 - PIXMA G series) | SMB ADF fax tank |
| `CANON-MT-G7070` | Canon | PIXMA G7070 | Section 8 (Page 4 - PIXMA G series) | High-volume SMB duplex ADF tank |
| `BROTHER-IB-T220`| Brother| DCP-T220 | Section 8 (Page 4 - DCP-T series) | Entry consumer 3-in-1 tank |
| `BROTHER-IB-T420W`| Brother| DCP-T420W | Section 8 (Page 4 - DCP-T series) | Consumer wireless tank |
| `BROTHER-IB-T520W`| Brother| DCP-T520W | Sections 10.1, 10.2, 10.3 (Pages 5, 6, 7) | **Primary Benchmark SKU for Brother** |
| `BROTHER-IB-T720DW`| Brother| DCP-T720DW | Section 8 (Page 4 - DCP-T series) | SMB auto-duplex ADF tank |
| `BROTHER-IB-T820DW`| Brother| DCP-T820DW | Section 8 (Page 4 - DCP-T series) | SMB duplex ADF LAN tank |
| `BROTHER-IB-T920DW`| Brother| MFC-T920DW | Section 8 (Page 4 - Brother InkBenefit) | Top SMB 4-in-1 duplex ADF tank |

---

## D. Aliases & Retailer Title Normalization Patterns

Every SKU maintains exhaustive alias patterns to match Thai and English marketplace product titles:

* **HP Smart Tank 580:** `Smart Tank 580 All-in-One`, `HP 580 Smart Tank`, `HP 580 Wireless`, `HP Smart Tank 580`, `Smart Tank 580 Wireless All-in-One`.
* **Epson EcoTank L3250:** `EcoTank L3250 Wi-Fi`, `L3250 All-in-One`, `Epson L3250`, `L3250 EcoTank`, `EcoTank L3250 Wireless`.
* **Canon PIXMA G3730:** `PIXMA G3730 MegaTank Wi-Fi`, `Canon G3730 All-in-One`, `G3730`, `Canon PIXMA G3730`, `PIXMA G3730 Wireless`.
* **Brother DCP-T520W:** `DCP-T520W Refill Tank All-in-One`, `Brother T520W`, `DCP-T520W`, `Brother DCP-T520W`, `T520W`, `DCP-T520W Wireless`.

---

## E. Explicit Competitor Mappings

* **Primary Home Wireless 3-in-1 Tier:**
  * `HP Smart Tank 580` $\longleftrightarrow$ `Epson EcoTank L3250` $\longleftrightarrow$ `Canon PIXMA G3730` $\longleftrightarrow$ `Brother DCP-T520W`.
* **Entry Home USB 3-in-1 Tier:**
  * `HP Smart Tank 315` / `515` $\longleftrightarrow$ `Epson EcoTank L3210` $\longleftrightarrow$ `Canon PIXMA G2010` / `G2020` $\longleftrightarrow$ `Brother DCP-T220`.
* **SMB Auto-Duplex Tier:**
  * `HP Smart Tank 670` / `720` $\longleftrightarrow$ `Epson EcoTank L4260` $\longleftrightarrow$ `Brother DCP-T720DW`.
* **SMB ADF / Office Tier:**
  * `HP Smart Tank 750` $\longleftrightarrow$ `Epson EcoTank L5290` / `L6270` $\longleftrightarrow$ `Canon PIXMA G4010` / `G7070` $\longleftrightarrow$ `Brother MFC-T920DW`.

---

## F. Fields Intentionally Unspecified / Null

In accordance with strict non-fabrication constraints:
1. **Launch RRP:** Explicitly left as `null` for models where official launch RRP was not documented in the brief or verified technical specs.
2. **Claimed Benefits:** Null for models without explicitly cited manufacturer marketing bullet points in the brief.
3. **Competitor Equivalents:** Represented as `null` for specialized models with no direct 1:1 equivalent (e.g. Epson A3+ `L15150` or Canon single-function `G1010`).

---

## G. Ambiguous SKU Naming & Resolution Strategy

* **Ambiguity Handling:** When raw title text lacks model numbers (e.g. *"HP Smart Tank Wireless Series"*), `resolveSku` returns `status: 'AMBIGUOUS'` with `confidence: 0.4`, preventing false assignment.
* **Contamination Defense:** Titles containing negative tokens (e.g. *"HP GT53 ink bottle for Smart Tank 580"*) return `status: 'UNRESOLVED'` with `confidence: 0.0`, ensuring consumables are never counted as hardware printers.

---

## H. Codebase & Specification Alignment Audit

* **Single Source of Truth:** Refactored `src/config/brands.ts` to re-export from `src/config/skus.ts`. There are zero duplicate or competing SKU definitions in the codebase.
* **Public Immutable API:** Exposed `getAllSkus()`, `getSkusByBrand()`, `getSkuById()`, `isCanonicalSku()`, and `getCompetitorEquivalents()`.

---

## I. SKUs Removed or Replaced
* Zero valid SKUs were removed. All 28 canonical SKUs are fully retained and strictly validated.

---

## J. Future Human Decisions / Open Items
1. **Catalog Expansion for Unlisted Models:** If future crawlers encounter valid Ink Tank printers (e.g. *HP Smart Tank 790* or *Brother DCP-T425W*), the system outputs `UNRESOLVED` with brand/family preserved, allowing verified human review before expanding `src/config/skus.ts`.
