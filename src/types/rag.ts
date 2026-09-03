/**
 * Authoritative RAG & Strategic Intelligence Domain Contracts
 */

import { TargetBrand } from './brands';
import { ChannelType, PlatformType } from './sources';
import { AnalyticalMonth, MetricId, DataState } from './analytics';

export type RetrievalMethod = 'VECTOR' | 'KEYWORD' | 'ANALYTICAL' | 'HYBRID';

export interface RagQuery {
  query: string;
  brandFilter?: TargetBrand | 'All';
  monthFilter?: AnalyticalMonth | 'All';
  channelFilter?: ChannelType | 'All';
  platformFilter?: PlatformType | 'All';
  skuFilter?: string | 'All';
}

export interface RagEvidenceChunk {
  chunk_id: string;
  evidence_id: string;
  content: string;
  brand: TargetBrand;
  channel: ChannelType;
  platform: PlatformType;
  sku_id: string | null;
  canonical_model?: string | null;
  analytical_month: AnalyticalMonth | null;
  source_url: string;
  published_at: string;
  captured_at: string;
  language: 'th' | 'en' | 'th-en';
  metadata: Record<string, unknown>;
}

export interface RagRetrievalResult {
  chunk: RagEvidenceChunk;
  retrieval_score: number;
  retrieval_method: RetrievalMethod;
  matched_terms?: string[];
}

export interface RagSupportingEvidence {
  evidence_id: string;
  source: string;
  platform: string;
  brand: TargetBrand;
  date: string;
  snippet: string;
  source_url: string;
  sku_model?: string | null;
}

export interface RagSupportingMetric {
  metric_id: MetricId;
  metric_name: string;
  brand: TargetBrand;
  month: AnalyticalMonth;
  value: number | null;
  unit: string;
  data_state: DataState;
  observation_count: number;
  evidence_ids: readonly string[];
}

export interface RagSourceCitation {
  evidence_id: string;
  title: string;
  platform: string;
  source_url: string;
  published_date: string;
  brand: TargetBrand;
  snippet_th?: string;
  snippet_en?: string;
}

export interface RagDiagnostics {
  retrieval_method: RetrievalMethod;
  embedding_available: boolean;
  documents_indexed: number;
  chunks_retrieved: number;
  metrics_retrieved: number;
  evidence_retrieved: number;
  execution_time_ms: number;
}

export interface RagChartPayload {
  chart_type: 'bar' | 'line' | 'donut' | 'table';
  title: string;
  data: Record<string, string | number>[];
  x_key: string;
  series: { key: string; name: string; color: string }[];
}

export interface RagAnswer {
  query: string;
  answer: string;
  supporting_evidence: RagSupportingEvidence[];
  supporting_metrics: RagSupportingMetric[];
  implication_for_hp: string;
  sources: RagSourceCitation[];
  confidence: number;
  retrieved_evidence_ids: string[];
  retrieved_metric_row_ids: string[];
  limitations?: string[];
  retrieval_method: RetrievalMethod;
  diagnostics: RagDiagnostics;
  chart?: RagChartPayload;
  generated_at: string;
}

// Backward-compatible query response alias
export type RagQueryResponse = RagAnswer;
