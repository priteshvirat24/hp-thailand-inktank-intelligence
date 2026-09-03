/**
 * HTML Body Text Extractor, Block Page Detector & JS-Shell Classifier
 */

import { PageClassification } from '../acquisition/types';

export interface HtmlInspectionResult {
  title: string | null;
  visibleText: string;
  isBlocked: boolean;
  blockedReason?: string;
  isJsRequired: boolean;
  jsRequiredReason?: string;
  pageClassification: PageClassification;
  language: 'th' | 'en' | 'th-en' | 'unknown';
}

const BLOCK_PATTERNS = [
  { regex: /access\s+denied/i, reason: 'Access Denied Signature' },
  { regex: /verify\s+you\s+are\s+(?:a\s+)?human/i, reason: 'Bot Verification Challenge' },
  { regex: /cloudflare\s+ray\s+id/i, reason: 'Cloudflare Challenge Screen' },
  { regex: /attention\s+required!\s*\|\s*cloudflare/i, reason: 'Cloudflare WAF Block' },
  { regex: /please\s+complete\s+the\s+security\s+check/i, reason: 'Security Captcha Challenge' },
  { regex: /security\s+check\s+to\s+access/i, reason: 'Security Check Required' },
  { regex: /request\s+blocked/i, reason: 'WAF Request Blocked' },
  { regex: /403\s+forbidden/i, reason: 'HTTP 403 Forbidden Page' },
];

const JS_REQUIRED_PATTERNS = [
  /you\s+need\s+to\s+enable\s+javascript/i,
  /please\s+enable\s+javascript/i,
  /javascript\s+is\s+required/i,
  /enable\s+javascript\s+to\s+continue/i,
];

export function inspectHtml(html: string): HtmlInspectionResult {
  if (!html) {
    return {
      title: null,
      visibleText: '',
      isBlocked: false,
      isJsRequired: false,
      pageClassification: 'UNKNOWN',
      language: 'unknown',
    };
  }

  // 1. Extract <title>
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : null;

  // 2. Check Block Page Signatures
  for (const block of BLOCK_PATTERNS) {
    if (block.regex.test(html)) {
      return {
        title,
        visibleText: '',
        isBlocked: true,
        blockedReason: block.reason,
        isJsRequired: false,
        pageClassification: 'UNKNOWN',
        language: 'unknown',
      };
    }
  }

  // 3. Strip <script>, <style>, <noscript>, <svg> to calculate visible body text
  const cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ');

  const visibleText = cleanHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 4. Check JS-Required Shell
  let isJsRequired = false;
  let jsRequiredReason: string | undefined;

  for (const pattern of JS_REQUIRED_PATTERNS) {
    if (pattern.test(html)) {
      isJsRequired = true;
      jsRequiredReason = 'Explicit JavaScript requirement statement detected.';
      break;
    }
  }

  // If page has lots of HTML markup (e.g. >2000 chars) but visible text is under 150 chars, likely a React/Vue/SPA JS shell
  if (!isJsRequired && html.length > 2000 && visibleText.length < 150) {
    isJsRequired = true;
    jsRequiredReason = 'Empty client-side rendered HTML shell with minimal text.';
  }

  // 5. Detect Language
  const hasThai = /[\u0E00-\u0E7F]/.test(visibleText);
  const hasEnglish = /[a-zA-Z]/.test(visibleText);
  let language: 'th' | 'en' | 'th-en' | 'unknown' = 'unknown';
  if (hasThai && hasEnglish) language = 'th-en';
  else if (hasThai) language = 'th';
  else if (hasEnglish) language = 'en';

  // 6. Page Classification
  const pageClassification = classifyPage(visibleText, html);

  return {
    title,
    visibleText,
    isBlocked: false,
    isJsRequired,
    jsRequiredReason,
    pageClassification,
    language,
  };
}

function classifyPage(text: string, rawHtml: string): PageClassification {
  const lower = text.toLowerCase();
  const rawLower = rawHtml.toLowerCase();

  if (rawLower.includes('"@type":"product"') || rawLower.includes('"@type": "product"')) {
    return 'PRODUCT';
  }

  // Product heuristics
  if (
    (lower.includes('add to cart') || lower.includes('ใส่ตะกร้า') || lower.includes('buy now') || lower.includes('ซื้อเลย')) &&
    (lower.includes('price') || lower.includes('ราคา') || lower.includes('บาท') || lower.includes('฿'))
  ) {
    return 'PRODUCT';
  }

  // Category heuristics
  if (
    (lower.includes('all products') || lower.includes('สินค้าทั้งหมด') || lower.includes('category') || lower.includes('หมวดหมู่')) &&
    (lower.includes('filter') || lower.includes('sort by') || lower.includes('กรอง'))
  ) {
    return 'CATEGORY';
  }

  // Social
  if (lower.includes('facebook.com') || lower.includes('instagram.com') || lower.includes('tiktok.com') || lower.includes('retweet')) {
    return 'SOCIAL_POST';
  }

  // Article / Blog
  if (rawLower.includes('"@type":"article"') || rawLower.includes('"@type":"newsarticle"') || lower.includes('published by') || lower.includes('เขียนโดย')) {
    return 'ARTICLE';
  }

  return 'UNKNOWN';
}
