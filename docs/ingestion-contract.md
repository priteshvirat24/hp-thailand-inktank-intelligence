# Ingestion Pipeline Contract & Error Taxonomy

**Document:** Ingestion Contract  
**Phase:** 2B  
**Single Source of Truth:** [src/services/scrapers/ingestionPipeline.ts](file:///Users/priteshhome/InkTank-analysis%20/src/services/scrapers/ingestionPipeline.ts)  

---

## 1. Lifecycle Ingestion Stages

Every raw crawled payload transitions through 8 mandatory stages:

1. **Discovery:** Discovers seed targets from [src/config/seeds.ts](file:///Users/priteshhome/InkTank-analysis%20/src/config/seeds.ts).
2. **Extraction:** Specialized `ScraperAdapter` transforms raw HTML/JSON into typed `RawObservation[]`.
3. **Date Normalization:** Thai Buddhist Era dates (e.g. `2569-07-15`) are converted to Gregorian ISO (`2026-07-15`).
4. **Category Gatekeeping:** `classifyPrinterItem` rejects non-target brands, cartridges (DeskJet), laser printers, and standalone ink bottles.
5. **SKU Normalization:** `resolveSku` maps product titles to canonical 28-SKU master records.
6. **Evidence Hashing:** `generateDeterministicEvidenceId` generates reproducible SHA-256 evidence keys.
7. **Schema Validation:** Strict Zod validation via `validateEvidenceRecord`.
8. **Idempotent Persistence:** Writes record to `EvidenceStore`, tracking new vs. duplicate observations.

---

## 2. Ingestion Error Taxonomy

Pipeline failures are categorized without crashing the crawl run:

| Error Code | Meaning / Root Cause |
| :--- | :--- |
| `DISCOVERY_FAILED` | Seed target could not be resolved from registry. |
| `FETCH_FAILED` | Network failure during HTTP / provider execution. |
| `PROVIDER_FAILED` | Apify Actor or Bright Data proxy returned error or unconfigured key. |
| `PARSE_FAILED` | Adapter could not extract required fields from raw payload. |
| `CLASSIFICATION_FAILED` | Unexpected exception in 6-gate classification logic. |
| `SKU_RESOLUTION_FAILED` | Normalizer threw an unhandled exception. |
| `VALIDATION_FAILED` | Record failed strict Zod schema validation (e.g. invalid URL, invalid date). |
| `RATE_LIMITED` | Target platform or provider returned 429 Too Many Requests. |
| `AUTHENTICATION_FAILED` | Missing or invalid API credentials. |

---

## 3. Ingestion Report Contract

Every crawl execution emits a structured `IngestionReport`:

```typescript
interface IngestionReport {
  crawl_run_id: string;
  source_id: string;
  provider: ScraperProviderName;
  target_count: number;
  discovered: number;
  fetched: number;
  extracted: number;
  accepted: number;
  rejected: number;
  unresolved_sku: number;
  ambiguous_sku: number;
  duplicate: number;
  failed: number;
  persisted_records: RawEvidenceRecord[];
  errors: IngestionError[];
  started_at: string;
  completed_at: string;
}
```
