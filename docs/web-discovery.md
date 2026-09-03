# Internet Evidence Discovery & SERP Candidate Generation

**Phase:** Internet Evidence Acquisition Layer  
**Reference:** HP Thailand Ink Tank POC

---

## 1. Discovery Modes

The discovery layer supports 3 target generation channels:

1. **Explicit Seed URLs:** Direct target URLs provided by operators (e.g. `https://www.hp.com/th-th/printers/smart-tank-580.html`).
2. **Search / SERP Query Discovery:** Natural language search queries (e.g. `"HP Smart Tank 580 ราคา"`, `"Epson EcoTank L3250 Shopee"`) expanded across top Thai retail and marketplace domains.
3. **Domain Sitemap & Internal Link Crawling:** Automated parsing of `robots.txt`, `sitemap.xml`, and page `<a href="...">` links bounded to `max_depth` and same-domain boundaries.

---

## 2. Tracking Parameter Normalization

All discovered links are filtered to remove non-identifying tracking parameters while preserving product identity:

* **Removed Tracking Parameters:** `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `fbclid`, `gclid`, `gclsrc`, `dclid`, `zanpid`, `msclkid`, `mc_eid`, `_ga`, `_gl`, `ref`, `spm`, `spm_id`, `from_source`, `yclid`, `wickedid`, `twclid`.
* **Preserved Semantic Parameters:** `item_id`, `shop_id`, `id`, `v`, `p`, `sku`, `product_id`, `model`, `category`.
