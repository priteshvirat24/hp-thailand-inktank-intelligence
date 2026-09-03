/**
 * Master Web Acquisition Service
 * 
 * Orchestrates:
 * URL Validation (SSRF) → Robots Check → Rate Limiting →
 * Strategy Routing → Direct HTTP / Browser Escalation →
 * Content Extraction → WebAcquisitionResult
 */

import { createHash } from 'crypto';
import {
  WebAcquisitionResult,
  AcquisitionStrategy,
  AcquisitionStatus,
} from './types';
import { validateUrlSafety } from '../discovery/urlNormalizer';
import { robotsPolicyEngine } from '../policies/robotsPolicy';
import { rateLimitPolicyEngine } from '../policies/rateLimitPolicy';
import { routeAcquisitionStrategy } from './acquisitionRouter';
import { fetchDirectHttp, DirectHttpResult } from './directHttpFetcher';
import { fetchWithBrowserEscalation } from './browserFetcher';
import { extractContent } from '../extraction/contentExtractor';

export class AcquisitionService {
  /**
   * Acquires a single web page with automated escalation fallback.
   */
  public async acquireUrl(
    targetUrl: string,
    options: {
      forceStrategy?: AcquisitionStrategy;
      bypassRobots?: boolean;
      crawlId?: string;
      customHtml?: string; // For testing and mocking
    } = {}
  ): Promise<WebAcquisitionResult> {
    const startTime = Date.now();
    const acquisitionId = `ACQ-${createHash('sha256').update(targetUrl + Date.now().toString()).digest('hex').slice(0, 12).toUpperCase()}`;

    // 1. URL Safety & SSRF Validation
    const safety = validateUrlSafety(targetUrl);
    if (!safety.safe) {
      return this.buildResult({
        acquisitionId,
        targetUrl,
        finalUrl: targetUrl,
        domain: safety.domain || 'unknown',
        status: 'SSRF_BLOCKED',
        strategy: 'DIRECT_HTTP',
        provider: 'DIRECT',
        httpStatus: null,
        durationMs: Date.now() - startTime,
        errorCode: 'SSRF_BLOCKED',
        blockedReason: safety.reason,
        html: '',
        contentHash: '',
        crawlId: options.crawlId,
      });
    }

    const domain = safety.domain;
    const normalizedUrl = safety.normalizedUrl;

    // 2. Robots.txt Compliance Check
    let robotsState: 'ALLOWED' | 'DISALLOWED' | 'UNKNOWN' = 'ALLOWED';
    if (!options.bypassRobots) {
      const cachedRobots = robotsPolicyEngine.getCached(domain);
      if (cachedRobots) {
        const urlObj = new URL(normalizedUrl);
        const allowed = robotsPolicyEngine.isAllowed(cachedRobots, urlObj.pathname);
        if (!allowed) {
          robotsState = 'DISALLOWED';
          return this.buildResult({
            acquisitionId,
            targetUrl: normalizedUrl,
            finalUrl: normalizedUrl,
            domain,
            status: 'ROBOTS_DISALLOWED',
            strategy: 'DIRECT_HTTP',
            provider: 'DIRECT',
            httpStatus: null,
            durationMs: Date.now() - startTime,
            errorCode: 'ROBOTS_DISALLOWED',
            blockedReason: 'Disallowed by domain robots.txt policy.',
            html: '',
            contentHash: '',
            robotsState: 'DISALLOWED',
            crawlId: options.crawlId,
          });
        }
      }
    }

    // 3. Apply Rate Limiting
    await rateLimitPolicyEngine.throttle(domain);

    // 4. Determine Initial Strategy
    const routing = routeAcquisitionStrategy(normalizedUrl, options.forceStrategy);
    let activeStrategy = routing.strategy;
    let activeProvider = routing.provider;

    // 5. Fetch Page Content
    let fetchResult: DirectHttpResult;

    if (options.customHtml) {
      // Mocked custom payload (used in tests)
      fetchResult = {
        success: true,
        httpStatus: 200,
        finalUrl: normalizedUrl,
        redirectChain: [normalizedUrl],
        html: options.customHtml,
        contentType: 'text/html',
        durationMs: Date.now() - startTime,
        contentHash: createHash('sha256').update(options.customHtml, 'utf8').digest('hex'),
      };
    } else if (activeStrategy === 'DIRECT_HTTP' || activeStrategy === 'STRUCTURED_HTML') {
      fetchResult = await fetchDirectHttp(normalizedUrl);

      // Automated Escalation 1: If 403 / 429 blocked, escalate to Bright Data if available
      if (!fetchResult.success && (fetchResult.httpStatus === 403 || fetchResult.httpStatus === 429)) {
        activeStrategy = 'BRIGHTDATA_UNLOCKER';
        activeProvider = 'BRIGHTDATA';
        const escalated = await fetchWithBrowserEscalation(normalizedUrl, 'brightdata');
        if (escalated.success) {
          fetchResult = escalated;
        }
      }
    } else if (activeStrategy.startsWith('BRIGHTDATA')) {
      fetchResult = await fetchWithBrowserEscalation(normalizedUrl, 'brightdata');
    } else if (activeStrategy.startsWith('APIFY')) {
      fetchResult = await fetchWithBrowserEscalation(normalizedUrl, 'apify');
    } else {
      fetchResult = await fetchDirectHttp(normalizedUrl);
    }

    // Record rate-limit feedback
    if (fetchResult.success) {
      rateLimitPolicyEngine.recordSuccess(domain);
    } else {
      rateLimitPolicyEngine.recordError(domain);
    }

    // 6. Inspect & Extract Content
    const extraction = extractContent(fetchResult.html, fetchResult.finalUrl);

    // Automated Escalation 2: If JS-required shell detected from direct HTTP, escalate to browser
    if (fetchResult.success && extraction.isJsRequired && (activeStrategy === 'DIRECT_HTTP' || activeStrategy === 'STRUCTURED_HTML')) {
      const browserResp = await fetchWithBrowserEscalation(fetchResult.finalUrl, 'brightdata');
      if (browserResp.success && browserResp.html.length > fetchResult.html.length) {
        fetchResult = browserResp;
        activeStrategy = 'BRIGHTDATA_BROWSER';
        activeProvider = 'BRIGHTDATA';
      }
    }

    // 7. Status Resolution
    let finalStatus: AcquisitionStatus = 'SUCCESS';
    if (!fetchResult.success) {
      if (fetchResult.errorCode === 'SSRF_BLOCKED') finalStatus = 'SSRF_BLOCKED';
      else if (fetchResult.errorCode === 'HTTP_401' || fetchResult.errorCode === 'AUTH_REQUIRED') finalStatus = 'AUTH_REQUIRED';
      else if (fetchResult.errorCode === 'HTTP_403') finalStatus = 'BLOCKED';
      else if (fetchResult.errorCode === 'HTTP_404') finalStatus = 'NOT_FOUND';
      else if (fetchResult.errorCode === 'HTTP_429') finalStatus = 'RATE_LIMITED';
      else if (fetchResult.errorCode === 'TIMEOUT') finalStatus = 'TIMEOUT';
      else if (fetchResult.errorCode === 'PROVIDER_NOT_CONFIGURED') finalStatus = 'PROVIDER_ERROR';
      else finalStatus = 'ERROR';
    } else if (extraction.isBlocked) {
      finalStatus = 'BLOCKED';
    } else if (extraction.isJsRequired) {
      finalStatus = 'JS_REQUIRED';
    } else if (!extraction.productData.title && extraction.discoveredLinks.length === 0) {
      finalStatus = 'EMPTY_CONTENT';
    }

    return {
      acquisition_id: acquisitionId,
      requested_url: targetUrl,
      final_url: fetchResult.finalUrl,
      canonical_url: extraction.canonicalUrl,
      domain,
      status: finalStatus,
      strategy: activeStrategy,
      provider: activeProvider,
      http_status: fetchResult.httpStatus,
      content_type: fetchResult.contentType,
      fetched_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      html: fetchResult.html,
      title: extraction.productData.title,
      language: extraction.language,
      robots_state: robotsState,
      extraction_state: extraction.productData.title ? 'COMPLETE' : 'PARTIAL',
      javascript_required: extraction.isJsRequired,
      blocked_reason: extraction.blockedReason || fetchResult.errorMessage,
      error_code: fetchResult.errorCode,
      retry_count: 0,
      redirect_chain: fetchResult.redirectChain,
      discovered_urls: extraction.discoveredLinks.map((l) => l.url),
      content_hash: fetchResult.contentHash,
      provenance: {
        acquisition_method: activeStrategy,
        acquisition_provider: activeProvider,
        acquisition_strategy: activeStrategy,
        requested_url: targetUrl,
        final_url: fetchResult.finalUrl,
        canonical_url: extraction.canonicalUrl,
        captured_at: new Date().toISOString(),
        content_hash: fetchResult.contentHash,
        source_type: extraction.productData.page_type === 'PRODUCT' ? 'JSON_LD' : 'HTML_META',
        source_quality: extraction.productData.source_quality,
        crawl_id: options.crawlId,
        extraction_method: 'Unified Content Extractor',
        parser_version: 'v1.0.0',
      },
    };
  }

  private buildResult(params: {
    acquisitionId: string;
    targetUrl: string;
    finalUrl: string;
    domain: string;
    status: AcquisitionStatus;
    strategy: AcquisitionStrategy;
    provider: string;
    httpStatus: number | null;
    durationMs: number;
    errorCode?: WebAcquisitionResult['error_code'];
    blockedReason?: string;
    html: string;
    contentHash: string;
    robotsState?: 'ALLOWED' | 'DISALLOWED' | 'UNKNOWN' | 'ERROR';
    crawlId?: string;
  }): WebAcquisitionResult {
    return {
      acquisition_id: params.acquisitionId,
      requested_url: params.targetUrl,
      final_url: params.finalUrl,
      canonical_url: null,
      domain: params.domain,
      status: params.status,
      strategy: params.strategy,
      provider: params.provider,
      http_status: params.httpStatus,
      content_type: null,
      fetched_at: new Date().toISOString(),
      duration_ms: params.durationMs,
      html: params.html,
      title: null,
      language: 'unknown',
      robots_state: params.robotsState || 'UNKNOWN',
      extraction_state: 'FAILED',
      javascript_required: false,
      blocked_reason: params.blockedReason,
      error_code: params.errorCode,
      retry_count: 0,
      redirect_chain: [params.targetUrl],
      discovered_urls: [],
      content_hash: params.contentHash,
      provenance: {
        acquisition_method: params.strategy,
        acquisition_provider: params.provider,
        acquisition_strategy: params.strategy,
        requested_url: params.targetUrl,
        final_url: params.finalUrl,
        canonical_url: null,
        captured_at: new Date().toISOString(),
        content_hash: params.contentHash,
        source_type: 'HTML_META',
        source_quality: 'UNKNOWN',
        crawl_id: params.crawlId,
        extraction_method: 'Failed Acquisition',
        parser_version: 'v1.0.0',
      },
    };
  }
}

export const acquisitionService = new AcquisitionService();
