# Domain Crawlability States & Diagnostic Scoring

**Phase:** Internet Evidence Acquisition Layer  
**Reference:** HP Thailand Ink Tank POC

---

## 1. Crawlability Status Taxonomy

Crawlability is evaluated on an explicit, non-binary scale:

| Status | Meaning & Next Action |
|---|---|
| `EASY` | Public static HTML site readily accessible via direct server HTTP. |
| `RENDER_REQUIRED` | Client-side rendered JavaScript shell; requires DOM evaluation or Browser API. |
| `BROWSER_REQUIRED` | Complex multi-step interaction, scrolling, or dynamic button clicks required. |
| `PROVIDER_REQUIRED` | Heavy anti-bot / WAF / Cloudflare protections requiring proxy unlocker. |
| `BLOCKED` | Hard 403 Forbidden or persistent CAPTCHA block. |
| `AUTH_REQUIRED` | Login gate or private intranet resource; acquisition stopped. |
| `ROBOTS_DISALLOWED` | Explicitly forbidden under domain `robots.txt` rules. |
| `NOT_FOUND` | HTTP 404 resource missing. |
| `UNSUPPORTED` | Binary media, audio, or unsupported streaming content. |
| `UNKNOWN` | Domain unprofiled or network unreachable. |
