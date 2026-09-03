/**
 * Direct HTTP Fetcher with SSRF Guardrails, Timeout & Redirect Safety
 */

import { createHash } from 'crypto';
import { validateUrlSafety, normalizeUrl } from '../discovery/urlNormalizer';
import { WebErrorCode } from './types';

export interface DirectHttpResult {
  success: boolean;
  httpStatus: number | null;
  finalUrl: string;
  redirectChain: string[];
  html: string;
  contentType: string | null;
  durationMs: number;
  contentHash: string;
  errorCode?: WebErrorCode;
  errorMessage?: string;
}

export async function fetchDirectHttp(
  targetUrl: string,
  options: { timeoutMs?: number } = {}
): Promise<DirectHttpResult> {
  const startTime = Date.now();
  const timeoutMs = options.timeoutMs || 8000;

  // 1. SSRF Safety check on initial URL
  const safety = validateUrlSafety(targetUrl);
  if (!safety.safe) {
    return {
      success: false,
      httpStatus: null,
      finalUrl: targetUrl,
      redirectChain: [],
      html: '',
      contentType: null,
      durationMs: Date.now() - startTime,
      contentHash: '',
      errorCode: 'SSRF_BLOCKED',
      errorMessage: safety.reason || 'Blocked by SSRF policy.',
    };
  }

  const currentUrl = safety.normalizedUrl;
  const redirectChain: string[] = [currentUrl];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7',
      'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
    };

    const response = await fetch(currentUrl, {
      method: 'GET',
      headers,
      redirect: 'follow',
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    const finalUrl = normalizeUrl(response.url || currentUrl);
    if (finalUrl !== currentUrl) {
      redirectChain.push(finalUrl);
      // Re-validate final redirect target for SSRF
      const finalSafety = validateUrlSafety(finalUrl);
      if (!finalSafety.safe) {
        return {
          success: false,
          httpStatus: response.status,
          finalUrl,
          redirectChain,
          html: '',
          contentType: response.headers.get('content-type'),
          durationMs: Date.now() - startTime,
          contentHash: '',
          errorCode: 'SSRF_BLOCKED',
          errorMessage: `Redirected to blocked target: ${finalSafety.reason}`,
        };
      }
    }

    const contentType = response.headers.get('content-type');
    const text = await response.text();
    const durationMs = Date.now() - startTime;
    const contentHash = createHash('sha256').update(text, 'utf8').digest('hex');

    // HTTP Error Mapping
    if (!response.ok) {
      let errorCode: WebErrorCode = 'HTTP_5XX';
      if (response.status === 401) errorCode = 'HTTP_401';
      else if (response.status === 403) errorCode = 'HTTP_403';
      else if (response.status === 404) errorCode = 'HTTP_404';
      else if (response.status === 429) errorCode = 'HTTP_429';

      return {
        success: false,
        httpStatus: response.status,
        finalUrl,
        redirectChain,
        html: text,
        contentType,
        durationMs,
        contentHash,
        errorCode,
        errorMessage: `HTTP ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: true,
      httpStatus: response.status,
      finalUrl,
      redirectChain,
      html: text,
      contentType,
      durationMs,
      contentHash,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const isTimeout = error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'));

    return {
      success: false,
      httpStatus: null,
      finalUrl: currentUrl,
      redirectChain,
      html: '',
      contentType: null,
      durationMs,
      contentHash: '',
      errorCode: isTimeout ? 'TIMEOUT' : 'PROVIDER_ERROR',
      errorMessage: error instanceof Error ? error.message : 'Network fetch failed.',
    };
  }
}
