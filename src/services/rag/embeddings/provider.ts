/**
 * Server-Side Embedding Provider Abstraction
 * 
 * Supports OpenAI / Gemini embedding endpoints when configured in .env.local.
 * When credentials are absent, gracefully operates in fallback mode without breaking retrieval.
 */

import { EmbeddingProvider, EmbeddingHealth } from './types';
import { getServerEnv } from '@/config/env';

export class ServerEmbeddingProvider implements EmbeddingProvider {
  public readonly name = 'server-embedding-provider';

  public async healthCheck(): Promise<EmbeddingHealth> {
    const env = getServerEnv();
    const hasMistral = Boolean(env.MISTRAL_API_KEY && env.MISTRAL_API_KEY.trim().length > 0);
    const hasOpenAi = Boolean(env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 0);
    const hasGemini = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0);

    if (hasMistral) {
      return {
        available: true,
        provider: 'mistral',
        message: 'Mistral AI embedding provider configured (mistral-embed, 1024-dim)',
      };
    }

    if (hasOpenAi) {
      return {
        available: true,
        provider: 'openai',
        message: 'OpenAI embedding provider configured (text-embedding-3-small)',
      };
    }

    if (hasGemini) {
      return {
        available: true,
        provider: 'gemini',
        message: 'Gemini embedding provider configured (text-embedding-004)',
      };
    }

    return {
      available: false,
      provider: 'fallback-deterministic',
      message: 'No embedding API key configured. Deterministic hybrid lexical + analytical retrieval active.',
    };
  }

  public async embedQuery(text: string): Promise<number[]> {
    const results = await this.embedDocuments([text]);
    return results[0] || [];
  }

  public async embedDocuments(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const env = getServerEnv();
    const mistralKey = env.MISTRAL_API_KEY?.trim();
    const openAiKey = env.OPENAI_API_KEY?.trim();
    const geminiKey = env.GEMINI_API_KEY?.trim();

    if (mistralKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch('https://api.mistral.ai/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mistralKey}`,
          },
          body: JSON.stringify({
            model: 'mistral-embed',
            input: texts,
          }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        if (res.ok) {
          const body = await res.json();
          if (Array.isArray(body.data)) {
            return body.data.map((item: { embedding: number[] }) => item.embedding);
          }
        }
      } catch {
        // Fall back to alternative providers or deterministic retrieval
      }
    }

    if (openAiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            input: texts,
            model: 'text-embedding-3-small',
          }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        if (res.ok) {
          const body = await res.json();
          return body.data.map((item: { embedding: number[] }) => item.embedding);
        }
      } catch {
        // Fall back to empty embeddings
      }
    } else if (geminiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: texts.map((text) => ({
                model: 'models/text-embedding-004',
                content: { parts: [{ text }] },
              })),
            }),
            signal: controller.signal,
          }
        ).finally(() => clearTimeout(timeoutId));

        if (res.ok) {
          const body = await res.json();
          return body.embeddings.map((item: { values: number[] }) => item.values);
        }
      } catch {
        // Fall back to empty embeddings
      }
    }

    // Fallback mode: return empty arrays
    return texts.map(() => []);
  }
}

export const serverEmbeddingProvider = new ServerEmbeddingProvider();
