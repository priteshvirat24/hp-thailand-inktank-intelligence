/**
 * Embedding Provider Contracts
 */

export interface EmbeddingHealth {
  readonly available: boolean;
  readonly provider: string;
  readonly message: string;
}

export interface EmbeddingProvider {
  readonly name: string;
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
  healthCheck(): Promise<EmbeddingHealth>;
}
