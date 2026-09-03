# Web Security, SSRF Prevention & Safe Crawling Policies

**Phase:** Internet Evidence Acquisition Layer  
**Reference:** HP Thailand Ink Tank POC

---

## 1. SSRF Prevention Guardrails

Before making any HTTP network request, all candidate URLs pass through `validateUrlSafety`:

* **Allowed Protocols:** Only `http:` and `https:`. All other protocols (`file:`, `ftp:`, `javascript:`, `data:`, `about:`, `chrome:`) are hard blocked.
* **Blocked Localhost & Loopback:** `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`.
* **Blocked Cloud Metadata:** `169.254.169.254`, `instance-data`, `metadata.google.internal`.
* **Blocked Private IPv4 Subnets:** `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
* **Blocked Internal TLDs:** `.internal`, `.local`, `.onion`, `.corp`, `.lan`, `.home`.
* **Redirect Re-Validation:** Every hop in an HTTP redirect chain is re-validated against the SSRF policy before following.

---

## 2. Robots.txt Compliance & Rate Limiting

* **Robots Compliance:** The system parses `robots.txt` and honors `Disallow:` directives for `*` and custom crawler agents.
* **Domain Throttling:** Enforces a minimum 250ms spacing between requests to the same domain, with exponential backoff on HTTP 429 (`Rate Limited`).
