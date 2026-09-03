/**
 * Scraper Provider Contracts (Apify, Bright Data, Direct HTTP)
 */

import { ScraperProviderName } from '../types';
import { CrawlTarget } from '@/config/seeds';

export interface ProviderRequest {
  readonly target: CrawlTarget;
  readonly maxItems?: number;
  readonly options?: Record<string, unknown>;
  readonly customPayload?: unknown[];
}

export interface ProviderResponse {
  readonly success: boolean;
  readonly provider: ScraperProviderName;
  readonly data: unknown[];
  readonly rawHtml?: string;
  readonly executionTimeMs: number;
  readonly errorMessage?: string;
  readonly retriesAttempted?: number;
}

export type ProviderHealthStatus =
  | 'CONFIGURED'
  | 'NOT_CONFIGURED'
  | 'REACHABLE'
  | 'UNREACHABLE'
  | 'ERROR'
  | 'HEALTHY'
  | 'UNHEALTHY'
  | 'UNCONFIGURED';

export interface ProviderHealth {
  readonly provider: ScraperProviderName;
  readonly status: ProviderHealthStatus;
  readonly configured: boolean;
  readonly message?: string;
}

export interface ScraperProvider {
  readonly name: ScraperProviderName;
  run(request: ProviderRequest): Promise<ProviderResponse>;
  healthCheck(): Promise<ProviderHealth>;
}
