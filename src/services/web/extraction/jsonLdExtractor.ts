/**
 * Schema.org JSON-LD Structured Data Extractor
 * 
 * Safely parses <script type="application/ld+json"> blocks and extracts:
 * - Product
 * - Offer
 * - AggregateRating
 * - Review
 * - BreadcrumbList
 * - Article / NewsArticle
 */

export interface ParsedJsonLdProduct {
  name?: string;
  brand?: string;
  model?: string;
  sku?: string;
  mpn?: string;
  price?: number;
  priceCurrency?: string;
  availability?: string;
  ratingValue?: number;
  reviewCount?: number;
  images?: string[];
  description?: string;
  category?: string;
}

export interface ParsedJsonLdData {
  products: ParsedJsonLdProduct[];
  breadcrumbs: string[];
  articles: { headline?: string; datePublished?: string; author?: string }[];
}

export function extractJsonLd(html: string): ParsedJsonLdData {
  const result: ParsedJsonLdData = {
    products: [],
    breadcrumbs: [],
    articles: [],
  };

  if (!html) return result;

  const scriptRegex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html)) !== null) {
    const jsonStr = match[1]?.trim();
    if (!jsonStr) continue;

    try {
      const parsed = JSON.parse(jsonStr);
      processJsonLdNode(parsed, result);
    } catch {
      // Ignore malformed JSON-LD blocks
    }
  }

  return result;
}

function processJsonLdNode(node: unknown, out: ParsedJsonLdData): void {
  if (!node || typeof node !== 'object') return;

  if (Array.isArray(node)) {
    for (const item of node) {
      processJsonLdNode(item, out);
    }
    return;
  }

  const obj = node as Record<string, unknown>;

  // Handle @graph collections
  if (Array.isArray(obj['@graph'])) {
    for (const item of obj['@graph']) {
      processJsonLdNode(item, out);
    }
  }

  const type = String(obj['@type'] || '');

  // 1. Product extraction
  if (type === 'Product' || type.includes('Product')) {
    const prod: ParsedJsonLdProduct = {};

    if (obj.name) prod.name = String(obj.name);
    if (obj.model) prod.model = typeof obj.model === 'string' ? obj.model : (obj.model as Record<string, string>)?.name;
    if (obj.sku) prod.sku = String(obj.sku);
    if (obj.mpn) prod.mpn = String(obj.mpn);
    if (obj.description) prod.description = String(obj.description);
    if (obj.category) prod.category = String(obj.category);

    // Brand extraction
    if (obj.brand) {
      prod.brand = typeof obj.brand === 'string' ? obj.brand : String((obj.brand as Record<string, string>)?.name || '');
    }

    // Image extraction
    if (obj.image) {
      if (Array.isArray(obj.image)) {
        prod.images = obj.image.map(String);
      } else {
        prod.images = [String(obj.image)];
      }
    }

    // Offers (Pricing & Availability)
    const offers = obj.offers;
    if (offers && typeof offers === 'object') {
      const offerList = Array.isArray(offers) ? offers : [offers];
      const primaryOffer = offerList[0] as Record<string, unknown>;
      if (primaryOffer) {
        if (primaryOffer.price !== undefined) {
          const numPrice = parseFloat(String(primaryOffer.price).replace(/,/g, ''));
          if (!isNaN(numPrice)) prod.price = numPrice;
        }
        if (primaryOffer.priceCurrency) prod.priceCurrency = String(primaryOffer.priceCurrency);
        if (primaryOffer.availability) {
          const avail = String(primaryOffer.availability);
          prod.availability = avail.includes('InStock') ? 'InStock' : avail.includes('OutOfStock') ? 'OutOfStock' : 'PreOrder';
        }
      }
    }

    // Aggregate Rating
    const aggRating = obj.aggregateRating as Record<string, unknown>;
    if (aggRating) {
      if (aggRating.ratingValue !== undefined) {
        const rVal = parseFloat(String(aggRating.ratingValue));
        if (!isNaN(rVal)) prod.ratingValue = rVal;
      }
      if (aggRating.reviewCount !== undefined) {
        const rCount = parseInt(String(aggRating.reviewCount), 10);
        if (!isNaN(rCount)) prod.reviewCount = rCount;
      }
    }

    out.products.push(prod);
  }

  // 2. BreadcrumbList extraction
  if (type === 'BreadcrumbList') {
    const items = obj.itemListElement;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item && typeof item === 'object') {
          const name = (item as Record<string, unknown>).name;
          if (name) out.breadcrumbs.push(String(name));
        }
      }
    }
  }

  // 3. Article extraction
  if (type === 'Article' || type === 'NewsArticle' || type === 'BlogPosting') {
    out.articles.push({
      headline: obj.headline ? String(obj.headline) : undefined,
      datePublished: obj.datePublished ? String(obj.datePublished) : undefined,
      author: obj.author ? (typeof obj.author === 'string' ? obj.author : String((obj.author as Record<string, string>)?.name || '')) : undefined,
    });
  }
}
