/**
 * Review Reprocessor & Integrity Engine
 * Phase 22 — Consumer Review Data Integrity Remediation
 *
 * Implements:
 * 1. Independent comment-level brand entity extraction (no thread inheritance)
 * 2. Strict SKU resolution (null if generic)
 * 3. Category contamination gating (quarantines laptops, SSDs, BIOS, generic electronics)
 * 4. General content & Support discussion classification
 * 5. Authentic Mistral bilingual translation with Thai detection & failure safety
 * 6. Multi-brand comparative sentiment modeling
 * 7. Precise temporal parsing (preserving authentic publication timestamps)
 */

import { TargetBrand as Brand } from '../../types/brands';
import { RawEvidenceRecord } from '../../types/evidence';
import {
  ReviewCategoryStatus,
  ReviewTranslationStatus,
  ReviewSentiment,
  BrandSentimentItem,
} from '../../types/reviews';

const CANONICAL_SKU_PATTERNS: Array<{ brand: Brand; sku: string; regex: RegExp }> = [
  // HP
  { brand: 'HP', sku: 'HP-ST-580', regex: /\b(?:smart\s*tank\s*)?580\b/i },
  { brand: 'HP', sku: 'HP-ST-515', regex: /\b(?:smart\s*tank\s*)?515\b/i },
  { brand: 'HP', sku: 'HP-ST-720', regex: /\b(?:smart\s*tank\s*)?720\b/i },
  { brand: 'HP', sku: 'HP-ST-750', regex: /\b(?:smart\s*tank\s*)?750\b/i },
  { brand: 'HP', sku: 'HP-ST-615', regex: /\b(?:smart\s*tank\s*)?615\b/i },
  { brand: 'HP', sku: 'HP-ST-210', regex: /\b(?:smart\s*tank\s*)?210\b/i },
  // Epson
  { brand: 'Epson', sku: 'EPSON-ET-L3250', regex: /\b(?:l3250|l-3250)\b/i },
  { brand: 'Epson', sku: 'EPSON-ET-L3210', regex: /\b(?:l3210|l-3210)\b/i },
  { brand: 'Epson', sku: 'EPSON-ET-L3550', regex: /\b(?:l3550|l-3550|l3350)\b/i },
  { brand: 'Epson', sku: 'EPSON-ET-L5290', regex: /\b(?:l5290|l-5290)\b/i },
  { brand: 'Epson', sku: 'EPSON-ET-L1250', regex: /\b(?:l1250|l-1250)\b/i },
  { brand: 'Epson', sku: 'EPSON-ET-L4260', regex: /\b(?:l4260|l-4260)\b/i },
  // Canon
  { brand: 'Canon', sku: 'CANON-PIXMA-G3020', regex: /\b(?:g3020|g-3020)\b/i },
  { brand: 'Canon', sku: 'CANON-PIXMA-G2020', regex: /\b(?:g2020|g-2020|g2010)\b/i },
  { brand: 'Canon', sku: 'CANON-PIXMA-G3010', regex: /\b(?:g3010|g-3010)\b/i },
  { brand: 'Canon', sku: 'CANON-PIXMA-G3730', regex: /\b(?:g3730|g-3730)\b/i },
  { brand: 'Canon', sku: 'CANON-PIXMA-G2730', regex: /\b(?:g2730|g-2730)\b/i },
  { brand: 'Canon', sku: 'CANON-PIXMA-G1020', regex: /\b(?:g1020|g-1020)\b/i },
  // Brother
  { brand: 'Brother', sku: 'BROTHER-IB-T430W', regex: /\b(?:t430w|t-430w|430w)\b/i },
  { brand: 'Brother', sku: 'BROTHER-DCP-T420W', regex: /\b(?:t420w|t-420w|420w)\b/i },
  { brand: 'Brother', sku: 'BROTHER-DCP-T520W', regex: /\b(?:t520w|t-520w|520w|t530dw)\b/i },
  { brand: 'Brother', sku: 'BROTHER-DCP-T720DW', regex: /\b(?:t720dw|t-720dw|720dw)\b/i },
  { brand: 'Brother', sku: 'BROTHER-DCP-T426W', regex: /\b(?:t426w|t-426w|426w)\b/i },
  { brand: 'Brother', sku: 'BROTHER-DCP-T220', regex: /\b(?:t220|t-220|220)\b/i },
  { brand: 'Brother', sku: 'BROTHER-DCP-T820DW', regex: /\b(?:t820dw|t-820dw|t830dw)\b/i },
];

const OFF_TOPIC_HARDWARE_REGEX = /(omen|victus|pavilion|laptop|notebook|โน๊ตบุ๊ค|โน้ตบุ๊ก|การ์ดจอ|gpu|rtx|gtx|ssd|nvme|hdd|hard\s*drive|bios|motherboard|เมนบอร์ด|ram|desktop\s*pc|คอมประกอบ|gaming\s*pc|psu|power\s*supply|smartphone|iphone|ipad|tablet)/i;

const PRINTER_CONTEXT_REGEX = /(printer|print|printing|ink|tank|head|nozzle|เครื่องพิมพ์|ปริ้นเตอร์|ปริ้น|พิมพ์|หมึก|แท้งค์|หัวพิมพ์)/i;

const AI_COPIED_REGEX = /(deepseek|chatgpt|openai|claude|gemini|copilot|ai\s*ตอบว่า|ai\s*แนะนำ)/i;

const GENERAL_CONTENT_REGEX = /(ความรู้เรื่อง\s*printer|ตลาด\s*inkjet|หลักการทำงานของ|ประเภทของเครื่องพิมพ์)/i;

const SUPPORT_DISCUSSION_REGEX = /(ไฟกระพริบ|ไฟสีส้ม|ไฟสีแดง|error\s*code|กระดาษติดแกน|สั่งพิมพ์จาก\s*excel|สั่งพิมพ์จาก\s*word|ขอภาพหน้าจอ|ตั้งค่า\s*printer|รุ่นอะไรก็ไม่บอก|factory\s*reset|hard\s*reset|driver\s*\.*\s*error|reinstall\s*driver|print\s*test\s*page|กดปุ่ม\s*resume|เป็นอย่างไรบ้างครับ|ได้หรือไม่ได้\s*เงียบเฉย)/i;

const REVIEW_EVAL_REGEX = /(คุ้ม|แนะนำ|ดีมาก|ห่วย|ช้าเกินไป|อย่าซื้อ|ชอบมาก|ยกให้คนอื่น|หมดปัญหา|ใช้อยู่|ซื้อมาใช้)/i;

export interface ReprocessInput {
  evidence_id: string;
  source_platform: string;
  source_url: string;
  thread_url?: string;
  raw_content_th: string;
  published_at?: string | null;
  captured_at?: string;
  rating?: number | null;
  existing_brand?: string;
  existing_sku?: string | null;
}

/**
 * Detect explicit brand mentions directly in comment text
 */
export function extractCommentBrands(text: string): Brand[] {
  const brands: Brand[] = [];
  const lower = text.toLowerCase();

  const hasHP = /\b(hp|hewlett\s*packard|smart\s*tank|deskjet)\b/i.test(lower) || /เอชพี/.test(lower);
  const hasEpson = /\b(epson|ecotank)\b/i.test(lower) || /เอปสัน/.test(lower);
  const hasCanon = /\b(canon|megatank|pixma)\b/i.test(lower) || /แคนนอน/.test(lower);
  const hasBrother = /\b(brother|dcp-t|mfc-t)\b/i.test(lower) || /บราเดอร์/.test(lower);

  if (hasHP) brands.push('HP');
  if (hasEpson) brands.push('Epson');
  if (hasCanon) brands.push('Canon');
  if (hasBrother) brands.push('Brother');

  return brands;
}

/**
 * Detect explicit SKU mentions in text
 */
export function extractCommentSkus(text: string, brands: Brand[]): string[] {
  const skus: string[] = [];
  for (const item of CANONICAL_SKU_PATTERNS) {
    if (brands.includes(item.brand) && item.regex.test(text)) {
      skus.push(item.sku);
    }
  }
  return [...new Set(skus)];
}

/**
 * Classify category relevance and identify off-topic pollution
 */
export function classifyCategoryStatus(text: string): {
  status: ReviewCategoryStatus;
  reason: string | null;
} {
  // Check for AI copied text
  if (AI_COPIED_REGEX.test(text)) {
    return {
      status: 'AI_COPIED_CONTENT',
      reason: 'AI-generated or copied technical answer / chatbot troubleshooting content pasted into forum',
    };
  }

  // Check for off-topic non-printer hardware
  if (OFF_TOPIC_HARDWARE_REGEX.test(text)) {
    // If it mentions laptop/SSD/BIOS and does NOT explicitly discuss an ink tank printer
    if (!PRINTER_CONTEXT_REGEX.test(text) || /(omen|bios|nvme|ssd)/i.test(text)) {
      return {
        status: 'OFF_TOPIC',
        reason: 'Off-topic hardware/software (laptop/BIOS/SSD/PC components) unrelated to ink tank printers',
      };
    }
  }

  // Check for generic educational printer essay
  if (GENERAL_CONTENT_REGEX.test(text)) {
    return {
      status: 'GENERAL_CATEGORY_CONTENT',
      reason: 'Generic educational or tutorial article on printer mechanics rather than consumer product experience',
    };
  }

  // Check for pure technical diagnostic Q&A
  if (SUPPORT_DISCUSSION_REGEX.test(text) && !REVIEW_EVAL_REGEX.test(text)) {
    return {
      status: 'SUPPORT_DISCUSSION',
      reason: 'Technical support / diagnostic troubleshooting discussion and LED error blink code diagnostics without product evaluation',
    };
  }

  // Check if multiple brands are compared
  const brands = extractCommentBrands(text);
  if (brands.length > 1) {
    return {
      status: 'VERIFIED_COMPARATIVE_REVIEW',
      reason: null,
    };
  }

  return {
    status: 'VERIFIED_REVIEW',
    reason: null,
  };
}

/**
 * Detect language of text
 */
export function detectLanguage(text: string): 'TH' | 'EN' | 'MIXED' {
  const thaiMatches = text.match(/[\u0e00-\u0e7f]/g) || [];
  const latinMatches = text.match(/[a-zA-Z]/g) || [];

  const thaiCount = thaiMatches.length;
  const latinCount = latinMatches.length;

  if (thaiCount >= 4 && latinCount >= 4) return 'MIXED';
  if (thaiCount > 0 && latinCount === 0) return 'TH';
  if (thaiCount === 0 && latinCount > 0) return 'EN';
  if (thaiCount > latinCount * 1.5) return 'TH';
  if (latinCount > thaiCount * 1.5) return 'EN';
  return 'MIXED';
}

/**
 * Validate translation quality and ensure no Thai leakage
 */
export function validateTranslation(
  rawThai: string,
  translatedEn: string | null
): {
  valid: boolean;
  status: ReviewTranslationStatus;
  translation_status: ReviewTranslationStatus;
  cleanText: string | null;
  content_en_translation: string | null;
} {
  if (!translatedEn || !translatedEn.trim()) {
    return {
      valid: false,
      status: 'UNAVAILABLE',
      translation_status: 'UNAVAILABLE',
      cleanText: null,
      content_en_translation: null,
    };
  }

  const trimmed = translatedEn.trim();

  // Reject fake wrapper templates
  if (/^\[(POSITIVE|NEGATIVE|MIXED|NEUTRAL|UNRESOLVED)\]\s*Consumer\s*feedback/i.test(trimmed)) {
    return {
      valid: false,
      status: 'FAILED',
      translation_status: 'FAILED',
      cleanText: null,
      content_en_translation: null,
    };
  }

  // Check if raw text was already English
  if (detectLanguage(rawThai) === 'EN') {
    return {
      valid: true,
      status: 'SOURCE_EN',
      translation_status: 'SOURCE_EN',
      cleanText: trimmed,
      content_en_translation: trimmed,
    };
  }

  // If translation is identical to raw Thai
  if (trimmed === rawThai.trim()) {
    return {
      valid: false,
      status: 'FAILED',
      translation_status: 'FAILED',
      cleanText: null,
      content_en_translation: null,
    };
  }

  // Count Thai characters in the supposed English translation
  const thaiChars = (trimmed.match(/[\u0e00-\u0e7f]/g) || []).length;

  // Strict Rule: No Thai script permitted in English translation
  if (thaiChars > 0) {
    return {
      valid: false,
      status: 'FAILED',
      translation_status: 'FAILED',
      cleanText: null,
      content_en_translation: null,
    };
  }

  return {
    valid: true,
    status: 'TRANSLATED',
    translation_status: 'TRANSLATED',
    cleanText: trimmed,
    content_en_translation: trimmed,
  };
}

/**
 * Deterministic rule-based sentiment & brand attribution when LLM is unavailable
 */
export function evaluateSentimentAndAttribution(
  text: string,
  detectedBrands: Brand[]
): {
  sentiment: ReviewSentiment;
  brandSentiments: BrandSentimentItem[];
  attributedBrands: Brand[];
} {
  const lower = text.toLowerCase();
  const brandSentiments: BrandSentimentItem[] = [];

  const positiveClues = /(ดีมาก|คุ้ม|เปลี่ยนง่าย|สีสวย|คมชัด|สะดวก|ประหยัด|ชอบ|ยอดเยี่ยม|แนะนำ|ไหลลื่น|ทนทาน|ติดใจ)/i;
  const negativeClues = /(ช้า|พัง|ตัน|หลุด|แย่|ห่วย|ไม่จบ|error\s*บ่อย|ตัดออก|ยกให้คนอื่น|เปลือง|แพงเกิน|งอแง)/i;

  for (const b of detectedBrands) {
    let s: ReviewSentiment = 'NEUTRAL';

    const brandThemes: string[] = [];
    if (/(สี|คมชัด|คุณภาพ|รูปถ่าย|photo|resolution|สวย|ดรอป)/i.test(lower)) brandThemes.push('Print Quality');
    if (/(ช้า|เร็ว|speed|พิมพ์งานช้า|พิมพ์เร็ว|ไว)/i.test(lower)) brandThemes.push('Print Speed');
    if (/(หัวพิมพ์|เปลี่ยนหัว|ตัน|ซับหมึก|ล้างหัว|head|nozzle)/i.test(lower)) brandThemes.push('DIY Maintenance / Printhead');
    if (/(ทนทาน|ทน|ไม่งอแง|เสถียร|ไม่พัง)/i.test(lower)) brandThemes.push('Durability & Reliability');
    if (/(ราคา|คุ้ม|แพง|ถูก|ประหยัด|ต้นทุน|cost|value)/i.test(lower)) brandThemes.push('Price & Value');
    if (/(wifi|ไวไฟ|แอป|app|เชื่อมต่อ|mobile)/i.test(lower)) brandThemes.push('Connectivity & Mobile');
    if (/(กระดาษติด|ดึงกระดาษ|ถึก|ทน|ฟีด|ลูกยาง|feed|jam)/i.test(lower)) brandThemes.push('Reliability & Feed');
    if (/(เติมหมึก|เติมง่าย|refill|ขวดหมึก)/i.test(lower)) brandThemes.push('Refill Experience');
    if (/(onsite|ประกัน|ศูนย์|เคลม|service)/i.test(lower)) brandThemes.push('Warranty & Service');

    // Check specific brand sentiment contexts
    if (b === 'HP') {
      const hpSlow = /(hp[^\.]*(?:ช้า|พิมพ์ช้า|ไม่จบ|error|ตัดออก)|ยกให้คนอื่น|ยกคนที่เขาไม่มีไปหมดแล้ว)/i.test(lower);
      const hpEasyHead = /(hp[^\.]*(?:เปลี่ยนหัวพิมพ์เองได้ง่าย|สะดวกกว่า|สีดำเข้ม|สีดำ\s*จะดำกว่า))/i.test(lower);
      if (hpSlow && !hpEasyHead) s = 'NEGATIVE';
      else if (hpEasyHead && !hpSlow) s = 'POSITIVE';
      else if (hpSlow && hpEasyHead) s = 'MIXED';
      else if (positiveClues.test(lower) && !negativeClues.test(lower)) s = 'POSITIVE';
      else if (negativeClues.test(lower)) s = 'NEGATIVE';
    } else if (b === 'Brother') {
      const brotherGood = /(แนะนำ\s*brother|brother[^\.]*(?:ดี|ok|ทนทาน|ล้างหัวพิมพ์แบบอัตโนมัติ|จัด|ใช้อยู่|พิมพ์เร็ว|ยอดเยี่ยม|ทำการบ้านมาดี|คุ้มค่า)|ดีกว่าเยอะ|เร็วกว่าและไม่งอแง)/i.test(lower);
      const brotherColorWeak = /(brother[^\.]*(?:งานสีจะสู้เจ้าอื่นไม่ค่อยได้|สีไม่สวย|ปริ้นรูปสู้แบรนด์อื่นไม่ได้|สี\s*ที่ออกหม่น))/i.test(lower);
      if (brotherGood && !brotherColorWeak) s = 'POSITIVE';
      else if (brotherColorWeak && !brotherGood) s = 'NEGATIVE';
      else if (brotherGood && brotherColorWeak) s = 'MIXED';
      else if (positiveClues.test(lower)) s = 'POSITIVE';
    } else if (b === 'Epson') {
      const epsonGood = /(epson[^\.]*(?:ทนทาน|คุณภาพดี|แนะนำ|ประหยัดหมึก|สาวก\s*epson|หมึกแท้ทนทาน|หัวพิมพ์ตันยากกว่า))/i.test(lower);
      const epsonHardHead = /(epson[^\.]*(?:ถอดเยอะ|หัวพิมพ์ตันแก้ไขไม่ได้|ยกเข้าศูนย์|ช้ากว่า\s*canon|ช้ามาก))/i.test(lower);
      if (epsonGood && !epsonHardHead) s = 'POSITIVE';
      else if (epsonHardHead && !epsonGood) s = 'NEGATIVE';
      else if (epsonGood && epsonHardHead) s = 'MIXED';
      else if (positiveClues.test(lower)) s = 'POSITIVE';
    } else if (b === 'Canon') {
      const canonLineMissing = /(canon[^\.]*(?:เส้นขาดหาย|เป็นเส้น|ไม่ชอบ|บอร์ดตาย|ตาย|เสีย|พัง|วุ่นวาย\s*หัวเสีย))/i.test(lower);
      const canonGood = /(canon[^\.]*(?:ดี|สวย|ประหยัด|สีสดมาก|เร็ว))/i.test(lower);
      if (canonLineMissing) s = 'NEGATIVE';
      else if (canonGood && !canonLineMissing) s = 'POSITIVE';
      else if (positiveClues.test(lower)) s = 'POSITIVE';
    }

    brandSentiments.push({
      brand: b,
      sentiment: s,
      themes: brandThemes,
    });
  }

  // Global sentiment
  let overallSentiment: ReviewSentiment = 'NEUTRAL';
  if (brandSentiments.length === 1) {
    overallSentiment = brandSentiments[0].sentiment;
  } else if (brandSentiments.length > 1) {
    const hasPos = brandSentiments.some(bs => bs.sentiment === 'POSITIVE');
    const hasNeg = brandSentiments.some(bs => bs.sentiment === 'NEGATIVE');
    if (hasPos && hasNeg) overallSentiment = 'MIXED';
    else if (hasPos) overallSentiment = 'POSITIVE';
    else if (hasNeg) overallSentiment = 'NEGATIVE';
  } else {
    // No explicit brand
    if (positiveClues.test(lower) && !negativeClues.test(lower)) overallSentiment = 'POSITIVE';
    else if (negativeClues.test(lower) && !positiveClues.test(lower)) overallSentiment = 'NEGATIVE';
    else if (positiveClues.test(lower) && negativeClues.test(lower)) overallSentiment = 'MIXED';
  }

  return {
    sentiment: overallSentiment,
    brandSentiments,
    attributedBrands: detectedBrands,
  };
}

/**
 * Parse authentic comment timestamps (e.g. Pantip data_utime "MM/DD/YYYY HH:MM:SS" or Buddhist Era)
 */
export function parsePublicationTimestamp(rawDateStr: string | null | undefined): {
  published_at: string | null;
  iso_timestamp: string | null;
  analytical_month: string | null;
  is_in_analytical_window: boolean;
} {
  if (!rawDateStr || !rawDateStr.trim()) {
    return { published_at: null, iso_timestamp: null, analytical_month: null, is_in_analytical_window: false };
  }

  const str = rawDateStr.trim();
  let isoDate: string | null = null;
  let timeStr = '00:00:00';

  // Pattern 1: Slash format "DD/MM/YYYY" or "MM/DD/YYYY"
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (slashMatch) {
    const num1 = parseInt(slashMatch[1], 10);
    const num2 = parseInt(slashMatch[2], 10);
    const rawYear = parseInt(slashMatch[3], 10);
    let year = rawYear;
    if (year > 2500) year -= 543;

    let month = '';
    let day = '';
    if (rawYear > 2500 || num1 > 12) {
      // Thai Buddhist Era format is DD/MM/YYYY, or num1 > 12 means num1 must be day
      day = String(num1).padStart(2, '0');
      month = String(num2).padStart(2, '0');
    } else {
      // Default to MM/DD/YYYY (Pantip API convention)
      month = String(num1).padStart(2, '0');
      day = String(num2).padStart(2, '0');
    }

    if (slashMatch[4] && slashMatch[5]) {
      timeStr = `${slashMatch[4].padStart(2, '0')}:${slashMatch[5].padStart(2, '0')}:${(slashMatch[6] || '00').padStart(2, '0')}`;
    }

    isoDate = `${year}-${month}-${day}`;
  } else {
    // Pattern 2: ISO "YYYY-MM-DD"
    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (isoMatch) {
      let year = parseInt(isoMatch[1], 10);
      if (year > 2500) year -= 543;
      isoDate = `${year}-${isoMatch[2]}-${isoMatch[3]}`;
      if (isoMatch[4] && isoMatch[5]) {
        timeStr = `${isoMatch[4].padStart(2, '0')}:${isoMatch[5].padStart(2, '0')}:${(isoMatch[6] || '00').padStart(2, '0')}`;
      }
    }
  }

  if (!isoDate) {
    return { published_at: null, iso_timestamp: null, analytical_month: null, is_in_analytical_window: false };
  }

  const isoTimestamp = `${isoDate}T${timeStr}.000Z`;

  let analyticalMonth: string | null = null;
  let inWindow = false;

  if (isoDate >= '2026-05-28' && isoDate <= '2026-06-30') {
    analyticalMonth = '2026-06';
    inWindow = true;
  } else if (isoDate >= '2026-07-01' && isoDate <= '2026-07-31') {
    analyticalMonth = '2026-07';
    inWindow = true;
  } else if (isoDate >= '2026-08-01' && isoDate <= '2026-08-28') {
    analyticalMonth = '2026-08';
    inWindow = true;
  } else {
    analyticalMonth = isoDate.slice(0, 7);
    inWindow = false;
  }

  return {
    published_at: isoDate,
    iso_timestamp: isoTimestamp,
    analytical_month: analyticalMonth,
    is_in_analytical_window: inWindow,
  };
}

/**
 * Phase 22 Helper: Classify review category with reason
 */
export function classifyReviewCategory(text: string): {
  status: ReviewCategoryStatus;
  exclusion_reason: string | null;
} {
  const res = classifyCategoryStatus(text);
  return { status: res.status, exclusion_reason: res.reason };
}

/**
 * Phase 22 Helper: Extract brand entities with attribution status
 */
export function extractBrandEntities(text: string): {
  detected_brands: Brand[];
  attributed_brands: Brand[];
  attribution_status: string;
} {
  const detected = extractCommentBrands(text);
  let status = 'UNATTRIBUTED';
  if (detected.length === 1) status = 'DIRECT_EVALUATION';
  else if (detected.length > 1) status = 'COMPARATIVE_MENTION';
  return {
    detected_brands: detected,
    attributed_brands: detected,
    attribution_status: status,
  };
}

/**
 * Phase 22 Helper: Resolve SKU attribution
 */
export function resolveSkuAttribution(text: string, brands: Brand[]): {
  primary_sku: string | null;
  detected_skus: string[];
  attributed_skus: string[];
} {
  const skus = extractCommentSkus(text, brands);
  return {
    primary_sku: skus.length === 1 ? skus[0] : null,
    detected_skus: skus,
    attributed_skus: skus,
  };
}

/**
 * Phase 22 Helper: Detect language in lowercase code format
 */
export function detectReviewLanguage(text: string): 'th' | 'en' | 'mixed' {
  const l = detectLanguage(text);
  return l.toLowerCase() as 'th' | 'en' | 'mixed';
}

/**
 * Phase 22 Helper: Extract entity-level sentiments
 */
export function extractEntitySentiments(text: string, brands: Brand[]): BrandSentimentItem[] {
  const res = evaluateSentimentAndAttribution(text, brands);
  return res.brandSentiments;
}

/**
 * Phase 22 Helper: Convert Buddhist Era string to ISO date
 */
export function buddhistEraToIso(dateStr: string): string | null {
  const parsed = parsePublicationTimestamp(dateStr);
  return parsed.published_at;
}

/**
 * Phase 22 Helper: Parse authentic date with temporal window status
 */
export function parseAuthenticDate(rawDateStr: string | null | undefined): {
  published_at: string | null;
  temporal_window_status: 'IN_WINDOW' | 'OUT_OF_WINDOW' | 'UNVERIFIED';
} {
  const parsed = parsePublicationTimestamp(rawDateStr);
  return {
    published_at: parsed.iso_timestamp,
    temporal_window_status: parsed.is_in_analytical_window
      ? 'IN_WINDOW'
      : (parsed.published_at ? 'OUT_OF_WINDOW' : 'UNVERIFIED'),
  };
}

/**
 * Phase 22 Helper: Reprocess a single raw evidence record deterministically
 */
export function reprocessReviewRecord(record: RawEvidenceRecord): RawEvidenceRecord {
  const text = record.raw_content_th || '';
  const cat = classifyCategoryStatus(text);
  const detectedBrands = extractCommentBrands(text);
  const isPantip = record.platform === 'Pantip' || (record.source_url && /pantip\.com/i.test(record.source_url));
  const isEcom = !isPantip && (record.channel === 'E-commerce' || (record.platform as string) === 'Shopee' || (record.platform as string) === 'Lazada');

  let attributedBrands: Brand[] = [];
  let attributionStatus = 'UNATTRIBUTED';
  let finalBrand: Brand = record.brand;

  if (cat.status === 'OFF_TOPIC') {
    attributionStatus = 'EXCLUDED';
    attributedBrands = [];
  } else if (isEcom) {
    if (record.raw_title?.includes('Brother') || record.seller_name?.includes('Brother')) {
      finalBrand = 'Brother';
    }
    attributedBrands = [...new Set([finalBrand, ...detectedBrands])].filter(Boolean) as Brand[];
    attributionStatus = attributedBrands.length > 1 ? 'MULTI_BRAND' : 'CONFIRMED';
  } else if (detectedBrands.length > 0) {
    attributedBrands = detectedBrands;
    finalBrand = detectedBrands[0];
    attributionStatus = detectedBrands.length > 1 ? 'MULTI_BRAND' : 'CONFIRMED';
  } else {
    attributedBrands = [];
    attributionStatus = 'UNATTRIBUTED';
  }

  const effectiveBrands = attributedBrands.length > 0 ? attributedBrands : (finalBrand ? [finalBrand] : []);
  const detectedSkus = extractCommentSkus(text, effectiveBrands);
  let productSku = record.product_sku;
  if (cat.status === 'OFF_TOPIC') {
    productSku = null;
  } else if (detectedSkus.length > 0) {
    productSku = detectedSkus[0];
  } else if (!isEcom) {
    productSku = null;
  }

  const sentimentRes = evaluateSentimentAndAttribution(text, attributedBrands);
  const parsedDate = parsePublicationTimestamp(record.published_at);
  const temporalWindowStatus = parsedDate.is_in_analytical_window
    ? 'IN_WINDOW'
    : (parsedDate.published_at ? 'OUT_OF_WINDOW' : 'UNVERIFIED');

  const transVal = validateTranslation(text, record.content_en_translation || null);

  const tags = Array.isArray(record.evidence_tags)
    ? record.evidence_tags.filter((t: string) => !t.endsWith(' Sentiment') && !['POSITIVE', 'NEGATIVE', 'MIXED', 'NEUTRAL'].includes(t))
    : [];
  if (finalBrand) tags.push(`${finalBrand} Sentiment`);
  tags.push(sentimentRes.sentiment);

  return {
    ...record,
    brand: finalBrand,
    category_status: cat.status,
    exclusion_reason: cat.reason,
    detected_brands: detectedBrands,
    attributed_brands: attributedBrands,
    attribution_status: attributionStatus,
    detected_skus: detectedSkus,
    attributed_skus: detectedSkus,
    product_sku: productSku,
    brand_sentiments: sentimentRes.brandSentiments,
    evidence_tags: tags,
    translation_status: transVal.translation_status,
    content_en_translation: transVal.content_en_translation,
    published_at: record.published_at || (parsedDate.published_at ? `${parsedDate.published_at}T00:00:00.000Z` : ''),
    temporal_window_status: temporalWindowStatus,
  };
}

/**
 * Call Mistral API for true translation & entity extraction
 */
export async function callMistralTranslation(
  rawThai: string,
  apiKey: string
): Promise<{
  translation: string;
  detected_brands: Brand[];
  detected_skus: string[];
  sentiment: ReviewSentiment;
  category_status: ReviewCategoryStatus;
  exclusion_reason: string | null;
} | null> {
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: 'ministral-14b-latest',
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `You are a strict data auditor and bilingual Thai-English translator for an Ink Tank printer competitive intelligence platform in Thailand.
Follow these rules:
1. Translate the user Thai text into authentic, fluent English prose.
2. Extract all brands mentioned in the comment: choose only from ["HP", "Epson", "Canon", "Brother"]. If none, return [].
3. Extract specific printer model numbers mentioned. If generic or none, return [].
4. Classify sentiment: "POSITIVE", "NEGATIVE", "MIXED", or "NEUTRAL".
5. Classify category_status:
   - "OFF_TOPIC" if text is about laptops, BIOS, SSDs, desktop PCs, gaming hardware, or generic non-printer electronics.
   - "AI_COPIED_CONTENT" if text is an AI assistant troubleshooting paste.
   - "GENERAL_CATEGORY_CONTENT" if an educational essay on printer mechanics.
   - "SUPPORT_DISCUSSION" if pure diagnostic LED error code Q&A without review sentiment.
   - "VERIFIED_COMPARATIVE_REVIEW" if comparing 2 or more printer brands.
   - "VERIFIED_REVIEW" if evaluating printer performance/features.
6. Provide exclusion_reason if not a verified review, else null.
Output strictly valid JSON with keys: "translation", "detected_brands", "detected_skus", "sentiment", "category_status", "exclusion_reason". Output ONLY JSON.`,
          },
          { role: 'user', content: rawThai },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      translation: parsed.translation || '',
      detected_brands: (parsed.detected_brands || []).filter((b: string) =>
        ['HP', 'Epson', 'Canon', 'Brother'].includes(b)
      ),
      detected_skus: parsed.detected_skus || [],
      sentiment: parsed.sentiment || 'NEUTRAL',
      category_status: parsed.category_status || 'VERIFIED_REVIEW',
      exclusion_reason: parsed.exclusion_reason || null,
    };
  } catch {
    return null;
  }
}

