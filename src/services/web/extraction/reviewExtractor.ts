/**
 * Ratings, Reviews & Marketplace Cumulative Traction Extractor
 */

export interface ExtractedSocialProof {
  rating: number | null;
  review_count: number | null;
  sold_count: string | null;
}

export function extractSocialProof(text: string): ExtractedSocialProof {
  if (!text) {
    return { rating: null, review_count: null, sold_count: null };
  }

  // 1. Rating out of 5 (e.g. 4.8 / 5, 4.9 ดาว, 4.8/5.0)
  let rating: number | null = null;
  const ratingMatch = text.match(/([1-5]\.[0-9]|[1-5])\s*(?:\/\s*5|\s*ดาว|\s*stars|\s*out of 5)/i) ||
                      text.match(/rating:\s*([1-5]\.[0-9]|[1-5])/i);
  if (ratingMatch && ratingMatch[1]) {
    const r = parseFloat(ratingMatch[1]);
    if (!isNaN(r) && r >= 1.0 && r <= 5.0) {
      rating = r;
    }
  }

  // 2. Review count (e.g. 420 reviews, (420 รีวิว), 1.2k ratings)
  let reviewCount: number | null = null;
  const reviewMatch = text.match(/([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+(?:\.[0-9]+)?k)\s*(?:reviews?|รีวิว|ratings?|ความคิดเห็น)/i);
  if (reviewMatch && reviewMatch[1]) {
    const rawCount = reviewMatch[1].toLowerCase().replace(/,/g, '');
    if (rawCount.endsWith('k')) {
      reviewCount = Math.round(parseFloat(rawCount.replace('k', '')) * 1000);
    } else {
      const num = parseInt(rawCount, 10);
      if (!isNaN(num)) reviewCount = num;
    }
  }

  // 3. Marketplace Cumulative Sold Count (e.g. "1.2k sold", "ขายแล้ว 1.2พัน ชิ้น", "500+ sold")
  let soldCount: string | null = null;
  const soldMatch = text.match(/(?:ขายแล้ว|sold)\s*([0-9,.]+\+?k?|\b[0-9,.]+\s*(?:พัน|ชิ้น|items|units))/i) ||
                    text.match(/([0-9,.]+\+?k?)\s*(?:sold|ชิ้น)/i);
  if (soldMatch) {
    soldCount = soldMatch[0].trim();
  }

  return { rating, review_count: reviewCount, sold_count: soldCount };
}
