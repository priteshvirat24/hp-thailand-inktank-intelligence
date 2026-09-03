# Web Evidence Provenance & End-to-End Lineage

**Phase:** Internet Evidence Acquisition Layer  
**Reference:** HP Thailand Ink Tank POC

---

## 1. Web Provenance Model

Every piece of evidence acquired from the web carries an immutable provenance record:

```typescript
export interface WebProvenance {
  acquisition_method: AcquisitionStrategy; // e.g. DIRECT_HTTP, BRIGHTDATA_UNLOCKER
  acquisition_provider: string;           // e.g. DIRECT, BRIGHTDATA, APIFY
  acquisition_strategy: AcquisitionStrategy;
  requested_url: string;                  // Original input target
  final_url: string;                      // Post-redirect canonical URL
  canonical_url: string | null;           // HTML <link rel="canonical">
  captured_at: string;                    // UTC ISO timestamp
  content_hash: string;                   // SHA-256 hash of response payload
  source_type: 'JSON_LD' | 'HTML_META' | 'DOM_RENDERED' | 'CUSTOM_ADAPTER';
  source_quality: SourceQuality;          // OFFICIAL_BRAND, MARKETPLACE, RETAILER, etc.
  crawl_id?: string;                      // Session correlation ID
  extraction_method: string;              // Extractor used
  parser_version: string;
}
```

---

## 2. Lineage Chain

$$\text{RAG Answer} \longrightarrow \text{Metric Row} \longrightarrow \text{evidence\_id} \longrightarrow \text{Raw Evidence} \longrightarrow \text{Web Provenance} \longrightarrow \text{Deep URL}$$
