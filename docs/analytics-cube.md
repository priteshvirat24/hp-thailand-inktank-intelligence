# Analytical Metric Cube Specification

**Document:** Analytics Cube & Aggregation Engine  
**Phase:** 2C  
**Authoritative Brief Reference:** `HP Thailand Ink Tank Technical Implementation Brief_v2.pdf` (Sections 4, 8, 9, 12)  

---

## 1. Multi-Dimensional Cube Dimensions

The analytical system structures all competitive intelligence data along 6 primary orthogonal dimensions:

$$\text{Analytical Cube} = \text{Brand} \times \text{Analytical Month} \times \text{Channel} \times \text{Platform} \times \text{SKU} \times \text{Metric}$$

| Dimension | Domain Values |
| :--- | :--- |
| **Brand** | `HP`, `Epson`, `Canon`, `Brother` (4 target brands) |
| **Analytical Month** | `2026-06`, `2026-07`, `2026-08` (Late May baseline `2026-05-28..31` assigned to `2026-06`) |
| **Channel** | `Paid Media`, `Social`, `E-commerce`, `Consumer Review`, `All` |
| **Platform** | `Meta`, `Google Ads`, `Shopee`, `Lazada`, `TikTok Shop`, `JIB`, `Facebook`, `Instagram`, `YouTube`, `All` |
| **SKU** | 28 Canonical SKUs (e.g. `Smart Tank 580`, `EcoTank L3250`, `PIXMA G3730`, `DCP-T520W`) or `All` |
| **Metric** | 18 Specialized Metric IDs across 5 Data Cuts |

---

## 2. Metric Registry & Aggregation Semantics

### Data Cut 1: Online Visibility / Share of Voice (SOV)
* **`AD_PRESENCE_COUNT` (Count):** Count of active paid ad creatives.
* **`SOCIAL_POSTS_COUNT` (Count):** Count of published brand-owned social posts.
* **`ECOMMERCE_LISTINGS_COUNT` (Count):** Count of verified in-scope Ink Tank marketplace listings.
* **`PAID_MEDIA_SOV` (Percentage):** $\frac{\text{Brand Active Ads in Month}}{\sum \text{All Category Active Ads in Month}} \times 100$.
* **`SOCIAL_SOV` (Percentage):** $\frac{\text{Brand Social Posts in Month}}{\sum \text{All Category Social Posts in Month}} \times 100$.
* **`ECOMMERCE_SOV` (Percentage):** $\frac{\text{Brand E-Com Listings in Month}}{\sum \text{All Category E-Com Listings in Month}} \times 100$.
* **`TOTAL_VISIBILITY_TOUCHPOINTS` (Count):** Sum of active ads, social posts, and marketplace listings.

### Data Cut 2: Advertising / Creatives
* **`CREATIVE_FORMAT_VIDEO_COUNT` (Count):** Count of ad creatives using video assets.
* **`CREATIVE_FORMAT_STATIC_COUNT` (Count):** Count of static image ad creatives.
* **`CREATIVE_FORMAT_CAROUSEL_COUNT` (Count):** Count of multi-slide carousel ad creatives.

### Data Cut 3: Social Media Activity
* **`TOTAL_SOCIAL_ENGAGEMENT` (Count):** Sum of observable comments/replies across captured social posts.
* **`AVG_ENGAGEMENT_PER_POST` (Score):** Mean engagement per published post.

### Data Cut 4: E-Commerce Presence, Pricing & Promos
* **`AVG_SELLING_PRICE_THB` (THB):** Mean current selling price. Missing listings evaluate to `null` (never fake zero).
* **`MEDIAN_SELLING_PRICE_THB` (THB):** 50th percentile of observed selling prices.
* **`MIN_SELLING_PRICE_THB` (THB):** Lowest observed marketplace price.
* **`MAX_SELLING_PRICE_THB` (THB):** Highest observed marketplace price.
* **`AVG_DISCOUNT_PCT` (Percentage):** Mean discount % on active promotional listings.
* **`PROMO_PENETRATION_PCT` (Percentage):** $\frac{\text{Listings with Active Discount}}{\text{Total E-Commerce Listings}} \times 100$.
* **`ACTIVE_OFFICIAL_STORES_COUNT` (Count):** Verified listings from official flagship stores.
* **`OBSERVABLE_SALES_TRACTION_INDEX` (Index):** Normalized index derived from cumulative sales counters (e.g. "1.2k sold"). **Preserved strictly as an observable cumulative traction signal, never converted to monthly POS volume.**

### Data Cut 5: Consumer Review Sentiment
* **`AVG_CONSUMER_RATING` (Score):** Mean star rating (1.00 to 5.00) from verified buyer reviews.
* **`TOTAL_CONSUMER_REVIEWS_COUNT` (Count):** Total verified buyer reviews.

---

## 3. Missing Data vs. Zero Semantics

* **Observed Zero:** Valid observation where count/value is explicitly zero (e.g. `0` ads observed when crawling was executed).
* **Missing (`null`):** No observations were collected for that specific brand/SKU/month/metric (e.g. no prices captured -> `null`, not `0 THB`).
* **Data States:** Every `AnalyticalMetricRow` carries an explicit `data_state`:
  * `'OBSERVED'`
  * `'MISSING'`
  * `'INSUFFICIENT_EVIDENCE'`
  * `'NOT_APPLICABLE'`

---

## 4. Evidence Lineage & Audit Trail

Every `AnalyticalMetricRow` retains an array of source evidence IDs:
$$\text{evidence\_ids}: [\text{'EVID-SHOPEE-8F9210B3A1C4'}, \dots]$$
This allows the dashboard and RAG system to drill down from any aggregated number directly to the original Thai listing, publication date, and source URL.
