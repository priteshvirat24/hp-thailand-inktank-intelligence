# RAG Hybrid Retrieval Methodology & Embedding Abstraction

**Phase:** 4A (RAG Retrieval, Embedding Pipeline & Strategic Intelligence Engine)  
**Authoritative Reference:** `HP Thailand Ink Tank Technical Implementation Brief_v2.pdf`

---

## 1. Hybrid Retrieval Architecture

The retrieval system employs a multi-strategy routing architecture:

```
                          User Query
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       Quantitative Intent?           Qualitative Context?
               │                             │
               ▼                             ▼
     Analytical Cube Query         Hybrid Document Retrieval
  (SOV, Pricing, Discounts,       ┌───────────┴───────────┐
     Sales Traction Index)        ▼                       ▼
               │             Exact/Lexical          Vector Semantic
               │             (SKU, Brand,           (OpenAI/Gemini
               │             Thai Keywords)           Embeddings)
               │                  │                       │
               └───────────┬──────┴───────────────────────┘
                           │
                           ▼
                 Hybrid Fusion & Ranking
                           │
                           ▼
                  Top K Ranked Chunks
```

---

## 2. Embedding Provider Abstraction & Fallback Mode

To ensure full functionality across development and air-gapped environments, the system abstracts embedding generation through `EmbeddingProvider`:

* **Active Mode (`OPENAI_API_KEY` / `GEMINI_API_KEY` configured):**
  * Computes dense vector embeddings (`text-embedding-3-small` / `text-embedding-004`).
  * Blends semantic cosine similarity with lexical keyword matching.
* **Deterministic Fallback Mode (No API keys configured):**
  * Operates via deterministic lexical matching (Thai + English tokenization), SKU model boosts, brand filters, and Analytical Cube routing.
  * Completely eliminates single-point-of-failure dependency on external LLM/embedding APIs.

---

## 3. Deterministic Chunk Identity Guarantee

Every indexed chunk derives its immutable ID via SHA-256:

$$\text{chunk\_id} = \text{CHUNK-}\{\text{evidence\_id}\}\text{-}\{\text{index}\}\text{-}\{\text{SHA256}(\text{content})[:12]\}$$

Ingesting the same evidence record multiple times deterministically produces the exact same chunk identifier.
