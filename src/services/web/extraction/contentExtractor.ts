/**
 * Master Content Extraction Coordinator
 */

import { ExtractedProductData } from '../acquisition/types';
import { extractProductFromHtml } from './productExtractor';
import { inspectHtml } from './htmlExtractor';
import { extractLinksFromHtml, DiscoveredLink } from '../discovery/linkExtractor';
import { extractCanonicalUrl } from '../discovery/canonicalizer';

export interface ComprehensiveExtraction {
  productData: ExtractedProductData;
  canonicalUrl: string | null;
  discoveredLinks: DiscoveredLink[];
  isBlocked: boolean;
  blockedReason?: string;
  isJsRequired: boolean;
  jsRequiredReason?: string;
  language: 'th' | 'en' | 'th-en' | 'unknown';
}

export function extractContent(html: string, pageUrl: string): ComprehensiveExtraction {
  const inspection = inspectHtml(html);
  const canonicalUrl = extractCanonicalUrl(html, pageUrl);
  const discoveredLinks = extractLinksFromHtml(html, pageUrl, 50);
  const productData = extractProductFromHtml(html, pageUrl);

  return {
    productData,
    canonicalUrl,
    discoveredLinks,
    isBlocked: inspection.isBlocked,
    blockedReason: inspection.blockedReason,
    isJsRequired: inspection.isJsRequired,
    jsRequiredReason: inspection.jsRequiredReason,
    language: inspection.language,
  };
}
