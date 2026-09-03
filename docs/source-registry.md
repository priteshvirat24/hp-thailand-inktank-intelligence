# Authoritative Source & Seed Registry

**Document:** Source Registry & Crawl Targets  
**Scope:** Thailand Ink Tank Competitive Intelligence (HP, Epson, Canon, Brother)  
**Configuration Files:** [src/config/sources.ts](file:///Users/priteshhome/InkTank-analysis%20/src/config/sources.ts), [src/config/seeds.ts](file:///Users/priteshhome/InkTank-analysis%20/src/config/seeds.ts)  

---

## 1. Source Priorities & Extraction Strategies

| Source ID | Platform | Channel | Priority | Preferred Provider | Crawling Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `src-meta-ads` | Meta | Paid Media | **Mandatory** | Apify | Meta Ad Library Thailand country query filter |
| `src-google-ads` | Google Ads | Paid Media | **Mandatory** | Apify | Google Ads Transparency advertiser domain lookup |
| `src-shopee-th` | Shopee | E-commerce | **Priority 1 (Mandatory)** | Bright Data | Shopee Mall official brand store catalog extraction |
| `src-lazada-th` | Lazada | E-commerce | **Priority 2 (Mandatory)** | Bright Data | LazMall official flagship store catalog extraction |
| `src-tiktok-shop-th`| TikTok Shop | E-commerce | **Priority 3 (Mandatory)** | Apify | TikTok Shop brand account promo / product listing |
| `src-jib-th` | JIB | E-commerce | **Priority 4 (Mandatory)** | Bright Data | Specialist IT Retailer Ink Tank category extraction |
| `src-facebook-th` | Facebook | Social | **Mandatory** | Apify | Official Thailand Brand Facebook page posts & engagement |
| `src-instagram-th`| Instagram | Social | **Mandatory** | Apify | Official Thailand Brand Instagram handle media & captions |
| `src-youtube-th` | YouTube | Social | **Mandatory** | Apify | Official Thailand Brand YouTube channel video uploads |
| `src-tiktok-brand-th`| TikTok | Social | **Secondary** | Apify | Brand short-form video monitoring |
| `src-linkedin-th` | LinkedIn | Social | **Secondary** | Apify | Brand B2B / SMB corporate announcements |
| `src-advice-th` | Advice | E-commerce | **Secondary** | Direct / BD | Secondary IT distributor pricing catalog |
| `src-powerbuy-th` | Power Buy | E-commerce | **Secondary** | Direct / BD | Retail chain catalog pricing |
| `src-consumer-forums`| Forums | Review | **DROPPED** | None | Dropped per Brief Section 9 (Data Cut 5) |

---

## 2. Seed Target Registry (33 Official Targets)

All official targets are pre-configured in [src/config/seeds.ts](file:///Users/priteshhome/InkTank-analysis%20/src/config/seeds.ts) with direct brand mappings and Thailand locale constraints.
