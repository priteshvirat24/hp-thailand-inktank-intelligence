/**
 * Mistral AI Runtime & Fallback Integration Tests
 * 
 * Verifies:
 * 1. Primary Model (ministral-14b-latest) and Fallback Model (ministral-8b-latest) configuration.
 * 2. Successful natural-language generation and metadata reporting.
 * 3. Graceful fallback to secondary model when primary fails.
 * 4. Honest, data-grounded fallback to deterministic baseline when LLM is unavailable.
 * 5. Strict adherence to response schema and conversation history preservation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  groundingEngine,
  PRIMARY_MISTRAL_MODEL,
  FALLBACK_MISTRAL_MODEL,
} from '@/services/rag/groundingEngine';
import {
  RagQuery,
  RagRetrievalResult,
  RagSupportingMetric,
} from '@/types/rag';

const MOCK_QUERY: RagQuery = {
  query: 'How does HP pricing compare to Epson?',
  brandFilter: 'All',
  monthFilter: '2026-08',
};

const MOCK_RESULTS: readonly RagRetrievalResult[] = [
  {
    chunk: {
      chunk_id: 'chunk-1',
      evidence_id: 'EVD-HP-001',
      content: 'Brand: HP\nTitle: HP Smart Tank 580 All-in-One Printer\nPrice: ฿4,190 on Shopee Thailand',
      brand: 'HP',
      channel: 'E-Commerce',
      platform: 'Shopee',
      sku_id: 'sku-hp-580',
      canonical_model: 'Smart Tank 580',
      analytical_month: '2026-08',
      source_url: 'https://shopee.co.th/hp-580',
      published_at: '2026-08-15',
      captured_at: '2026-08-15',
      language: 'en',
      metadata: { price_current_thb: 4190 },
    },
    retrieval_score: 0.92,
    retrieval_method: 'HYBRID',
  },
  {
    chunk: {
      chunk_id: 'chunk-2',
      evidence_id: 'EVD-EPSON-001',
      content: 'Brand: Epson\nTitle: Epson EcoTank L3250 Printer\nPrice: ฿4,490 on Shopee Thailand',
      brand: 'Epson',
      channel: 'E-Commerce',
      platform: 'Shopee',
      sku_id: 'sku-epson-l3250',
      canonical_model: 'EcoTank L3250',
      analytical_month: '2026-08',
      source_url: 'https://shopee.co.th/epson-l3250',
      published_at: '2026-08-15',
      captured_at: '2026-08-15',
      language: 'en',
      metadata: { price_current_thb: 4490 },
    },
    retrieval_score: 0.88,
    retrieval_method: 'HYBRID',
  },
];

const MOCK_METRICS: readonly RagSupportingMetric[] = [
  {
    metric_id: 'AVG_PRICE_CURRENT_THB',
    metric_name: 'Average Street Price',
    brand: 'HP',
    month: '2026-08',
    value: 4190,
    unit: 'THB',
    data_state: 'OBSERVED',
    observation_count: 15,
    evidence_ids: ['EVD-HP-001'],
  },
  {
    metric_id: 'AVG_PRICE_CURRENT_THB',
    metric_name: 'Average Street Price',
    brand: 'Epson',
    month: '2026-08',
    value: 4490,
    unit: 'THB',
    data_state: 'OBSERVED',
    observation_count: 22,
    evidence_ids: ['EVD-EPSON-001'],
  },
];

describe('Mistral AI Runtime Integration & Fallback Contracts', () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.MISTRAL_API_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.MISTRAL_API_KEY = 'mock-mistral-api-key';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalKey !== undefined) {
      process.env.MISTRAL_API_KEY = originalKey;
    } else {
      delete process.env.MISTRAL_API_KEY;
    }
  });

  it('declares official fast reasoning models as primary and secondary', () => {
    expect(PRIMARY_MISTRAL_MODEL).toBe('ministral-14b-latest');
    expect(FALLBACK_MISTRAL_MODEL).toBe('ministral-8b-latest');
  });

  it('synthesizes grounded answer using primary model when Mistral succeeds', async () => {
    // Mock successful Mistral response
    const mockResponse = {
      id: 'cmpl-test-123',
      model: PRIMARY_MISTRAL_MODEL,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              direct_answer: 'HP maintains a price advantage in August 2026, with the Smart Tank 580 averaging ฿4,190 compared to Epson EcoTank L3250 at ฿4,490.',
              strategic_implication: 'HP should aggressively highlight this ฿300 street price advantage during 9.9 mega campaigns.',
            }),
          },
          finish_reason: 'stop',
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const answer = await groundingEngine.synthesizeAnswer({
      query: MOCK_QUERY,
      retrievedResults: MOCK_RESULTS,
      supportingMetrics: MOCK_METRICS,
      totalEvidenceCount: 2,
      documentsIndexed: 100,
      retrievalMethod: 'HYBRID',
      embeddingAvailable: true,
      startTimeMs: Date.now(),
    });

    expect(answer.ok).toBe(true);
    expect(answer.answer).toContain('HP maintains a price advantage in August 2026');
    expect(answer.implication_for_hp).toContain('HP should aggressively highlight');
    expect(answer.generation.provider).toBe('mistral');
    expect(answer.generation.model).toBe(PRIMARY_MISTRAL_MODEL);
    expect(answer.generation.status).toBe('generated');
    expect(answer.generation.fallback_used).toBe(false);
    expect(typeof answer.generation.latency_ms).toBe('number');

    // Verify request payload sent to Mistral
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(url).toBe('https://api.mistral.ai/v1/chat/completions');
    const body = JSON.parse((options?.body as string) || '{}');
    expect(body.model).toBe(PRIMARY_MISTRAL_MODEL);
    expect(body.response_format.type).toBe('json_schema');
    expect(body.max_tokens).toBe(1500);
  });

  it('fails over to secondary model ministral-8b-latest when primary model encounters an error', async () => {
    // 1st call fails (e.g. rate limit HTTP 429), 2nd call succeeds
    const mockFallbackResponse = {
      id: 'cmpl-test-fallback',
      model: FALLBACK_MISTRAL_MODEL,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify({
              direct_answer: 'Synthesized via fallback model: HP is positioned below Epson at ฿4,190.',
              strategic_implication: 'Defend market share through retail bundle incentives.',
            }),
          },
          finish_reason: 'stop',
        },
      ],
    };

    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockFallbackResponse,
      });

    const answer = await groundingEngine.synthesizeAnswer({
      query: MOCK_QUERY,
      retrievedResults: MOCK_RESULTS,
      supportingMetrics: MOCK_METRICS,
      totalEvidenceCount: 2,
      documentsIndexed: 100,
      retrievalMethod: 'HYBRID',
      embeddingAvailable: true,
      startTimeMs: Date.now(),
    });

    expect(answer.ok).toBe(true);
    expect(answer.answer).toContain('Synthesized via fallback model');
    expect(answer.generation.provider).toBe('mistral');
    expect(answer.generation.model).toBe(FALLBACK_MISTRAL_MODEL);
    expect(answer.generation.status).toBe('fallback_model_generated');
    expect(answer.generation.fallback_used).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('safely falls back to deterministic analytical cube narrative when both Mistral models fail', async () => {
    // Both attempts fail
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

    const answer = await groundingEngine.synthesizeAnswer({
      query: MOCK_QUERY,
      retrievedResults: MOCK_RESULTS,
      supportingMetrics: MOCK_METRICS,
      totalEvidenceCount: 2,
      documentsIndexed: 100,
      retrievalMethod: 'HYBRID',
      embeddingAvailable: true,
      startTimeMs: Date.now(),
    });

    // Per user feedback: do not return empty answer; gracefully fallback to deterministic narrative
    expect(answer.ok).toBe(true);
    expect(answer.answer).toBeDefined();
    expect(answer.answer.length).toBeGreaterThan(20);
    expect(answer.implication_for_hp).toBeDefined();

    // Honest metadata reporting: never claims to be Mistral
    expect(answer.generation.provider).toBe('system');
    expect(answer.generation.model).toBe('deterministic_cube_baseline');
    expect(answer.generation.status).toBe('deterministic_non_llm');
    expect(answer.generation.fallback_used).toBe(true);
    expect(answer.generation.error_code).toBe('HTTP_503');
  });

  it('preserves multi-turn conversation history in Mistral request payload', async () => {
    const multiTurnQuery: RagQuery = {
      query: 'What about their warranty?',
      brandFilter: 'Epson',
      monthFilter: '2026-08',
      history: [
        { role: 'user', content: 'How does HP compare to Epson?' },
        { role: 'assistant', content: 'HP is ฿4,190 while Epson is ฿4,490.' },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                direct_answer: 'Epson offers standard warranty while HP provides 2-year onsite warranty.',
                strategic_implication: 'Emphasize onsite service in marketing communications.',
              }),
            },
          },
        ],
      }),
    });

    await groundingEngine.synthesizeAnswer({
      query: multiTurnQuery,
      retrievedResults: MOCK_RESULTS,
      supportingMetrics: MOCK_METRICS,
      totalEvidenceCount: 2,
      documentsIndexed: 100,
      retrievalMethod: 'HYBRID',
      embeddingAvailable: true,
      startTimeMs: Date.now(),
    });

    const body = JSON.parse((vi.mocked(globalThis.fetch).mock.calls[0][1]?.body as string) || '{}');
    expect(body.messages).toHaveLength(4); // system + 2 history + current user turn
    expect(body.messages[1].role).toBe('user');
    expect(body.messages[1].content).toBe('How does HP compare to Epson?');
    expect(body.messages[2].role).toBe('assistant');
    expect(body.messages[2].content).toBe('HP is ฿4,190 while Epson is ฿4,490.');
  });

  it('safely falls back to deterministic narrative when MISTRAL_API_KEY is not configured', async () => {
    delete process.env.MISTRAL_API_KEY;
    const answer = await groundingEngine.synthesizeAnswer({
      query: MOCK_QUERY,
      retrievedResults: MOCK_RESULTS,
      supportingMetrics: MOCK_METRICS,
      totalEvidenceCount: 2,
      documentsIndexed: 100,
      retrievalMethod: 'HYBRID',
      embeddingAvailable: true,
      startTimeMs: Date.now(),
    });

    expect(answer.ok).toBe(true);
    expect(answer.answer).toBeDefined();
    expect(answer.generation.provider).toBe('system');
    expect(answer.generation.model).toBe('deterministic_cube_baseline');
    expect(answer.generation.status).toBe('deterministic_non_llm');
    expect(answer.generation.fallback_used).toBe(true);
    expect(answer.generation.error_code).toBe('MISTRAL_NOT_CONFIGURED');
  });
});
