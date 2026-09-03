/**
 * Search & SERP Candidate Discovery Engine
 * 
 * Generates bounded, deterministic search discovery candidates across:
 * - 28 Canonical SKUs
 * - 4 Target Brands (HP, Epson, Canon, Brother)
 * - Major Thai e-commerce & retail domains
 */

import { WebDiscoveryCandidate } from '../acquisition/types';
import { TargetBrand } from '@/types/brands';
import { CANONICAL_SKUS } from '@/config/skus';

const TOP_RETAIL_DOMAINS = [
  'shopee.co.th',
  'lazada.co.th',
  'jib.co.th',
  'advice.co.th',
  'powerbuy.co.th',
  'bnn.in.th',
];

export interface SearchQueryOptions {
  query?: string;
  brand?: TargetBrand;
  skuId?: string;
  maxCandidates?: number;
}

export function generateDiscoveryCandidates(options: SearchQueryOptions = {}): WebDiscoveryCandidate[] {
  const candidates: WebDiscoveryCandidate[] = [];
  const max = options.maxCandidates || 20;

  // Filter SKUs if specified
  let targetSkus = CANONICAL_SKUS;
  if (options.brand) {
    targetSkus = targetSkus.filter((s) => s.brand === options.brand);
  }
  if (options.skuId) {
    targetSkus = targetSkus.filter((s) => s.sku_id === options.skuId);
  }

  // 1. If explicit query provided, generate candidates from retail domains
  if (options.query) {
    const qSlug = encodeURIComponent(options.query.trim());
    for (const domain of TOP_RETAIL_DOMAINS) {
      if (candidates.length >= max) break;
      let url = `https://${domain}/search?q=${qSlug}`;
      if (domain === 'shopee.co.th') url = `https://shopee.co.th/search?keyword=${qSlug}`;
      else if (domain === 'lazada.co.th') url = `https://www.lazada.co.th/catalog/?q=${qSlug}`;

      candidates.push({
        url,
        domain,
        title: `${options.query} on ${domain}`,
        discovery_source: 'SEARCH_SERP',
        ranking: candidates.length + 1,
        discovered_at: new Date().toISOString(),
        brand_hint: options.brand,
        sku_hint: options.skuId,
      });
    }
    return candidates;
  }

  // 2. Generate canonical product discovery URLs
  for (const sku of targetSkus) {
    if (candidates.length >= max) break;

    const brandDomain =
      sku.brand === 'HP'
        ? 'hp.com'
        : sku.brand === 'Epson'
        ? 'epson.co.th'
        : sku.brand === 'Canon'
        ? 'canon.co.th'
        : 'brother.co.th';

    const brandUrl = `https://www.${brandDomain}/printers/${sku.model_name.toLowerCase().replace(/\s+/g, '-')}`;

    candidates.push({
      url: brandUrl,
      domain: brandDomain,
      title: `${sku.brand} ${sku.model_name} Official Product Page`,
      discovery_source: 'SEED_REGISTRY',
      ranking: candidates.length + 1,
      discovered_at: new Date().toISOString(),
      brand_hint: sku.brand,
      sku_hint: sku.sku_id,
    });

    // Marketplace search candidate
    const shopeeSearch = `https://shopee.co.th/search?keyword=${encodeURIComponent(`${sku.brand} ${sku.model_name}`)}`;
    candidates.push({
      url: shopeeSearch,
      domain: 'shopee.co.th',
      title: `${sku.brand} ${sku.model_name} on Shopee Mall`,
      discovery_source: 'SEARCH_SERP',
      ranking: candidates.length + 1,
      discovered_at: new Date().toISOString(),
      brand_hint: sku.brand,
      sku_hint: sku.sku_id,
    });
  }

  return candidates.slice(0, max);
}
