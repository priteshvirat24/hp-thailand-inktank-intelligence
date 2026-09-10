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
import { queryUnderstandingEngine } from './queryUnderstanding';

export class RagService {
  /**
   * Executes a grounded strategic query over the Evidence Lake and Analytical Cube.
   */
  public async query(ragQuery: RagQuery): Promise<RagAnswer> {
    const startTimeMs = Date.now();

    // 1. Perform conversational query understanding and reference resolution
    const plan = queryUnderstandingEngine.analyzeQuery(ragQuery);

    // 2. If query is ambiguous and requires conversational clarification, is unsupported scope, or is a greeting, handle immediately
    if (plan.context.requiresClarification || plan.unsupportedScope?.isUnsupported || plan.intent === 'GREETING') {
      return await groundingEngine.synthesizeAnswer({
        query: ragQuery,
        plan,
        retrievedResults: [],
        supportingMetrics: [],
        totalEvidenceCount: 1,
        documentsIndexed: 0,
        retrievalMethod: 'KEYWORD',
        embeddingAvailable: false,
        startTimeMs,
      });
    }

    // 3. Fetch all raw evidence records from the Evidence Store
    const allRecords = globalEvidenceStore.getAll();
    const totalEvidenceCount = allRecords.length;

    // 4. Build structured RAG documents / chunks
    const allChunks = buildAllEvidenceChunks(allRecords);
    const documentsIndexed = allChunks.length;

    // 5. Check embedding provider health
    const embeddingHealth = await serverEmbeddingProvider.healthCheck();

    // 6. Retrieve supporting analytical metrics from the Analytical Cube
    const supportingMetrics = retrievalEngine.retrieveRelevantMetrics(ragQuery, plan);

    // 7. Retrieve supporting evidence chunks using Hybrid Retrieval
    const retrievedResults = await retrievalEngine.retrieveRelevantChunks(ragQuery, allChunks, 8, plan);

    // Determine effective retrieval method
    const retrievalMethod =
      retrievedResults.length > 0
        ? retrievedResults[0].retrieval_method
        : embeddingHealth.available
        ? 'HYBRID'
        : 'KEYWORD';

    // 8. Synthesize grounded answer adhering strictly to 4-part Answer Contract
    return await groundingEngine.synthesizeAnswer({
      query: ragQuery,
      plan,
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
