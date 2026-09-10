/**
 * Client-Safe Analytics API Client
 *
 * Typed fetch wrappers for all analytics API endpoints.
 * NEVER imports server-only modules. NEVER exposes API keys.
 */

import {
  ExecutiveOverviewData,
  BrandComparisonRecord,
  SkuComparisonRecord,
  PlatformBreakdownRecord,
  MonthlyTrendPoint,
  AnalyticalMonth,
  MetricId,
} from '@/types/analytics';
import { RawEvidenceRecord } from '@/types/evidence';
import { TargetBrand } from '@/types/brands';
import { ChannelType } from '@/types/sources';
import { RagQuery, RagAnswer } from '@/types/rag';

// ─── Response Envelopes ──────────────────────────────────────────────────────

export interface BrandsApiResponse {
  metric_id: MetricId;
  month: AnalyticalMonth;
  comparison: BrandComparisonRecord[];
}

export interface SkusApiResponse {
  month: AnalyticalMonth;
  count: number;
  skus: SkuComparisonRecord[];
}

export interface PlatformsApiResponse {
  month: AnalyticalMonth;
  count: number;
  platforms: PlatformBreakdownRecord[];
}

export interface TrendsApiResponse {
  metric_id: MetricId;
  trends: MonthlyTrendPoint[];
}

export interface EvidenceApiResponse {
  metric_id: MetricId;
  brand: TargetBrand | 'All';
  month: AnalyticalMonth | 'All';
  sku_id: string | 'All';
  count: number;
  evidence: RawEvidenceRecord[];
}

export interface InsightsApiResponse {
  month: AnalyticalMonth;
  brand: TargetBrand | 'All';
  count: number;
  total: number;
  insights: import('@/services/insights/insightTypes').Insight[];
  timestamp: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

// ─── Generic fetch helper ─────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) {
    const body: ApiError = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(body.message || body.error || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Endpoint Functions ───────────────────────────────────────────────────────

/**
 * GET /api/analytics/summary?month=&brand=
 * Returns the executive overview with all 4 brands or filtered brand observations.
 */
export async function fetchSummary(
  month: AnalyticalMonth,
  brand?: TargetBrand | 'All'
): Promise<ExecutiveOverviewData> {
  const params = new URLSearchParams({ month });
  if (brand && brand !== 'All') {
    params.set('brand', brand);
  }
  return apiFetch<ExecutiveOverviewData>(`/api/analytics/summary?${params.toString()}`);
}

/**
 * GET /api/analytics/brands?metric=&month=
 * Returns 4-brand comparison for a specific metric and month.
 */
export async function fetchBrands(
  metricId: MetricId,
  month: AnalyticalMonth
): Promise<BrandsApiResponse> {
  return apiFetch<BrandsApiResponse>(
    `/api/analytics/brands?metric=${metricId}&month=${month}`
  );
}

/**
 * GET /api/analytics/skus?brand=&month=
 * Returns SKU pricing/traction comparisons.
 */
export async function fetchSkus(
  brand: TargetBrand | null,
  month: AnalyticalMonth
): Promise<SkusApiResponse> {
  const q = brand ? `brand=${brand}&month=${month}` : `month=${month}`;
  return apiFetch<SkusApiResponse>(`/api/analytics/skus?${q}`);
}

/**
 * GET /api/analytics/platforms?channel=&month=
 * Returns platform breakdown across a channel.
 */
export async function fetchPlatforms(
  channel: ChannelType | null,
  month: AnalyticalMonth
): Promise<PlatformsApiResponse> {
  const q = channel ? `channel=${encodeURIComponent(channel)}&month=${month}` : `month=${month}`;
  return apiFetch<PlatformsApiResponse>(`/api/analytics/platforms?${q}`);
}

/**
 * GET /api/analytics/trends?metric=&brand=
 * Returns 3-month trend points for a metric (optional brand filter).
 */
export async function fetchTrends(
  metricId: MetricId,
  brand: TargetBrand | 'All' = 'All'
): Promise<TrendsApiResponse> {
  const q = brand !== 'All' ? `metric=${metricId}&brand=${brand}` : `metric=${metricId}`;
  return apiFetch<TrendsApiResponse>(`/api/analytics/trends?${q}`);
}

/**
 * GET /api/analytics/evidence?metric=&brand=&month=&sku_id=
 * Returns raw evidence records for an analytical row.
 */
export async function fetchEvidence(
  metricId: MetricId,
  brand: TargetBrand | 'All',
  month: AnalyticalMonth | 'All',
  skuId?: string,
  options?: { page?: number; pageSize?: number; all?: boolean }
): Promise<EvidenceApiResponse> {
  const params = new URLSearchParams({ metric: metricId, brand, month });
  if (skuId && skuId !== 'All') params.set('sku_id', skuId);
  if (options?.all) params.set('all', 'true');
  if (options?.pageSize) params.set('pageSize', String(options.pageSize));
  if (options?.page) params.set('page', String(options.page));
  return apiFetch<EvidenceApiResponse>(`/api/analytics/evidence?${params.toString()}`);
}

// ─── Ingestion Operations ───────────────────────────────────────────────────

export interface IngestionHealthResponse {
  timestamp: string;
  providers: {
    apify: { status: string; configured: boolean; message?: string };
    brightdata: { status: string; configured: boolean; message?: string };
  };
  evidence_lake: { total_records: number };
  last_ingestion: {
    run_id: string;
    status: string;
    completed_at: string;
    targets_attempted: number;
    targets_successful: number;
    records_accepted: number;
    errors_count: number;
  } | null;
}

export interface IngestionTriggerOptions {
  target_id?: string;
  brand?: TargetBrand;
  channel?: ChannelType;
  source_id?: string;
  all?: boolean;
  custom_payloads?: Record<string, unknown[]>;
  passphrase?: string;
}

export async function fetchIngestionHealth(): Promise<IngestionHealthResponse> {
  return apiFetch<IngestionHealthResponse>('/api/ingestion/health');
}

export async function triggerIngestion(options: IngestionTriggerOptions): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.passphrase) {
    headers['x-dashboard-password'] = options.passphrase;
  }

  const res = await fetch('/api/ingestion/run', {
    method: 'POST',
    headers,
    body: JSON.stringify(options),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(errorBody.message || errorBody.error || `Ingestion failed (${res.status})`);
  }

  return res.json();
}

// ─── Web Intelligence & Internet Evidence Discovery Operations ──────────────

export interface WebCrawlStartOptions {
  seedUrls?: string[];
  query?: string;
  brand?: TargetBrand;
  skuId?: string;
  domains?: string[];
  maxDepth?: number;
  maxPages?: number;
  strategy?: string;
}

export interface WebCrawlResponse {
  crawlId: string;
  status: string;
  summary: {
    started_at: string;
    completed_at: string | null;
    discovered_urls: number;
    acquired_urls: number;
    successful_pages: number;
    blocked_pages: number;
    evidence_created: number;
    evidence_rejected: number;
    unresolved_skus: number;
  };
  session: Record<string, unknown>;
}

export interface WebDiagnosticsData {
  url: string;
  normalized_url: string;
  domain: string;
  is_safe: boolean;
  safety_reason?: string;
  robots_status: 'ALLOWED' | 'DISALLOWED' | 'UNKNOWN';
  http_status: number | null;
  content_type: string | null;
  is_js_required: boolean;
  is_blocked: boolean;
  blocked_reason?: string;
  crawlability_status: string;
  recommended_strategy: string;
  recommendation_reason: string;
  diagnosed_at: string;
}

export async function fetchWebDiagnostics(url: string): Promise<WebDiagnosticsData> {
  return apiFetch<WebDiagnosticsData>(`/api/web/diagnostics?url=${encodeURIComponent(url)}`);
}

export async function startWebCrawl(options: WebCrawlStartOptions): Promise<WebCrawlResponse> {
  const res = await fetch('/api/web/crawl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(errorBody.message || errorBody.error || `Web crawl failed (${res.status})`);
  }

  return res.json();
}

export async function fetchWebCrawlStatus(id: string): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/api/web/crawl/${encodeURIComponent(id)}`);
}

export async function fetchWebCrawlHistory(limit = 10): Promise<{ sessions: Record<string, unknown>[] }> {
  return apiFetch<{ sessions: Record<string, unknown>[] }>(`/api/web/history?limit=${limit}`);
}

// ─── RAG Strategic Intelligence Operations ──────────────────────────────────

export async function sendRagQuery(ragQuery: RagQuery): Promise<RagAnswer> {
  const res = await fetch('/api/rag/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: ragQuery.query,
      brand: ragQuery.brandFilter,
      month: ragQuery.monthFilter,
      channel: ragQuery.channelFilter,
      platform: ragQuery.platformFilter,
      sku_id: ragQuery.skuFilter,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(errorBody.message || errorBody.error || `RAG query failed (${res.status})`);
  }

  return res.json();
}

// ─── Authoritative Insights Operations ──────────────────────────────────────

export async function fetchInsights(
  month: AnalyticalMonth = 'ALL',
  brand: TargetBrand | 'All' = 'All',
  limit = 5
): Promise<InsightsApiResponse> {
  const params = new URLSearchParams({
    month,
    brand,
    limit: String(limit),
  });
  return apiFetch<InsightsApiResponse>(`/api/insights?${params.toString()}`);
}




