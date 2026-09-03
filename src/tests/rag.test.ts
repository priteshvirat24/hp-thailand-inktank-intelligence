/**
 * Phase 4A RAG Retrieval, Evidence Grounding & Strategic Intelligence Engine Test Suite
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildEvidenceChunk,
  buildAllEvidenceChunks,
  buildChunkContent,
} from '@/services/rag/evidenceDocumentBuilder';
import { retrievalEngine } from '@/services/rag/retrievalEngine';
import { serverEmbeddingProvider } from '@/services/rag/embeddings/provider';
import { ragService } from '@/services/rag/ragService';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { analyticsService } from '@/services/analytics/analyticsService';
import { RawEvidenceRecord } from '@/types/evidence';
import { RagQuery } from '@/types/rag';

const MOCK_HP_EVIDENCE: RawEvidenceRecord = {
  evidence_id: 'EVID-META-HP580VIDEO01',
  published_at: '2026-08-10',
  captured_at: '2026-08-11T04:00:00Z',
  brand: 'HP',
  channel: 'Paid Media',
  platform: 'Meta',
  activity_type: 'Ad Creative',
  product_sku: 'Smart Tank 580',
  raw_title: 'HP Smart Tank 580 Wireless All-in-One Printer',
  raw_content_th: 'พิมพ์เยอะ จุใจ ประหยัดสุดคุ้มด้วย HP Smart Tank 580 หมึกพิมพ์ได้ถึง 8,000 หน้า',
  content_en_translation: 'Print abundantly with HP Smart Tank 580, yields up to 8,000 color pages',
  price_current_thb: 5590,
  price_original_thb: 6290,
  discount_pct: 11,
  seller_name: 'HP Thailand Official Store',
  is_official_store: true,
  stock_status: 'In Stock',
  displayed_sales: '2.5k sold',
  rating: 4.8,
  review_count: 420,
  creative_format: 'Video',
  creative_asset_url: 'https://video.meta.com/hp580',
  source_url: 'https://facebook.com/ads/library/?id=HP580VIDEO01',
  evidence_tags: ['Paid Media', 'Meta Ads', 'Video Ad'],
  extraction_method: 'Apify Actor',
  confidence_score: 0.98,
};

const MOCK_EPSON_EVIDENCE: RawEvidenceRecord = {
  evidence_id: 'EVID-SHOPEE-EPSONL3250',
  published_at: '2026-08-12',
  captured_at: '2026-08-12T05:00:00Z',
  brand: 'Epson',
  channel: 'E-commerce',
  platform: 'Shopee',
  activity_type: 'Product Listing',
  product_sku: 'EcoTank L3250',
  raw_title: 'Epson EcoTank L3250 Wi-Fi All-in-One Ink Tank Printer',
  raw_content_th: 'เครื่องพิมพ์แท็งก์แท้ Epson L3250 เชื่อมต่อไร้สาย Wi-Fi Direct',
  content_en_translation: 'Genuine ink tank printer Epson L3250 with Wi-Fi Direct',
  price_current_thb: 4490,
  price_original_thb: 4990,
  discount_pct: 10,
  seller_name: 'Epson Official Flagship Store',
  is_official_store: true,
  stock_status: 'In Stock',
  displayed_sales: '4.8k sold',
  rating: 4.9,
  review_count: 1200,
  creative_format: null,
  creative_asset_url: null,
  source_url: 'https://shopee.co.th/product/123/456',
  evidence_tags: ['E-commerce', 'Shopee Mall', 'Product Listing'],
  extraction_method: 'Bright Data Scraping Browser',
  confidence_score: 0.99,
};

describe('Phase 4A: Evidence Document Generation & Deterministic Chunk IDs', () => {
  it('generates identical deterministic chunk IDs for identical evidence inputs', () => {
    const chunk1 = buildEvidenceChunk(MOCK_HP_EVIDENCE, 0);
    const chunk2 = buildEvidenceChunk(MOCK_HP_EVIDENCE, 0);

    expect(chunk1.chunk_id).toBe(chunk2.chunk_id);
    expect(chunk1.chunk_id).toMatch(/^CHUNK-META-HP580VIDEO01-0-[0-9A-F]{8}$/i);
  });

  it('preserves Thai text, English translation, pricing, and deep source URLs in chunk content', () => {
    const content = buildChunkContent(MOCK_HP_EVIDENCE);

    expect(content).toContain('HP Smart Tank 580 Wireless All-in-One Printer');
    expect(content).toContain('พิมพ์เยอะ จุใจ ประหยัดสุดคุ้ม');
    expect(content).toContain('Print abundantly with HP Smart Tank 580');
    expect(content).toContain('Price: ฿5,590');
    expect(content).toContain('Discount: 11%');
    expect(content).toContain('Creative Format: Video');
    expect(content).toContain('Source URL: https://facebook.com/ads/library/?id=HP580VIDEO01');
    expect(content).toContain('Evidence ID: EVID-META-HP580VIDEO01');
  });

  it('correctly maps canonical SKU ID and analytical month', () => {
    const chunk = buildEvidenceChunk(MOCK_HP_EVIDENCE, 0);
    expect(chunk.sku_id).toBe('HP-ST-580');
    expect(chunk.analytical_month).toBe('2026-08');
    expect(chunk.language).toBe('th-en');
  });
});

describe('Phase 4A: Embedding Provider Abstraction & Fallback Mode', () => {
  it('reports deterministic fallback mode when API keys are unconfigured', async () => {
    const health = await serverEmbeddingProvider.healthCheck();
    expect(health.provider).toBeDefined();
    expect(health.message).toBeDefined();
    expect(typeof health.available).toBe('boolean');
    // Ensure no secrets are leaked in health check
    expect(JSON.stringify(health)).not.toContain('sk-');
  });

  it('embedQuery returns array without throwing errors in fallback mode', async () => {
    const vector = await serverEmbeddingProvider.embedQuery('HP Smart Tank pricing');
    expect(Array.isArray(vector)).toBe(true);
  });
});

describe('Phase 4A: Hybrid & Analytical Retrieval Engine', () => {
  const chunks = buildAllEvidenceChunks([MOCK_HP_EVIDENCE, MOCK_EPSON_EVIDENCE]);

  it('retrieves HP chunks when querying for HP Smart Tank', async () => {
    const query: RagQuery = { query: 'HP Smart Tank 580 video ad' };
    const results = await retrievalEngine.retrieveRelevantChunks(query, chunks, 5);

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].chunk.brand).toBe('HP');
    expect(results[0].chunk.canonical_model).toBe('Smart Tank 580');
  });

  it('applies structured brand filter strictly', async () => {
    const query: RagQuery = {
      query: 'Ink Tank Printer',
      brandFilter: 'Epson',
    };
    const results = await retrievalEngine.retrieveRelevantChunks(query, chunks, 5);

    expect(results.every((r) => r.chunk.brand === 'Epson')).toBe(true);
  });

  it('routes quantitative queries to Analytical Cube metrics', () => {
    const sovQuery: RagQuery = { query: 'What is the share of voice for HP in August 2026?' };
    const metrics = retrievalEngine.retrieveRelevantMetrics(sovQuery);

    expect(metrics.some((m) => m.metric_id.includes('SOV'))).toBe(true);
    expect(metrics.every((m) => m.month === '2026-08')).toBe(true);
  });
});

describe('Phase 4A: Grounded Strategic Answer Synthesis & Lineage', () => {
  beforeEach(() => {
    globalEvidenceStore.clear();
  });

  it('returns explicit honest empty-store disclosure when Evidence Store has 0 records', async () => {
    const answer = await ragService.query({ query: 'How does HP compare with Epson in visibility?' });

    expect(answer.confidence).toBe(0.0);
    expect(answer.answer).toContain('No verified evidence is currently available in the Evidence Lake');
    expect(answer.supporting_evidence).toHaveLength(0);
    expect(answer.sources).toHaveLength(0);
    expect(answer.limitations).toBeDefined();
  });

  it('synthesizes grounded 4-part Answer Contract when evidence is populated', async () => {
    // Populate store with verified records
    globalEvidenceStore.insert(MOCK_HP_EVIDENCE);
    globalEvidenceStore.insert(MOCK_EPSON_EVIDENCE);
    analyticsService.rebuildAnalyticsFromEvidence();

    const answer = await ragService.query({
      query: 'Compare HP Smart Tank 580 and Epson EcoTank L3250 in advertising and pricing.',
      monthFilter: '2026-08',
    });

    // 1. Grounded Answer
    expect(answer.answer).toBeDefined();
    expect(answer.answer.length).toBeGreaterThan(20);

    // 2. Supporting Evidence & Lineage
    expect(answer.supporting_evidence.length).toBeGreaterThanOrEqual(1);
    expect(answer.retrieved_evidence_ids).toContain('EVID-META-HP580VIDEO01');

    // 3. Strategic Implication for HP
    expect(answer.implication_for_hp).toBeDefined();
    expect(answer.implication_for_hp).toContain('HP');

    // 4. Source Citations
    expect(answer.sources.length).toBeGreaterThanOrEqual(1);
    expect(answer.sources[0].source_url).toMatch(/^https?:\/\//);

    // Diagnostics & Confidence
    expect(answer.confidence).toBeGreaterThan(0);
    expect(answer.diagnostics.documents_indexed).toBe(2);
    expect(answer.diagnostics.execution_time_ms).toBeGreaterThanOrEqual(0);
  });
});
