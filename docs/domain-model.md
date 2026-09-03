# Authoritative Domain Model Specification

**Project:** HP Thailand Ink Tank Competitive Intelligence POC  
**Specification Version:** v2.0 (Authoritative Implementation Contract)  
**Baseline Date:** 28 August 2026  
**Temporal Window:** 28 May 2026 – 28 August 2026 (Primary Analytical Months: June, July, August 2026)  

---

## 1. Category Definition & Boundaries

### 1.1 In-Scope Hardware Category
* **Target Category:** **Refillable Ink Tank Printers only** (Inkjet hardware engineered with built-in, continuous, refillable internal ink tanks filled directly from ink bottles).
* **Target Brands & Canonical Families:**
  * **HP:** *Smart Tank* (e.g., Smart Tank 580, 515, 670, 720, 750, 315, 415)
  * **Epson:** *EcoTank* (e.g., EcoTank L3210, L3250, L3256, L4260, L5290, L6270, L15150)
  * **Canon:** *MegaTank / PIXMA G-Series* (e.g., PIXMA G1010, G2010, G2020, G3010, G3020, G3730, G4010, G7070)
  * **Brother:** *InkBenefit / Refill Tank / DCP-T & MFC-T Series* (e.g., DCP-T220, DCP-T420W, DCP-T520W, DCP-T720DW, DCP-T820DW, DCP-T920DW, MFC-T920DW)
* **Target Audiences:**
  1. Consumers (Home, Student, Family)
  2. Micro / Small Business (SMB under 100 employees)

### 1.2 Out-of-Scope Hardware & Hard Exclusions
* **Cartridge Inkjet Printers:** Printers requiring disposable plastic ink cartridges (e.g., HP DeskJet, Canon PIXMA TS/MG/E series, Epson Expression).
* **Laser / Toner Printers:** Electrophotographic printers (e.g., HP LaserJet, Canon imageCLASS, Brother HL-L/DCP-L/MFC-L).
* **Standalone Consumables Alone:** Refill ink bottles sold separately without printer hardware (e.g., Epson 003/664, HP GT52/GT53, Canon GI-790/GI-71, Brother BTD60/BT5000).
* **Accessories & Spare Parts:** Replacement printheads, maintenance waste ink boxes, rollers, cables, photo paper, sublimation ink, and ribbons.

---

## 2. Positive & Negative Classification Signals

### 2.1 Positive Lexicon (English & Thai)
* **English Terms:** `Ink Tank`, `InkTank`, `Smart Tank`, `SmartTank`, `Eco Tank`, `EcoTank`, `Mega Tank`, `MegaTank`, `InkBenefit`, `Refill Tank`, `Refillable ink`, `Tank printer`, `Refillable reservoir`.
* **Thai Terms:** `แท็งก์หมึก`, `แทงค์หมึก`, `เครื่องพิมพ์แท็งก์หมึก`, `ปริ้นเตอร์เติมหมึก`, `เครื่องพิมพ์เติมหมึก`, `แท็งก์แท้`, `สมาร์ทแท็งก์`, `อีโค่แท็งก์`, `เมกะแท็งก์`, `อิงค์เบเนฟิต`.

### 2.2 Negative Exclusion Lexicon
* **Cartridge Keywords:** `DeskJet`, `Envy`, `PIXMA TS`, `PIXMA MG`, `หมึกตลับ`, `ตลับหมึก`, `เดสก์เจ็ท`.
* **Laser/Toner Keywords:** `LaserJet`, `Laser 107`, `imageCLASS`, `HL-L`, `DCP-L`, `MFC-L`, `Laser Printer`, `toner`, `ผงหมึก`, `โทนเนอร์`, `เลเซอร์`.
* **Consumables Alone:** `bottle only`, `refill ink`, `เฉพาะขวดหมึก`, `หมึกเติมขวด`, `003`, `664`, `GT52`, `GT53`, `GI-790`, `GI-71`, `BTD60`, `BT5000`.
* **Accessories:** `printhead`, `maintenance box`, `photo paper`, `sublimation`, `หัวพิมพ์`, `กล่องซับหมึก`, `กระดาษโฟโต้`.

---

## 3. Classification Decision Engine (6-Gate Pipeline)

The classifier (`src/services/classification/classifier.ts`) outputs a strongly typed decision contract:

```
[Raw Scraped Listing / Ad]
           │
           ▼
[Gate 1: Brand Detection] ──(No Match)──► REJECT (Non-target brand)
           │
           ▼
[Gate 2: Negative Exclusion] ──(Cartridge/Laser/Bottle)──► REJECT (Explicit negative match)
           │
           ▼
[Gate 3: Positive Tank Signal]
           │
           ▼
[Gate 4: SKU Registry Match]
           │
           ▼
[Gate 5: Price Floor Assessment (฿2,500)]
           │
           ▼
[Gate 6: Decision Synthesis]
   ├── ACCEPT: Positive Tank Signal + Hardware Plausible (฿2,500–฿25,000 or null)
   ├── REVIEW:
   │    ├── Ambiguous model code without Tank keyword (e.g. "HP 580")
   │    ├── Positive signal but Price < ฿2,500 (Promotional anomaly vs accessory)
   │    └── Positive signal but Price > ฿25,000 (Commercial/large-format check)
   └── REJECT: No positive tank keyword and no SKU match
```

---

## 4. Brand Normalization Rules

Latin comparisons are strictly case-insensitive:

| Canonical Brand | English Variants | Thai Variants |
| :--- | :--- | :--- |
| **HP** | `HP`, `hp`, `Hewlett Packard`, `hewlett packard` | `เอชพี`, `เครื่องพิมพ์ เอชพี` |
| **Epson** | `Epson`, `epson`, `EPSON` | `เอปสัน`, `เครื่องพิมพ์ เอปสัน` |
| **Canon** | `Canon`, `canon`, `CANON` | `แคนนอน`, `เครื่องพิมพ์ แคนนอน` |
| **Brother** | `Brother`, `brother`, `BROTHER` | `บราเดอร์`, `เครื่องพิมพ์ บราเดอร์` |

---

## 5. Canonical 28-SKU Master Registry

| Brand | Model Name | Family | Segment | Launch RRP (THB) | Known Competitor Equivalents |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **HP** | Smart Tank 580 | Smart Tank | Consumer / Home | ฿5,590 | EcoTank L3250, PIXMA G3730, DCP-T520W |
| **HP** | Smart Tank 515 | Smart Tank | Consumer / Home | ฿5,290 | EcoTank L3210, PIXMA G3020 |
| **HP** | Smart Tank 670 | Smart Tank | SMB (<100 emp) | ฿6,990 | EcoTank L4260, DCP-T720DW |
| **HP** | Smart Tank 720 | Smart Tank | SMB (<100 emp) | ฿7,990 | EcoTank L4260, DCP-T720DW |
| **HP** | Smart Tank 750 | Smart Tank | SMB (<100 emp) | ฿8,990 | EcoTank L5290, PIXMA G4010, MFC-T920DW |
| **HP** | Smart Tank 315 | Smart Tank | Consumer / Home | ฿3,990 | EcoTank L3210, PIXMA G2010, DCP-T220 |
| **HP** | Smart Tank 415 | Smart Tank | Consumer / Home | ฿4,690 | EcoTank L3250, PIXMA G3020 |
| **Epson** | EcoTank L3210 | EcoTank | Consumer / Home | ฿4,390 | Smart Tank 515, PIXMA G2020, DCP-T220 |
| **Epson** | EcoTank L3250 | EcoTank | Consumer / Home | ฿5,190 | Smart Tank 580, PIXMA G3730, DCP-T520W |
| **Epson** | EcoTank L3256 | EcoTank | Consumer / Home | ฿5,290 | Smart Tank 580, DCP-T520W |
| **Epson** | EcoTank L4260 | EcoTank | SMB (<100 emp) | ฿7,990 | Smart Tank 670, DCP-T720DW |
| **Epson** | EcoTank L5290 | EcoTank | SMB (<100 emp) | ฿9,490 | Smart Tank 750, MFC-T920DW |
| **Epson** | EcoTank L6270 | EcoTank | SMB (<100 emp) | ฿11,490 | Smart Tank 750, MFC-T920DW |
| **Epson** | EcoTank L15150| EcoTank | SMB (<100 emp) | ฿24,900 | *None (A3+ Wide-format Tank)* |
| **Canon** | PIXMA G1010 | MegaTank | Consumer / Home | ฿2,990 | *Single Function Tank* |
| **Canon** | PIXMA G2010 | MegaTank | Consumer / Home | ฿3,990 | EcoTank L3210, DCP-T220 |
| **Canon** | PIXMA G2020 | MegaTank | Consumer / Home | ฿4,290 | EcoTank L3210, Smart Tank 515 |
| **Canon** | PIXMA G3010 | MegaTank | Consumer / Home | ฿4,690 | EcoTank L3250, Smart Tank 515 |
| **Canon** | PIXMA G3020 | MegaTank | Consumer / Home | ฿4,990 | Smart Tank 580, EcoTank L3250 |
| **Canon** | PIXMA G3730 | MegaTank | Consumer / Home | ฿5,390 | Smart Tank 580, EcoTank L3250, DCP-T520W |
| **Canon** | PIXMA G4010 | MegaTank | SMB (<100 emp) | ฿7,490 | Smart Tank 750, EcoTank L5290, MFC-T920DW |
| **Canon** | PIXMA G7070 | MegaTank | SMB (<100 emp) | ฿10,990 | EcoTank L6270, MFC-T920DW |
| **Brother**| DCP-T220 | InkBenefit | Consumer / Home | ฿3,890 | EcoTank L3210, PIXMA G2010 |
| **Brother**| DCP-T420W | InkBenefit | Consumer / Home | ฿4,790 | Smart Tank 515, EcoTank L3250 |
| **Brother**| DCP-T520W | InkBenefit | Consumer / Home | ฿5,490 | Smart Tank 580, EcoTank L3250, PIXMA G3730 |
| **Brother**| DCP-T720DW | InkBenefit | SMB (<100 emp) | ฿7,490 | Smart Tank 670, EcoTank L4260 |
| **Brother**| DCP-T820DW | InkBenefit | SMB (<100 emp) | ฿8,490 | EcoTank L6270 |
| **Brother**| MFC-T920DW | InkBenefit | SMB (<100 emp) | ฿9,990 | Smart Tank 750, EcoTank L5290 |

---

## 6. Date Architecture & Temporal Normalization

* **Observation Window:** `2026-05-28` through `2026-08-28` (90 days).
* **Primary Analytical Months:**
  * `2026-06` (June 2026): Includes late May baseline (`2026-05-28` to `2026-06-30`).
  * `2026-07` (July 2026): `2026-07-01` to `2026-07-31`.
  * `2026-08` (August 2026): `2026-08-01` to `2026-08-28`.
* **Buddhist Era (BE) Conversion:**
  $$\text{Gregorian Year} = \text{Buddhist Era Year} - 543 \quad (\text{e.g., } 2569 \rightarrow 2026)$$

---

## 7. Source Configuration & Priorities

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SOURCE PRIORITY TIERS                              │
├───────────────────┬───────────────────┬───────────────────┬─────────────────────┤
│     MANDATORY     │     SECONDARY     │     OPTIONAL      │       DROPPED       │
│ - Meta Ad Library │ - Brand TikTok TH │ - Advice TH       │ - Consumer Forums   │
│ - Google Ads      │ - Brand LinkedIn  │ - Power Buy TH    │   (Pantip.com, etc.)│
│ - Facebook TH     │ - YouTube Video   │                   │                     │
│ - Instagram TH    │   Ad Crawler      │                   │                     │
│ - YouTube TH      │                   │                   │                     │
│ - Shopee TH (Mall)│                   │                   │                     │
│ - Lazada TH (Mall)│                   │                   │                     │
│ - TikTok Shop TH  │                   │                   │                     │
│ - JIB TH (Retail) │                   │                   │                     │
└───────────────────┴───────────────────┴───────────────────┴─────────────────────┘
```

---

## 8. Evidence Preservation Contract

* **Separation of Timestamps:**
  * `published_at`: Original creation date of the ad, post, or review.
  * `captured_at`: Crawl execution timestamp (UTC).
* **Deterministic Evidence ID Format:**
  $$\text{Evidence ID} = \text{EVID-}\{\text{PLATFORM}\}\text{-}\{\text{SHA256}(\text{platform} + \text{sourceUrl} + \text{publishedAt} + \text{entityId})[0..12]\}$$
  *Example:* `EVID-META-8F9210B3A1C4`

---

## 9. Analytical Metric Cube Contract

Structured along 6 dimensions: `Brand × Month × Channel × Platform × SKU × Metric`.

Supported Metrics:
1. `Unique Active Ads`
2. `Total Social Posts`
3. `Total Social Engagement`
4. `Average Selling Price (THB)`
5. `Median Selling Price (THB)`
6. `Average Discount %`
7. `Active Sellers Count`
8. `Estimated Units Sold`
9. `Share of Voice %`
10. `Positive Sentiment %`
11. `Promo Frequency`
