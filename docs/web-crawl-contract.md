# Web Crawl Contract & Execution Protocol

**Phase:** Internet Evidence Acquisition Layer  
**Reference:** HP Thailand Ink Tank POC

---

## 1. Crawl Session Contract (`CrawlSession`)

Every crawl operation produces a structured session report tracking execution health, acquisition funnels, and evidence yields:

```typescript
export interface CrawlSession {
  crawl_id: string;              // Deterministic ID (e.g. CRAWL-2026-08-29-XXXX)
  started_at: string;            // ISO timestamp
  completed_at: string | null;   // ISO timestamp
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'STOPPED';
  requested_targets: string[];   // Seed URLs or query strings
  discovered_urls: string[];     // All discovered URLs within domain/sitemaps
  acquired_urls: string[];       // Successfully fetched URLs
  successful_pages: number;      // HTTP 200 with extracted business content
  partial_pages: number;         // Partial content or JS shell fallback
  failed_pages: number;          // 404, 500, or network timeouts
  blocked_pages: number;         // 403, Cloudflare challenges, robots disallowed
  evidence_created: number;      // Validated records added to Global Evidence Store
  evidence_duplicates: number;   // Deduplicated identical observations
  evidence_rejected: number;     // Contamination gate rejections (bottles, cartridges)
  unresolved_skus: number;       // Observed tank models not matching 28 canonical SKUs
  provider_usage: Record<string, number>;
  strategy_usage: Record<string, number>;
  error_summary: Record<string, number>;
  created_evidence_ids: string[];
  budget: CrawlBudget;
}
```

---

## 2. Bounded Crawl Budget

To prevent infinite loops or accidental mass crawling, all crawls enforce default budget limits:
* `max_pages`: Default 50 pages.
* `max_depth`: Default 2 link hops.
* `max_runtime_ms`: 60,000ms (60 seconds).
* `max_bytes`: 10MB payload transfer.
* `max_provider_requests`: 20 external proxy/browser calls.
