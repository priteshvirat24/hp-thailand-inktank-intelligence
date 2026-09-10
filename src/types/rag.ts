/**
 * Authoritative RAG & Strategic Intelligence Domain Contracts
 */

import { TargetBrand } from './brands';
import { ChannelType, PlatformType } from './sources';
import { AnalyticalMonth, MetricId, DataState } from './analytics';

export type RetrievalMethod = 'VECTOR' | 'KEYWORD' | 'ANALYTICAL' | 'HYBRID';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RagQuery {
  query: string;
  brandFilter?: TargetBrand | 'All';
  monthFilter?: AnalyticalMonth | (string & {}) | 'All';
  channelFilter?: ChannelType | 'All';
  platformFilter?: PlatformType | 'All';
  skuFilter?: string | 'All';
  history?: ChatMessage[];
}

export type RAGIntent =
  | 'EXECUTIVE_SUMMARY'
  | 'COMPETITIVE_COMPARISON'
  | 'VISIBILITY'
  | 'ADVERTISING'
  | 'SOCIAL_ACTIVITY'
  | 'PRICING'
  | 'PROMOTIONS'
  | 'SKU'
  | 'CONSUMER_SENTIMENT'
  | 'CUSTOMER_REVIEWS'
  | 'TRACTION'
  | 'TREND'
  | 'INSIGHT'
  | 'RECOMMENDATION'
  | 'EVIDENCE_REQUEST'
  | 'WHY_EXPLANATION'
  | 'FOLLOW_UP'
  | 'CLARIFICATION'
  | 'GREETING'
  | 'GENERAL_QUERY';

export type QuestionType =
  | 'DIRECT'
  | 'WHY'
  | 'HOW'
  | 'COMPARISON'
  | 'SUMMARY'
  | 'EVIDENCE'
  | 'RECOMMENDATION'
  | 'FOLLOW_UP'
  | 'AMBIGUOUS';

export type AnswerStyle =
  | 'STANDARD'
  | 'EXECUTIVE_SHORT'
  | 'DEEP_DIVE'
  | 'EVIDENCE_ONLY'
  | 'SIMPLE';

export interface QueryEntities {
  brands: TargetBrand[];
  comparisonBrands: TargetBrand[];
  month?: AnalyticalMonth | (string & {}) | 'ALL';
  channel?: ChannelType | 'All';
  platform?: PlatformType | 'All';
  sku?: string;
  metrics: MetricId[];
}

export type ConversationMode = 'SINGLE_SUBJECT' | 'COMPARISON' | 'UNCERTAIN';

export interface ConversationalContext {
  isFollowUp: boolean;
  referencesPreviousTurn: boolean;
  mode?: ConversationMode;
  activeSubject?: TargetBrand | null;
  activeComparisonSet?: TargetBrand[];
  activeMonth?: AnalyticalMonth | string;
  activeChannel?: ChannelType | 'All';
  activePlatform?: PlatformType | 'All';
  activeSku?: string;
  activeTopic?: RAGIntent;
  priorTopic?: RAGIntent;
  priorBrand?: TargetBrand;
  priorComparison?: TargetBrand[];
  priorAnswerSummary?: string;
  resolvedPronouns: Record<string, string>;
  requiresClarification: boolean;
  clarificationPrompt?: string;
  ambiguousReferent?: string;
  possibleEntities?: TargetBrand[];
}

export interface UnsupportedScope {
  isUnsupported: boolean;
  dimension: string;
  explanation: string;
  entity?: TargetBrand | string;
  brand?: TargetBrand | string;
  platform?: PlatformType | string;
  region?: string;
}

export interface StructuredQueryPlan {
  originalQuery: string;
  normalizedQuery: string;
  intent: RAGIntent;
  subIntents: RAGIntent[];
  questionType: QuestionType;
  answerStyle: AnswerStyle;
  entities: QueryEntities;
  context: ConversationalContext;
  conversationalContext?: ConversationalContext;
  requiresEvidence: boolean;
  confidence: number;
  unsupportedScope?: UnsupportedScope;
  needsClarification?: boolean;
  unsupportedDomain?: string;
  activeSubject?: TargetBrand | null;
  activeComparisonSet?: TargetBrand[];
  referenceResolution?: Record<string, string>;
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

export type GenerationStatus =
  | 'generated'
  | 'fallback_model_generated'
  | 'generation_failed'
  | 'deterministic_non_llm';

export interface RagGenerationMetadata {
  provider: 'mistral' | 'system';
  model: string | null;
  status: GenerationStatus;
  latency_ms?: number;
  fallback_used?: boolean;
  error_code?: string;
  error_message?: string;
}

export interface RagAnswer {
  ok: boolean;
  query: string;
  answer: string;
  generation: RagGenerationMetadata;
  supporting_evidence: RagSupportingEvidence[];
  supporting_metrics: RagSupportingMetric[];
  implication_for_hp: string | null;
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
