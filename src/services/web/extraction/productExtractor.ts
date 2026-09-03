/**
 * Unified Generic Product Page Extractor
 * 
 * Extraction Priority:
 * 1. Schema.org JSON-LD (<script type="application/ld+json">)
 * 2. Explicit Meta / OpenGraph tags
 * 3. DOM text & Thai currency patterns
 */

import { ExtractedProductData, SourceQuality } from '../acquisition/types';
import { extractJsonLd } from './jsonLdExtractor';
import { extractMetaTags } from './metaExtractor';
import { extractPriceFromText } from './priceExtractor';
import { extractSocialProof } from './reviewExtractor';
import { inspectHtml } from './htmlExtractor';
import { extractDomain } from '../discovery/urlNormalizer';

export function extractProductFromHtml(html: string, pageUrl: string): ExtractedProductData {
  const domain = extractDomain(pageUrl);
  const jsonLd = extractJsonLd(html);
  const meta = extractMetaTags(html);
  const inspection = inspectHtml(html);
  const priceFromText = extractPriceFromText(inspection.visibleText);
  const socialProof = extractSocialProof(inspection.visibleText);

  const jsonLdProduct = jsonLd.products[0];
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const h1Text = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').trim() : null;

  // 1. Title Resolution
  const title = jsonLdProduct?.name || meta.ogTitle || meta.title || inspection.title || h1Text || null;

  // 2. Brand Resolution
  let brand = jsonLdProduct?.brand || null;
  if (!brand && title) {
    if (/\bhp\b/i.test(title)) brand = 'HP';
    else if (/\bepson\b/i.test(title)) brand = 'Epson';
    else if (/\bcanon\b/i.test(title)) brand = 'Canon';
    else if (/\bbrother\b/i.test(title)) brand = 'Brother';
  }

  // 3. Price Resolution
  const priceCurrent = jsonLdProduct?.price ?? priceFromText.price_current_thb;
  const priceOriginal = priceFromText.price_original_thb;
  let discountPct = priceFromText.discount_pct;

  if (priceOriginal && priceCurrent && priceOriginal > priceCurrent && !discountPct) {
    discountPct = Math.round(((priceOriginal - priceCurrent) / priceOriginal) * 100);
  }

  // 4. Rating & Reviews
  const rating = jsonLdProduct?.ratingValue ?? socialProof.rating;
  const reviewCount = jsonLdProduct?.reviewCount ?? socialProof.review_count;
  const soldCount = socialProof.sold_count;

  // 5. Source Quality Attribution
  let sourceQuality: SourceQuality = 'UNKNOWN';
  if (domain.includes('hp.com') || domain.includes('epson.co.th') || domain.includes('canon.co.th') || domain.includes('brother.co.th')) {
    sourceQuality = 'OFFICIAL_BRAND';
  } else if (domain.includes('shopee') || domain.includes('lazada') || domain.includes('tiktok.com')) {
    sourceQuality = 'MARKETPLACE';
  } else if (domain.includes('jib.co.th') || domain.includes('advice.co.th') || domain.includes('bnn.in.th') || domain.includes('powerbuy.co.th')) {
    sourceQuality = 'OFFICIAL_RETAILER';
  }

  // 6. Descriptions
  const descriptionTh = jsonLdProduct?.description || meta.ogDescription || meta.description || null;

  return {
    title,
    brand,
    model: jsonLdProduct?.model || null,
    sku: jsonLdProduct?.sku || null,
    mpn: jsonLdProduct?.mpn || null,
    price_current_thb: priceCurrent ?? null,
    price_original_thb: priceOriginal ?? null,
    currency: jsonLdProduct?.priceCurrency || 'THB',
    discount_pct: discountPct ?? null,
    raw_price_text: priceFromText.raw_price_text,
    availability: jsonLdProduct?.availability as ExtractedProductData['availability'] || 'Unknown',
    rating: rating ?? null,
    review_count: reviewCount ?? null,
    sold_count: soldCount,
    description_th: descriptionTh,
    description_en: null,
    seller_name: domain,
    is_official_store: sourceQuality === 'OFFICIAL_BRAND' || sourceQuality === 'OFFICIAL_RETAILER',
    images: jsonLdProduct?.images || (meta.ogImage ? [meta.ogImage] : []),
    specifications: {},
    breadcrumbs: jsonLd.breadcrumbs,
    page_type: inspection.pageClassification,
    source_quality: sourceQuality,
  };
}
