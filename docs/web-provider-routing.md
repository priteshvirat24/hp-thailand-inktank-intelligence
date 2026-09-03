# Acquisition Strategy Routing & Automated Escalation

**Phase:** Internet Evidence Acquisition Layer  
**Reference:** HP Thailand Ink Tank POC

---

## 1. Routing Matrix

The system dynamically determines the optimal acquisition provider and strategy based on domain classification and response telemetry:

```
[Target URL]
     │
     ├── Domain in {shopee.co.th, lazada.co.th, tiktok.com} ──► BRIGHTDATA_UNLOCKER
     ├── Domain in {facebook.com, instagram.com, youtube.com} ──► APIFY_HTTP / APIFY_BROWSER
     └── All Other Domains ──► DIRECT_HTTP
                                    │
                                    ├── HTTP 403 / 429 ──► Escalate to BRIGHTDATA_UNLOCKER
                                    └── JS Shell (<150 text) ──► Escalate to BRIGHTDATA_BROWSER
```

---

## 2. Automated Provider Escalation

If direct HTTP fails due to anti-bot measures (Cloudflare, HTTP 403, HTTP 429) or returns an empty client-side rendered JavaScript shell, the acquisition engine automatically escalates through configured providers with bounded retries and explicit rationale logging.
