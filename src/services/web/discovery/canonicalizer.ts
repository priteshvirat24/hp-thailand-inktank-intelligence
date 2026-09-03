/**
 * Canonical Link Extractor & Resolver
 */

import { resolveRelativeUrl, validateUrlSafety } from './urlNormalizer';

/**
 * Extracts and validates the canonical link from HTML markup.
 */
export function extractCanonicalUrl(html: string, baseUrl: string): string | null {
  if (!html) return null;

  // Regex to match <link rel="canonical" href="..." />
  const canonicalMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) ||
                         html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);

  if (!canonicalMatch || !canonicalMatch[1]) {
    return null;
  }

  const rawCanonical = canonicalMatch[1];
  const resolved = resolveRelativeUrl(rawCanonical, baseUrl);
  if (!resolved) return null;

  const safety = validateUrlSafety(resolved);
  return safety.safe ? safety.normalizedUrl : null;
}
