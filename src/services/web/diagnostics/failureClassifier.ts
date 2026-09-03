/**
 * Error Taxonomy Mapper & Failure Classifier
 */

import { WebErrorCode } from '../acquisition/types';

export function classifyHttpFailure(status: number | null, errorMessage?: string): WebErrorCode {
  if (status === 401) return 'HTTP_401';
  if (status === 403) return 'HTTP_403';
  if (status === 404) return 'HTTP_404';
  if (status === 429) return 'HTTP_429';
  if (status && status >= 500) return 'HTTP_5XX';

  const msgLower = (errorMessage || '').toLowerCase();
  if (msgLower.includes('timeout') || msgLower.includes('abort')) return 'TIMEOUT';
  if (msgLower.includes('ssrf') || msgLower.includes('blocked target')) return 'SSRF_BLOCKED';
  if (msgLower.includes('dns') || msgLower.includes('getaddrinfo')) return 'DNS_ERROR';
  if (msgLower.includes('tls') || msgLower.includes('ssl') || msgLower.includes('cert')) return 'TLS_ERROR';
  if (msgLower.includes('robots')) return 'ROBOTS_DISALLOWED';
  if (msgLower.includes('provider not configured')) return 'PROVIDER_NOT_CONFIGURED';

  return 'PROVIDER_ERROR';
}
