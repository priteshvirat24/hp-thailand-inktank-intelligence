/**
 * High-Precision Thai Currency & Price Extraction Engine
 * 
 * Invariants:
 * - Prioritizes currency-anchored prices (฿, THB, บาท, .-, ราคา, Price:).
 * - Avoids false-positive matches on printer model numbers (e.g. 580, 520, 500, 670, 720).
 * - Accurately computes current price, original price, and discount percentage.
 */

export interface ExtractedPrice {
  price_current_thb: number | null;
  price_original_thb: number | null;
  discount_pct: number | null;
  raw_price_text: string | null;
  currency: string;
}

export function extractPriceFromText(text: string): ExtractedPrice {
  if (!text) {
    return {
      price_current_thb: null,
      price_original_thb: null,
      discount_pct: null,
      raw_price_text: null,
      currency: 'THB',
    };
  }

  // 1. Explicit currency-anchored regex patterns
  // Matches: ฿5,590, ฿ 5590, 5,590 บาท, 5590บาท, 5,590 THB, 5590.-, ราคา 5,590, Price: 5,590
  const anchoredPatterns = [
    /฿\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]{3,7})/gi,
    /([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]{3,7})\s*(?:บาท|THB|\.-)/gi,
    /(?:ราคา|price:?|ลดเหลือ|พิเศษ)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]{3,7})/gi,
  ];

  const anchoredMatches: { value: number; raw: string }[] = [];

  for (const pattern of anchoredPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const rawMatch = match[0].trim();
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);

      if (!isNaN(num) && num >= 100 && num <= 100000) {
        anchoredMatches.push({ value: num, raw: rawMatch });
      }
    }
  }

  // If anchored matches found, evaluate them
  if (anchoredMatches.length > 0) {
    if (anchoredMatches.length >= 2) {
      const sorted = [...anchoredMatches].sort((a, b) => a.value - b.value);
      const current = sorted[0].value;
      const original = sorted[sorted.length - 1].value;
      const discount = original > current ? Math.round(((original - current) / original) * 100) : null;

      return {
        price_current_thb: current,
        price_original_thb: original !== current ? original : null,
        discount_pct: discount,
        raw_price_text: `${sorted[0].raw} / ${sorted[sorted.length - 1].raw}`,
        currency: 'THB',
      };
    }

    const single = anchoredMatches[0];
    return {
      price_current_thb: single.value,
      price_original_thb: null,
      discount_pct: null,
      raw_price_text: single.raw,
      currency: 'THB',
    };
  }

  // Fallback: general price format (comma-separated numbers >= 1,000)
  const generalRegex = /\b([1-9][0-9]{0,2}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?)\b/g;
  let generalMatch: RegExpExecArray | null;
  while ((generalMatch = generalRegex.exec(text)) !== null) {
    const num = parseFloat(generalMatch[1].replace(/,/g, ''));
    if (!isNaN(num) && num >= 1000 && num <= 100000) {
      return {
        price_current_thb: num,
        price_original_thb: null,
        discount_pct: null,
        raw_price_text: generalMatch[0],
        currency: 'THB',
      };
    }
  }

  return {
    price_current_thb: null,
    price_original_thb: null,
    discount_pct: null,
    raw_price_text: null,
    currency: 'THB',
  };
}
