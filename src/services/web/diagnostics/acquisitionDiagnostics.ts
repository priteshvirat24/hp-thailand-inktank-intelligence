/**
 * Domain Diagnostics & Crawlability Inspector
 */

import { CrawlabilityStatus, AcquisitionStrategy } from '../acquisition/types';
import { validateUrlSafety } from '../discovery/urlNormalizer';
import { routeAcquisitionStrategy } from '../acquisition/acquisitionRouter';
import { inspectHtml } from '../extraction/htmlExtractor';
import { discoverRobotsTxt } from '../discovery/robotsDiscovery';
import { robotsPolicyEngine } from '../policies/robotsPolicy';
import { DirectHttpResult, fetchDirectHttp } from '../acquisition/directHttpFetcher';

export interface DomainDiagnosticsResponse {
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
  crawlability_status: CrawlabilityStatus;
  recommended_strategy: AcquisitionStrategy;
  recommendation_reason: string;
  diagnosed_at: string;
}

export async function runDomainDiagnostics(
  rawUrl: string,
  options?: { mockProbe?: DirectHttpResult }
): Promise<DomainDiagnosticsResponse> {
  const safety = validateUrlSafety(rawUrl);
  if (!safety.safe) {
    return {
      url: rawUrl,
      normalized_url: '',
      domain: safety.domain || 'unknown',
      is_safe: false,
      safety_reason: safety.reason,
      robots_status: 'UNKNOWN',
      http_status: null,
      content_type: null,
      is_js_required: false,
      is_blocked: true,
      blocked_reason: safety.reason,
      crawlability_status: 'BLOCKED',
      recommended_strategy: 'DIRECT_HTTP',
      recommendation_reason: safety.reason || 'Blocked by security policy',
      diagnosed_at: new Date().toISOString(),
    };
  }

  const domain = safety.domain;
  const normalizedUrl = safety.normalizedUrl;

  // 1. Robots check
  let robotsStatus: 'ALLOWED' | 'DISALLOWED' | 'UNKNOWN' = 'ALLOWED';
  if (!options?.mockProbe) {
    try {
      const robots = await discoverRobotsTxt(domain);
      const urlObj = new URL(normalizedUrl);
      const allowed = robotsPolicyEngine.isAllowed(robots, urlObj.pathname);
      robotsStatus = allowed ? 'ALLOWED' : 'DISALLOWED';
    } catch {
      robotsStatus = 'UNKNOWN';
    }
  }

  // 2. Routing Recommendation
  const routing = routeAcquisitionStrategy(normalizedUrl);

  // 3. Direct HTTP Probe
  const probe = options?.mockProbe || (await fetchDirectHttp(normalizedUrl, { timeoutMs: 3000 }));
  const inspection = inspectHtml(probe.html);

  // 4. Crawlability Assessment
  let crawlabilityStatus: CrawlabilityStatus = 'EASY';
  if (!probe.success) {
    if (probe.httpStatus === 403 || probe.errorCode === 'HTTP_403') crawlabilityStatus = 'BLOCKED';
    else if (probe.httpStatus === 404) crawlabilityStatus = 'NOT_FOUND';
    else if (probe.httpStatus === 401) crawlabilityStatus = 'AUTH_REQUIRED';
    else if (probe.errorCode === 'TIMEOUT') crawlabilityStatus = 'PROVIDER_REQUIRED';
    else crawlabilityStatus = 'UNKNOWN';
  } else if (inspection.isBlocked) {
    crawlabilityStatus = 'BLOCKED';
  } else if (inspection.isJsRequired) {
    crawlabilityStatus = 'RENDER_REQUIRED';
  } else if (robotsStatus === 'DISALLOWED') {
    crawlabilityStatus = 'ROBOTS_DISALLOWED';
  }

  return {
    url: rawUrl,
    normalized_url: normalizedUrl,
    domain,
    is_safe: true,
    robots_status: robotsStatus,
    http_status: probe.httpStatus,
    content_type: probe.contentType,
    is_js_required: inspection.isJsRequired,
    is_blocked: inspection.isBlocked,
    blocked_reason: inspection.blockedReason || probe.errorMessage,
    crawlability_status: crawlabilityStatus,
    recommended_strategy: routing.strategy,
    recommendation_reason: routing.reason,
    diagnosed_at: new Date().toISOString(),
  };
}
