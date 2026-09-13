"""
QUARANTINED: scrape_consumer_reviews.py
========================================

STATUS: INVALID_SYNTHETIC — THIS SCRIPT MUST NOT BE EXECUTED

FORENSIC AUDIT FINDING (2026-09-11):
--------------------------------------
This script was confirmed to generate 456 SYNTHETIC consumer review records
using 36 hardcoded templates cyclically assigned across 24 SKUs using modulo
logic: `(m_idx + d_idx) % len(templates)`.

CRITICAL VIOLATIONS IDENTIFIED:
- REVIEW_CORPUS: 36 hardcoded Thai-language review templates
- Cyclic SKU assignment: same template text applied to unrelated products
- Fabricated dates: static DATE_SCHEDULE used as `published_at` (source date)
- Fabricated ratings: hardcoded `rating` values in templates
- Fabricated identities: hardcoded `reviewer` persona names
- False extraction method: `"Live Scrapling Web Ingestion"` (no actual retrieval)
- Hardcoded confidence: `confidence_score = 0.98` (no methodology)
- False purchase verification: records tagged `"Verified Purchase"` with no evidence
- URL contamination: real Pantip thread URLs attached to non-matching text
- Cross-SKU contamination: same quote applied to unrelated SKUs via modulo

REMEDIATION:
-------------
All 456 synthetic records have been quarantined from the Evidence Lake.
The Evidence Lake now contains ONLY real source-backed records.

The original script has been preserved in:
  scripts/crawlers/__quarantine__/scrape_consumer_reviews.SYNTHETIC_QUARANTINED.py

To retrieve REAL consumer reviews, implement platform-specific adapters:
  - PantipAdapter: Use Playwright for dynamic page rendering
  - ShopeeAdapter: Extract from actual product review carousels
  - LazadaAdapter: Extract from actual product review sections
  - JIBAdapter: Extract from actual product review pages

PROVENANCE REQUIREMENTS for any real review record:
  - source_url: actual canonical URL of the specific review/comment
  - source_retrieved_at: timestamp of actual HTTP retrieval
  - raw_content_original: exact source text (immutable)
  - extraction_method: describes actual retrieval mechanism
  - provenance_status: VERIFIED_EXACT | VERIFIED_TRANSFORMED | PARTIAL | THREAD_ONLY | UNVERIFIED
  - purchase_verification: must come from platform-provided signal, not inferred

DO NOT re-enable this script or restore its synthetic generation logic.
DO NOT use this file as a template for new review ingestion.

If real evidence cannot be obtained: record provenance_status = "UNOBSERVED"
"""

import sys

if __name__ == '__main__':
    print(
        "\n[QUARANTINED] scrape_consumer_reviews.py is DISABLED.\n"
        "\nThis script previously generated 456 SYNTHETIC consumer review records\n"
        "using hardcoded templates with cyclic SKU assignment, fake dates, fake ratings,\n"
        "fake identities, and false 'Live Scrapling Web Ingestion' extraction claims.\n"
        "\nAll synthetic records have been removed from the Evidence Lake.\n"
        "\nTo add real consumer reviews, implement source-specific adapters with\n"
        "genuine retrieval, provenance tracking, and validated evidence records.\n"
        "\nSee scripts/crawlers/__quarantine__/ for the preserved original.\n",
        file=sys.stderr
    )
    sys.exit(1)
