/**
 * Phase 22: RAG Sentiment & Consumer Voice Live Verification Script
 * Validates queries from Section 58, 59, and 67
 */

import { ragService } from '../src/services/rag/ragService';
import { globalEvidenceStore } from '../src/services/evidence/evidenceStore';

const QUERIES = [
  'What are HP customers saying?',
  'What are Epson customers saying?',
  'What are Brother customers saying?',
  'What are Canon customers saying?',
  'What complaints are there about HP?',
  'What do consumers say about Brother vs Epson?',
  'Are there any recurring complaints about print speed?',
  'Show me evidence comparing HP and Brother.',
  'What are HP customers saying about HP OMEN BIOS?',
  'How many rated HP reviews are there?',
];

async function runVerification() {
  globalEvidenceStore.loadFromDisk(true);
  console.log('='.repeat(70));
  console.log(`PHASE 22: RAG SENTIMENT & CONSUMER REVIEW QUERY VERIFICATION (${globalEvidenceStore.getAll().length} records)`);
  console.log('='.repeat(70));

  for (const q of QUERIES) {
    console.log(`\n🔍 Query: "${q}"`);
    try {
      const res = await ragService.query({ query: q });
      console.log(`  Retrieval Method: ${res.retrieval_method} | Confidence: ${res.confidence}`);
      console.log(`  Direct Answer: ${res.answer.slice(0, 250)}...`);
      if (res.supporting_metrics && res.supporting_metrics.length > 0) {
        console.log(`  Supporting Metrics (${res.supporting_metrics.length}): ${res.supporting_metrics.map(m => `${m.metric_id}=${m.value}`).join(', ')}`);
      }
      if (res.sources && res.sources.length > 0) {
        console.log(`  Sources (${res.sources.length}):`);
        for (const c of res.sources.slice(0, 3)) {
          console.log(`    - [${c.evidence_id}] ${c.brand || 'Unattributed'} | ${c.platform} | Date: ${c.published_date}`);
        }
      }
      if (res.limitations && res.limitations.length > 0) {
        console.log(`  🛡️ Limitations: ${res.limitations.join('; ')}`);
      }
    } catch (e: any) {
      console.error(`  ❌ Error: ${e.message}`);
    }
  }
}

runVerification();
