/**
 * Authoritative Claim Extractor & Normalizer
 * 
 * Extracts and normalizes numerical claims from structured LLM outputs,
 * markdown tables, bullet lists, and unstructured prose.
 */

import { NumericalClaim } from '@/types/claims';
import { TargetBrand } from '@/types/brands';
import { TARGET_BRANDS } from '@/config/brands';
import { StructuredQueryPlan } from '@/types/rag';

const TEXT_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  'fifty-eight': 58,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
};

export class ClaimExtractor {
  /**
   * Normalizes a raw claim value, unit, and metric association.
   */
  public normalizeClaim(claim: NumericalClaim): NumericalClaim {
    const { value } = claim;
    let { unit, claim_type, brand } = claim;

    // 1. Normalize currency
    if (unit && /^(THB|baht|฿|บาท)$/i.test(unit.trim())) {
      unit = 'THB';
      claim_type = 'CURRENCY';
    }

    // 2. Normalize percentage
    if (unit && /^(%|percent|percentage|เปอร์เซ็นต์)$/i.test(unit.trim())) {
      unit = '%';
      claim_type = 'PERCENTAGE';
    }

    // 3. Normalize rating
    if (unit && /^(score|stars?|★|\/ 5|\/5|คะแนน)$/i.test(unit.trim())) {
      unit = 'Score';
      claim_type = 'RATING';
    }

    // 4. Normalize brand
    if (brand) {
      const bUpper = brand.toUpperCase();
      const matched = TARGET_BRANDS.find((b) => b.toUpperCase() === bUpper);
      brand = matched || brand;
    }

    return {
      ...claim,
      value,
      unit,
      claim_type,
      brand,
    };
  }

  /**
   * Extracts numerical claims from unstructured prose, markdown tables, and lists.
   */
  public extractProseClaims(text: string, plan: StructuredQueryPlan): NumericalClaim[] {
    const claims: NumericalClaim[] = [];
    const defaultBrand = plan.entities.brands[0] || 'HP';
    const defaultMonth = plan.entities.month || '2026-08';

    // ─── 0. Textual English Number Conversion ──────────────────────────────────
    let normalizedText = text;
    for (const [word, num] of Object.entries(TEXT_NUMBERS)) {
      const wRegex = new RegExp(`\\b${word}\\b`, 'gi');
      if (wRegex.test(normalizedText)) {
        normalizedText = normalizedText.replace(wRegex, num.toString());
      }
    }

    // ─── 1. Unsupported Domain Entities ─────────────────────────────────────────
    // A. Ad Reach / Impressions
    const reachMatches = [
      ...normalizedText.matchAll(/\b(\d+(?:\.\d+)?)\s*(million|m|k|billion)?\s*(?:unique\s+|ad\s+|video\s+)?(?:impressions?|reach|views|viewers|people\s+(?:saw|reached))\b/gi),
      ...normalizedText.matchAll(/\b(?:reached|saw|viewed)\s+(\d+(?:\.\d+)?)\s*(million|m|k|billion)?\s*(?:people|users|viewers)?\b/gi),
    ];
    for (const m of reachMatches) {
      claims.push({
        claim_id: `reach-${Math.random().toString(36).slice(2, 7)}`,
        claim_type: 'UNSUPPORTED',
        value: parseFloat(m[1]),
        unit: 'Impressions',
        brand: this.detectSurroundingBrand(normalizedText, m.index ?? 0, defaultBrand),
        month: defaultMonth,
        metric_id: 'UNSUPPORTED_AD_REACH',
        raw_text: m[0],
      });
    }

    // B. Financial Revenue / Profit
    const finMatches = normalizedText.matchAll(/(?:฿|THB|\$)\s*(\d+(?:\.\d+)?)\s*(million|m|b|billion)?\s*(?:in\s+)?(?:revenue|profit|net income|earnings|turnover)\b/gi);
    for (const m of finMatches) {
      claims.push({
        claim_id: `fin-${Math.random().toString(36).slice(2, 7)}`,
        claim_type: 'UNSUPPORTED',
        value: parseFloat(m[1]),
        unit: 'THB',
        brand: this.detectSurroundingBrand(normalizedText, m.index ?? 0, defaultBrand),
        month: defaultMonth,
        metric_id: 'UNSUPPORTED_REVENUE_PROFIT',
        raw_text: m[0],
      });
    }

    // C. Media Spend / Budget
    const spendMatches = normalizedText.matchAll(/(?:spent|budget|spend\s+of)\s*(?:฿|THB|\$)?\s*(\d+(?:\.\d+)?)\s*(million|m|b|billion)?\s*(?:THB|baht|dollars?)?\s*(?:on\s+(?:ads?|advertising|marketing))?\b/gi);
    for (const m of spendMatches) {
      claims.push({
        claim_id: `spend-${Math.random().toString(36).slice(2, 7)}`,
        claim_type: 'UNSUPPORTED',
        value: parseFloat(m[1]),
        unit: 'THB',
        brand: this.detectSurroundingBrand(normalizedText, m.index ?? 0, defaultBrand),
        month: defaultMonth,
        metric_id: 'UNSUPPORTED_MEDIA_SPEND',
        raw_text: m[0],
      });
    }

    // D. Actual Off-Platform Commercial Unit Sales (vs Observable Traction Index)
    const unitSalesMatches = [
      ...normalizedText.matchAll(/\b(\d[\d,]*)\s*(?:commercial\s+)?(?:printers?|units?)\s+(?:sold|were\s+sold)\b/gi),
      ...normalizedText.matchAll(/\b(?:sold|were\s+sold)\s+(\d[\d,]*)\s*(?:commercial\s+)?(?:printers?|units?)\b/gi),
    ];
    for (const m of unitSalesMatches) {
      const numVal = parseFloat(m[1].replace(/,/g, ''));
      const isTractionIntent =
        (plan.entities?.metrics?.includes('OBSERVABLE_SALES_TRACTION_INDEX') ?? false) ||
        plan.intent === 'TRACTION' ||
        numVal >= 10000;

      claims.push({
        claim_id: `unitsales-${Math.random().toString(36).slice(2, 7)}`,
        claim_type: isTractionIntent ? 'VALUE' : 'UNSUPPORTED',
        value: numVal,
        unit: 'Units',
        brand: this.detectSurroundingBrand(normalizedText, m.index ?? 0, defaultBrand),
        month: defaultMonth,
        metric_id: isTractionIntent ? 'OBSERVABLE_SALES_TRACTION_INDEX' : 'UNSUPPORTED_UNIT_SALES',
        raw_text: m[0],
      });
    }

    // E. Prohibited Currency Units (USD, EUR, etc. when market is THB)
    const prohibitedCurrencyMatches = normalizedText.matchAll(/(?:\$|USD|EUR)\s*(-?[\d,]+(?:\.\d+)?)|(-?[\d,]+(?:\.\d+)?)\s*(?:USD|dollars?|EUR|euros?)/gi);
    for (const m of prohibitedCurrencyMatches) {
      const rawVal = m[1] || m[2];
      const val = parseFloat(rawVal.replace(/,/g, ''));
      claims.push({
        claim_id: `curr-err-${Math.random().toString(36).slice(2, 7)}`,
        claim_type: 'CURRENCY',
        metric_id: 'AVG_SELLING_PRICE_THB',
        value: val,
        unit: 'USD',
        brand: this.detectSurroundingBrand(normalizedText, m.index ?? 0, defaultBrand),
        month: defaultMonth,
        raw_text: m[0],
      });
    }

    // ─── 2. Markdown Table Parsing ──────────────────────────────────────────────
    const lines = normalizedText.split('\n');
    let inTable = false;
    let tableHeaders: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.split('|').slice(1, -1).map((c) => c.trim());
        if (cells.every((c) => /^[-:\s]+$/.test(c))) {
          inTable = true;
          continue;
        }

        if (!inTable) {
          tableHeaders = cells.map((c) => c.toLowerCase());
          continue;
        }

        let rowBrand: TargetBrand = defaultBrand;
        for (const cell of cells) {
          const bMatch = TARGET_BRANDS.find((b) => cell.toLowerCase().includes(b.toLowerCase()));
          if (bMatch) rowBrand = bMatch;
        }

        for (let colIdx = 0; colIdx < cells.length; colIdx++) {
          const header = tableHeaders[colIdx] || '';
          const cellVal = cells[colIdx];

          const priceM = cellVal.match(/(?:฿|THB)?\s*([\d,]+(?:\.\d+)?)\s*(?:THB)?/i);
          if (priceM && (header.includes('price') || header.includes('asp') || cellVal.includes('฿'))) {
            const val = parseFloat(priceM[1].replace(/,/g, ''));
            if (!isNaN(val)) {
              claims.push({
                claim_id: `tbl-price-${i}-${colIdx}`,
                claim_type: 'CURRENCY',
                metric_id: 'AVG_SELLING_PRICE_THB',
                value: val,
                unit: 'THB',
                brand: rowBrand,
                month: defaultMonth,
                raw_text: cellVal,
              });
            }
          }

          const pctM = cellVal.match(/([\d]+(?:\.\d+)?)\s*%/);
          if (pctM) {
            const val = parseFloat(pctM[1]);
            const metricId = header.includes('discount')
              ? 'AVG_DISCOUNT_PCT'
              : header.includes('social')
              ? 'SOCIAL_SOV'
              : header.includes('ecom')
              ? 'ECOMMERCE_SOV'
              : 'PAID_MEDIA_SOV';
            claims.push({
              claim_id: `tbl-pct-${i}-${colIdx}`,
              claim_type: 'PERCENTAGE',
              metric_id: metricId,
              value: val,
              unit: '%',
              brand: rowBrand,
              month: defaultMonth,
              raw_text: cellVal,
            });
          }

          const ratingM = cellVal.match(/([\d]\.[\d]+)/);
          if (ratingM && (header.includes('rating') || header.includes('score') || cellVal.includes('★'))) {
            claims.push({
              claim_id: `tbl-rating-${i}-${colIdx}`,
              claim_type: 'RATING',
              metric_id: 'AVG_CONSUMER_RATING',
              value: parseFloat(ratingM[1]),
              unit: 'Score',
              brand: rowBrand,
              month: defaultMonth,
              raw_text: cellVal,
            });
          }
        }
      } else {
        inTable = false;
      }
    }

    // ─── 3. Specific Metric Assertions in Prose ──────────────────────────────────
    // A. Currency / Prices (e.g. ฿5,733, 5,733 THB, 5733 baht)
    const priceMatches = normalizedText.matchAll(/(?:average\s+(?:selling\s+)?price|asp|priced?\s+(?:at|of)|costs?)\s*(?:is|was|of)?\s*(?:฿|THB)?\s*(-?[\d,]+(?:\.\d+)?)\s*(?:THB|baht|บาท)?/gi);
    for (const m of priceMatches) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      const brand = this.detectSurroundingBrand(normalizedText, m.index ?? 0, defaultBrand);
      claims.push({
        claim_id: `prose-price-${Math.random().toString(36).slice(2, 7)}`,
        claim_type: 'CURRENCY',
        metric_id: 'AVG_SELLING_PRICE_THB',
        value: val,
        unit: 'THB',
        brand,
        month: defaultMonth,
        raw_text: m[0],
      });
    }

    // Direct standalone ฿XXXX match
    const bahtSymbolMatches = normalizedText.matchAll(/฿(-?[\d,]+(?:\.\d+)?)/g);
    for (const m of bahtSymbolMatches) {
      const idx = m.index ?? 0;
      const sentence = this.getContainingSentence(normalizedText, idx);
      const surrounding = sentence.toLowerCase();

      // Skip comparative deltas like "฿1,443 cheaper than"
      if (surrounding.includes('cheaper') || surrounding.includes('expensive') || surrounding.includes('difference') || surrounding.includes('gap')) {
        continue;
      }

      const val = parseFloat(m[1].replace(/,/g, ''));
      const brand = this.detectSurroundingBrand(normalizedText, idx, defaultBrand);
      if (!claims.some((c) => c.raw_text?.includes(m[0]) || (c.value === val && c.brand === brand))) {
        claims.push({
          claim_id: `prose-baht-${Math.random().toString(36).slice(2, 7)}`,
          claim_type: 'CURRENCY',
          metric_id: 'AVG_SELLING_PRICE_THB',
          value: val,
          unit: 'THB',
          brand,
          month: defaultMonth,
          raw_text: m[0],
        });
      }
    }

    // B. Percentages (SOV, Discounts, Sentiment)
    const pctMatches = normalizedText.matchAll(/(-?[\d]+(?:\.\d+)?)\s*%/g);
    for (const m of pctMatches) {
      const idx = m.index ?? 0;
      const sentence = this.getContainingSentence(normalizedText, idx).toLowerCase();

      const brand = this.detectSurroundingBrand(normalizedText, idx, defaultBrand);
      let isCompetitorGroup = false;
      if (sentence.includes('competitors') || sentence.includes('rivals') || sentence.includes('other brands')) {
        isCompetitorGroup = true;
      }

      let metricId = 'PAID_MEDIA_SOV';
      if (sentence.includes('discount') || sentence.includes('ส่วนลด') || plan.intent === 'PROMOTIONS') {
        metricId = 'AVG_DISCOUNT_PCT';
      } else if (sentence.includes('sentiment') || sentence.includes('positive') || plan.intent === 'CONSUMER_SENTIMENT') {
        metricId = 'POSITIVE_SENTIMENT_PCT';
      } else if (sentence.includes('social') || sentence.includes('engagement')) {
        metricId = 'SOCIAL_SOV';
      } else if (sentence.includes('e-commerce') || sentence.includes('ecom') || sentence.includes('marketplace')) {
        metricId = 'ECOMMERCE_SOV';
      }

      const val = parseFloat(m[1]);
      claims.push({
        claim_id: `prose-pct-${Math.random().toString(36).slice(2, 7)}`,
        claim_type: 'PERCENTAGE',
        metric_id: metricId,
        value: val,
        unit: '%',
        brand: isCompetitorGroup ? 'None' : brand,
        month: defaultMonth,
        raw_text: m[0],
      });
    }

    // C. Ratings (e.g. 4.5 / 5, 4.5★, rating of 4.5, score of 3.8)
    const ratingMatches = normalizedText.matchAll(/(?:ratings?|scores?|scored?)\s*(?:is|was|of)?\s*(-?[0-5](?:\.\d+)?)\s*(?:\/\s*5|★|stars?|out of 5)?/gi);
    for (const m of ratingMatches) {
      const val = parseFloat(m[1]);
      const brand = this.detectSurroundingBrand(normalizedText, m.index ?? 0, defaultBrand);
      if (!claims.some((c) => c.claim_type === 'RATING' && c.value === val && c.brand === brand)) {
        claims.push({
          claim_id: `prose-rating-${Math.random().toString(36).slice(2, 7)}`,
          claim_type: 'RATING',
          metric_id: 'AVG_CONSUMER_RATING',
          value: val,
          unit: 'Score',
          brand,
          month: defaultMonth,
          raw_text: m[0],
        });
      }
    }

    // D. Review Counts (e.g. 58 customer reviews, 6 rated reviews, 52 Pantip posts)
    const reviewMatches = normalizedText.matchAll(/(-?\d[\d,]*)\s*(?:total\s+verified\s+customer\s+|total\s+consumer\s+|customer\s+|verified\s+)?(reviews?|rated\s+reviews?|unrated\s+posts?|discussion\s+threads?)/gi);
    for (const m of reviewMatches) {
      const val = parseInt(m[1].replace(/,/g, ''), 10);
      const brand = this.detectSurroundingBrand(normalizedText, m.index ?? 0, defaultBrand);
      const typeStr = m[2].toLowerCase();
      let metricId = 'TOTAL_CONSUMER_REVIEWS_COUNT';
      if (typeStr.includes('rated')) {
        metricId = 'RATED_REVIEWS_COUNT';
      } else if (typeStr.includes('unrated') || typeStr.includes('pantip') || typeStr.includes('thread')) {
        metricId = 'UNRATED_CONSUMER_VOICE_COUNT';
      } else if (
        (plan.normalizedQuery ? /rated\s+reviews?/i.test(plan.normalizedQuery) : false) ||
        (plan.entities?.metrics?.includes('RATED_REVIEWS_COUNT') && /rated/i.test(plan.normalizedQuery || ''))
      ) {
        metricId = 'RATED_REVIEWS_COUNT';
      }

      if (!claims.some((c) => c.value === val && c.metric_id === metricId && c.brand === brand)) {
        claims.push({
          claim_id: `prose-rev-${Math.random().toString(36).slice(2, 7)}`,
          claim_type: 'COUNT',
          metric_id: metricId,
          value: val,
          unit: 'Reviews',
          brand,
          month: defaultMonth,
          raw_text: m[0],
        });
      }
    }

    // E. SKU / Model Counts (e.g. 7 canonical SKUs, 12 active models, 17 SKUs)
    const skuMatches = normalizedText.matchAll(/(-?\d[\d,]*)\s*(?:canonical\s*(?:benchmark\s*)?|distinct\s*(?:active\s*)?|market\s*(?:catalog\s*)?)?(skus?|printer\s+models?|models?|offerings?)/gi);
    for (const m of skuMatches) {
      const val = parseInt(m[1].replace(/,/g, ''), 10);
      const brand = this.detectSurroundingBrand(normalizedText, m.index ?? 0, defaultBrand);
      const phrase = m[0].toLowerCase();
      let metricId = 'CANONICAL_SKU_COUNT';
      if (phrase.includes('active') || phrase.includes('distinct') || phrase.includes('observed')) {
        metricId = 'OBSERVED_SKU_COUNT';
      } else if (phrase.includes('market') || phrase.includes('catalog')) {
        metricId = 'MARKET_SKU_COUNT';
      }

      if (!claims.some((c) => c.value === val && c.brand === brand && c.metric_id?.includes('SKU'))) {
        claims.push({
          claim_id: `prose-sku-${Math.random().toString(36).slice(2, 7)}`,
          claim_type: 'COUNT',
          metric_id: metricId,
          value: val,
          unit: 'SKUs',
          brand,
          month: defaultMonth,
          raw_text: m[0],
        });
      }
    }

    // F. Total Touchpoints (e.g. 286 touchpoints, 500 touchpoints)
    const touchMatches = normalizedText.matchAll(/(-?\d[\d,]*)\s*(?:total\s+visibility\s+)?touchpoints?\b/gi);
    for (const m of touchMatches) {
      const val = parseInt(m[1].replace(/,/g, ''), 10);
      const brand = this.detectSurroundingBrand(normalizedText, m.index ?? 0, defaultBrand);
      claims.push({
        claim_id: `prose-touch-${Math.random().toString(36).slice(2, 7)}`,
        claim_type: 'COUNT',
        metric_id: 'TOTAL_VISIBILITY_TOUCHPOINTS',
        value: val,
        unit: 'Touchpoints',
        brand,
        month: defaultMonth,
        raw_text: m[0],
      });
    }

    // G. Ads Presence Count (e.g. "ran 58 ads", "16 ads")
    const adMatches = normalizedText.matchAll(/\b(-?\d[\d,]*)\s*(?:meta[- ]sponsored\s+|active\s+|observed\s+)?ads?\b/gi);
    for (const m of adMatches) {
      const val = parseInt(m[1].replace(/,/g, ''), 10);
      const brand = this.detectSurroundingBrand(normalizedText, m.index ?? 0, defaultBrand);
      claims.push({
        claim_id: `prose-ad-${Math.random().toString(36).slice(2, 7)}`,
        claim_type: 'COUNT',
        metric_id: 'AD_PRESENCE_COUNT',
        value: val,
        unit: 'Count',
        brand,
        month: defaultMonth,
        raw_text: m[0],
      });
    }

    // H. Marketplace Listings Count (e.g. "5,733 listings", "196 listings")
    const listMatches = normalizedText.matchAll(/\b(-?\d[\d,]*)\s*(?:marketplace\s+|e-commerce\s+|active\s+)?listings?\b/gi);
    for (const m of listMatches) {
      const val = parseInt(m[1].replace(/,/g, ''), 10);
      const brand = this.detectSurroundingBrand(normalizedText, m.index ?? 0, defaultBrand);
      claims.push({
        claim_id: `prose-list-${Math.random().toString(36).slice(2, 7)}`,
        claim_type: 'COUNT',
        metric_id: 'ECOMMERCE_LISTINGS_COUNT',
        value: val,
        unit: 'Count',
        brand,
        month: defaultMonth,
        raw_text: m[0],
      });
    }

    // I. Traction Index
    const tractionMatches = normalizedText.matchAll(/(-?\d[\d,]*)\s*(?:observable\s+cumulative\s+)?sales\s+traction\s+index\b/gi);
    for (const m of tractionMatches) {
      const val = parseInt(m[1].replace(/,/g, ''), 10);
      const brand = this.detectSurroundingBrand(normalizedText, m.index ?? 0, defaultBrand);
      claims.push({
        claim_id: `prose-trac-${Math.random().toString(36).slice(2, 7)}`,
        claim_type: 'VALUE',
        metric_id: 'OBSERVABLE_SALES_TRACTION_INDEX',
        value: val,
        unit: 'Units Index',
        brand,
        month: defaultMonth,
        raw_text: m[0],
      });
    }

    // J. Comparative Arithmetic Differences (e.g. "Canon is 1443 THB cheaper than HP", "HP is 147 THB cheaper")
    const compMatches = normalizedText.matchAll(/([A-Z][a-z]+)\s+(?:is|was|are)?\s*(?:on\s+average\s+)?(?:฿|THB)?\s*([\d,]+(?:\.\d+)?)\s*(?:THB)?\s*(cheaper|more expensive|higher|lower)\s+than\s+([A-Z][a-z]+)/gi);
    for (const m of compMatches) {
      const subjectBrand = TARGET_BRANDS.find((b) => b.toLowerCase() === m[1].toLowerCase());
      const diffVal = parseFloat(m[2].replace(/,/g, ''));
      const directionWord = m[3].toLowerCase();
      const targetBrand = TARGET_BRANDS.find((b) => b.toLowerCase() === m[4].toLowerCase());

      if (subjectBrand && targetBrand && !isNaN(diffVal)) {
        claims.push({
          claim_id: `comp-diff-${Math.random().toString(36).slice(2, 7)}`,
          claim_type: 'COMPARISON',
          value: diffVal,
          unit: 'THB',
          brand: subjectBrand,
          month: defaultMonth,
          comparator: {
            operator: directionWord.includes('cheaper') || directionWord.includes('lower') ? 'LT' : 'GT',
            compared_brand: targetBrand,
            expected_difference: diffVal,
          },
          raw_text: m[0],
        });
      }
    }

    return claims;
  }

  /**
   * Retrieves the sentence containing an index position, avoiding splitting on decimal numbers.
   */
  private getContainingSentence(text: string, index: number): string {
    const before = text.slice(0, index);
    const after = text.slice(index);

    // Look for sentence terminators: '. ', '.\n', '\n', '!', '?' (ignoring decimal points in numbers)
    const startMatch = before.match(/.*(?:[.!?]\s+|\n+)/s);
    const start = startMatch ? startMatch[0].length : 0;

    const endMatch = after.match(/(?:[.!?](?:\s+|$))|\n+/);
    const end = endMatch && endMatch.index !== undefined ? index + endMatch.index : text.length;

    return text.slice(start, end).trim();
  }

  /**
   * Identifies the brand closest to a character offset in text, respecting clause boundaries.
   */
  private detectSurroundingBrand(text: string, offset: number, fallback: TargetBrand): TargetBrand {
    const beforeOffset = text.slice(0, offset);
    const afterOffset = text.slice(offset);

    // Look for backward clause boundary
    const clauseDelimRegex = /(?:[,;]|\b(?:compared\s+to|versus|vs\.?|while|whereas|than)\b)/i;
    const beforeParts = beforeOffset.split(clauseDelimRegex);
    const immediateBefore = beforeParts[beforeParts.length - 1];

    const afterParts = afterOffset.split(clauseDelimRegex);
    const immediateAfter = afterParts[0];

    // Brand model lines mapping
    const BRAND_SUB_LINES: { brand: TargetBrand; patterns: RegExp[] }[] = [
      { brand: 'HP', patterns: [/\bHP\b/i, /\bSmart\s*Tank\b/i, /\bDeskJet\b/i] },
      { brand: 'Epson', patterns: [/\bEpson\b/i, /\bEcoTank\b/i, /\bL\d{3,4}\b/i] },
      { brand: 'Canon', patterns: [/\bCanon\b/i, /\bMegaTank\b/i, /\bPIXMA\b/i, /\bG\d{3,4}\b/i] },
      { brand: 'Brother', patterns: [/\bBrother\b/i, /\bInkBenefit\b/i, /\bDCP\b/i] },
    ];

    // Check immediate backward clause first (preferred as subjects precede numbers)
    for (const item of BRAND_SUB_LINES) {
      if (item.patterns.some((p) => p.test(immediateBefore))) {
        return item.brand;
      }
    }

    // Check immediate forward clause
    for (const item of BRAND_SUB_LINES) {
      if (item.patterns.some((p) => p.test(immediateAfter))) {
        return item.brand;
      }
    }

    // Fallback: search closest brand or model line across the entire text
    let closestBrand = fallback;
    let minDistance = Infinity;

    for (const item of BRAND_SUB_LINES) {
      for (const pattern of item.patterns) {
        const matches = text.matchAll(new RegExp(pattern, 'gi'));
        for (const m of matches) {
          const mIdx = m.index ?? 0;
          const dist = Math.abs(mIdx - offset);
          if (dist < minDistance) {
            minDistance = dist;
            closestBrand = item.brand;
          }
        }
      }
    }

    return closestBrand;
  }
}

export const claimExtractor = new ClaimExtractor();
