/**
 * Master RAG & Strategic Intelligence Service
 * 
 * Coordinates:
 * Evidence Ingestion Store → Document Builder → Hybrid Retrieval Engine →
 * Analytical Cube Metrics → Grounding & Answer Synthesis Engine
 */

import { RagQuery, RagAnswer } from '@/types/rag';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { buildAllEvidenceChunks } from './evidenceDocumentBuilder';
import { retrievalEngine } from './retrievalEngine';
import { serverEmbeddingProvider } from './embeddings/provider';
import { groundingEngine } from './groundingEngine';

export class RagService {
  /**
   * Executes a grounded strategic query over the Evidence Lake and Analytical Cube.
   */
  public async query(ragQuery: RagQuery): Promise<RagAnswer> {
    const startTimeMs = Date.now();

    // 1. Fetch all raw evidence records from the Evidence Store
    const allRecords = globalEvidenceStore.getAll();
    const totalEvidenceCount = allRecords.length;

    // 2. Build structured RAG documents / chunks
    const allChunks = buildAllEvidenceChunks(allRecords);
    const documentsIndexed = allChunks.length;

    // 3. Check embedding provider health
    const embeddingHealth = await serverEmbeddingProvider.healthCheck();

    // 4. Retrieve supporting analytical metrics from the Analytical Cube
    const supportingMetrics = retrievalEngine.retrieveRelevantMetrics(ragQuery);

    // 5. Retrieve supporting evidence chunks using Hybrid Retrieval
    const retrievedResults = await retrievalEngine.retrieveRelevantChunks(ragQuery, allChunks, 8);

    // Determine effective retrieval method
    const retrievalMethod =
      retrievedResults.length > 0
        ? retrievedResults[0].retrieval_method
        : embeddingHealth.available
        ? 'HYBRID'
        : 'KEYWORD';

    // 6. Synthesize grounded answer adhering strictly to 4-part Answer Contract
    return await groundingEngine.synthesizeAnswer({
      query: ragQuery,
      retrievedResults,
      supportingMetrics,
      totalEvidenceCount,
      documentsIndexed,
      retrievalMethod,
      embeddingAvailable: embeddingHealth.available,
      startTimeMs,
    });
  }

  /**
   * Backward-compatible helper for string-only queries
   */
  public async executeQuery(queryText: string): Promise<RagAnswer> {
    return this.query({ query: queryText });
  }
}

export const ragService = new RagService();
