/**
 * URL Safety, SSRF Protection & Normalization Engine
 * 
 * Invariants:
 * - Strictly allows only http: and https: protocols.
 * - Blocks all private IP ranges, localhost, cloud metadata, and internal hostnames.
 * - Strips marketing tracking parameters while preserving product-identifying parameters.
 */

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'gclsrc',
  'dclid',
  'zanpid',
  'msclkid',
  'mc_eid',
  '_ga',
  '_gl',
  'ref',
  'spm',
  'spm_id',
  'from_source',
  'yclid',
  'wickedid',
  'twclid',
]);

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^0\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./, // AWS / GCP / Azure metadata endpoint
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /^fc00:/i,
  /^fe80:/i,
  /^::1$/,
];

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254',
  'instance-data',
  'metadata.google.internal',
  'metadata',
]);

export interface UrlSafetyCheck {
  safe: boolean;
  normalizedUrl: string;
  domain: string;
  reason?: string;
}

/**
 * Validates a URL against SSRF and protocol safety policies.
 */
export function validateUrlSafety(rawUrl: string): UrlSafetyCheck {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { safe: false, normalizedUrl: '', domain: '', reason: 'Empty or invalid URL' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { safe: false, normalizedUrl: '', domain: '', reason: 'Malformed URL' };
  }

  // 1. Protocol validation (http and https only)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      safe: false,
      normalizedUrl: '',
      domain: '',
      reason: `Blocked protocol '${parsed.protocol}'. Only http: and https: are permitted.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Blocked hostnames check
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return {
      safe: false,
      normalizedUrl: '',
      domain: hostname,
      reason: `Blocked SSRF target '${hostname}'.`,
    };
  }

  // 3. Internal TLD check
  if (
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.onion') ||
    hostname.endsWith('.corp') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.home')
  ) {
    return {
      safe: false,
      normalizedUrl: '',
      domain: hostname,
      reason: `Blocked internal/private domain suffix '${hostname}'.`,
    };
  }

  // 4. Private IPv4/IPv6 address pattern check
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return {
        safe: false,
        normalizedUrl: '',
        domain: hostname,
        reason: `Blocked private network IP address '${hostname}'.`,
      };
    }
  }

  // 5. Produce normalized URL
  const normalizedUrl = normalizeUrl(parsed.href);

  return {
    safe: true,
    normalizedUrl,
    domain: hostname.replace(/^www\./, ''),
  };
}

/**
 * Normalizes URL: removes tracking params, fragments, redundant ports and trailing slashes.
 */
export function normalizeUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);

    // Remove hash fragment
    url.hash = '';

    // Remove default ports
    if ((url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443')) {
      url.port = '';
    }

    // Filter tracking query params
    const searchParams = new URLSearchParams(url.search);
    const keysToDelete: string[] = [];

    searchParams.forEach((_, key) => {
      const keyLower = key.toLowerCase();
      if (TRACKING_PARAMS.has(keyLower) || keyLower.startsWith('utm_')) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((k) => searchParams.delete(k));
    url.search = searchParams.toString();

    // Remove trailing slash on paths longer than 1 character
    let finalPath = url.pathname;
    if (finalPath.length > 1 && finalPath.endsWith('/')) {
      finalPath = finalPath.slice(0, -1);
    }
    url.pathname = finalPath;

    return url.href;
  } catch {
    return urlStr;
  }
}

/**
 * Resolves relative URLs against a base URL.
 */
export function resolveRelativeUrl(relativeUrl: string, baseUrl: string): string | null {
  if (!relativeUrl || typeof relativeUrl !== 'string') return null;

  try {
    const cleanRelative = relativeUrl.trim();
    // Ignore javascript:, mailto:, tel:, # fragments
    if (
      cleanRelative.startsWith('javascript:') ||
      cleanRelative.startsWith('mailto:') ||
      cleanRelative.startsWith('tel:') ||
      cleanRelative.startsWith('#')
    ) {
      return null;
    }

    const resolved = new URL(cleanRelative, baseUrl);
    const safety = validateUrlSafety(resolved.href);
    return safety.safe ? safety.normalizedUrl : null;
  } catch {
    return null;
  }
}

/**
 * Extracts the registered domain / host from a URL without www.
 */
export function extractDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}
