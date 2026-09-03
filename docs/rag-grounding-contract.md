# Grounded RAG Answer Contract & Anti-Hallucination Guardrails

**Phase:** 4A (RAG Retrieval, Embedding Pipeline & Strategic Intelligence Engine)  
**Authoritative Reference:** `HP Thailand Ink Tank Technical Implementation Brief_v2.pdf`

---

## 1. Grounding Principles & Non-Negotiable Rules

The HP Thailand Competitive Intelligence RAG Engine is not a generic chatbot. It is a specialized, evidence-grounded strategic intelligence tool.

### Rule 1: No Synthetic Data or Hallucination
* Every factual number (prices, ad counts, discounts, SOV %, ratings) must originate from a verified `RawEvidenceRecord` or an aggregated row in the `AnalyticalMetricCube`.
* If a metric cell has no underlying observations, the engine discloses it as `MISSING` or `INSUFFICIENT_EVIDENCE`.

### Rule 2: Missing Data Semantics (`null ≠ 0`)
* The system never converts `null` into `0`, `0%`, or `฿0`.
* Missing evidence is explained transparently: *"No verified ad count is available for the requested period."*

### Rule 3: Sales Traction Labeling Invariant
* Marketplace cumulative sold badges (e.g. Shopee "1.2k sold") are lifetime counters.
* The RAG engine strictly refers to this metric as the **"Observable Cumulative Sales Traction Index"** and never describes it as "monthly sales" or "units sold in August".

### Rule 4: Temporal Alignment
* Analysis is bounded to the 90-day window (**28 May 2026 – 28 August 2026**).
* Late-May baseline observations roll into **June 2026 (`2026-06`)**. May is not treated as a separate analytical month.

---

## 2. Evidence & Metric Lineage Model

The engine maintains complete dual lineage from high-level strategic takeaways back to raw evidence:

$$\begin{aligned}
\text{Strategic Answer} &\longrightarrow \text{Supporting Evidence Card} \longrightarrow \text{evidence\_id} \longrightarrow \text{Raw Evidence Record} \longrightarrow \text{Deep URL} \\
\text{Strategic Answer} &\longrightarrow \text{Analytical Metric Row} \longrightarrow \text{metric\_id} \longrightarrow \text{evidence\_ids} \longrightarrow \text{Raw Evidence Record}
\end{aligned}$$

---

## 3. Empty Store Behavior

If the Evidence Lake has 0 records (e.g. prior to live crawler execution):
* The engine returns an informative empty state:
  > *"No verified evidence is currently available in the Evidence Lake. Please execute a targeted crawl (e.g. Meta Ads, Google Ads, Shopee, Lazada, TikTok Shop, JIB) to populate real Thai market observations before generating strategic insights."*
* Zero synthetic SWOT items or fabricated numbers are generated.
