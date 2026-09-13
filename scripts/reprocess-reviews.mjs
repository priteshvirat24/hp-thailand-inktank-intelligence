#!/usr/bin/env node
/**
 * scripts/reprocess-reviews.mjs
 * Phase 22 — Consumer Review Data Integrity Remediation
 *
 * Reprocesses all consumer reviews in the Evidence Lake:
 * 1. Independent brand extraction from comment text (eradicates thread inheritance)
 * 2. SKU resolution (clears forced HP-ST-580 on general printer comments)
 * 3. Category contamination gating (quarantines laptop BIOS, SSDs, desktop PCs)
 * 4. General tutorial & pure support diagnostic isolation
 * 5. Authentic Mistral bilingual translation (eradicates "[POSITIVE] Consumer feedback ...: \"...\"")
 * 6. Language & translation validation (no Thai characters in English)
 * 7. Authentic publication timestamp restoration from source
 * 8. Entity-level multi-brand sentiment linking (brand_sentiments)
 * 9. Comprehensive audit report & idempotent output
 *
 * Usage:
 *   node scripts/reprocess-reviews.mjs [--dry-run] [--force]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';

const LAKE_PATH = resolve(process.cwd(), 'data/evidence_lake/scrapling_verified_lake.json');
const CACHE_PATH = resolve(process.cwd(), 'data/evidence_lake/.review_translation_cache.json');
const TIMESTAMP_MAP_PATH = resolve(process.cwd(), 'data/evidence_lake/.pantip_timestamp_map.json');
const AUDIT_REPORT_PATH = resolve(process.cwd(), 'data/evidence_lake/review_audit_report.json');
const ENV_PATH = resolve(process.cwd(), '.env.local');

const isDryRun = process.argv.includes('--dry-run');
const isForce = process.argv.includes('--force');

// Load Mistral API key
let mistralKey = process.env.MISTRAL_API_KEY || '';
if (!mistralKey && existsSync(ENV_PATH)) {
  const envContent = readFileSync(ENV_PATH, 'utf-8');
  const match = envContent.match(/MISTRAL_API_KEY=(.+)/);
  if (match) mistralKey = match[1].trim().replace(/^['\"]|['\"]$/g, '');
}

// Load Translation Cache
let translationCache = {};
if (existsSync(CACHE_PATH)) {
  try {
    translationCache = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
  } catch {
    translationCache = {};
  }
}

// Load Pantip Timestamp Map
let pantipTimestampMap = {};
if (existsSync(TIMESTAMP_MAP_PATH)) {
  try {
    pantipTimestampMap = JSON.parse(readFileSync(TIMESTAMP_MAP_PATH, 'utf-8'));
  } catch {
    pantipTimestampMap = {};
  }
}

function saveTranslationCache() {
  writeFileSync(CACHE_PATH, JSON.stringify(translationCache, null, 2), 'utf-8');
}

function hashText(text) {
  return createHash('sha256').update(text, 'utf-8').digest('hex').slice(0, 16);
}

// Brand extraction patterns
const BRAND_PATTERNS = [
  { brand: 'HP', regex: /\b(hp|hewlett\s*packard|smart\s*tank|deskjet)\b/i, thai: /เอชพี/i },
  { brand: 'Epson', regex: /\b(epson|ecotank)\b/i, thai: /เอปสัน/i },
  { brand: 'Canon', regex: /\b(canon|megatank|pixma)\b/i, thai: /แคนนอน/i },
  { brand: 'Brother', regex: /\b(brother|dcp-t|mfc-t)\b/i, thai: /บราเดอร์/i },
];

function extractCommentBrands(text) {
  const brands = [];
  for (const { brand, regex, thai } of BRAND_PATTERNS) {
    if (regex.test(text) || thai.test(text)) {
      brands.push(brand);
    }
  }
  return brands;
}

// Canonical SKU patterns
const SKU_PATTERNS = [
  { brand: 'HP', sku: 'HP-ST-580', regex: /\b(?:smart\s*tank\s*)?580\b/i },
  { brand: 'HP', sku: 'HP-ST-515', regex: /\b(?:smart\s*tank\s*)?515\b/i },
  { brand: 'HP', sku: 'HP-ST-720', regex: /\b(?:smart\s*tank\s*)?720\b/i },
  { brand: 'HP', sku: 'HP-ST-750', regex: /\b(?:smart\s*tank\s*)?750\b/i },
  { brand: 'HP', sku: 'HP-ST-615', regex: /\b(?:smart\s*tank\s*)?615\b/i },
  { brand: 'HP', sku: 'HP-ST-210', regex: /\b(?:smart\s*tank\s*)?210\b/i },
  { brand: 'HP', sku: 'HP-ST-500', regex: /\b(?:smart\s*tank\s*)?500\b/i },
  { brand: 'Epson', sku: 'EPSON-ET-L3250', regex: /\b(?:l3250|l-3250)\b/i },
  { brand: 'Epson', sku: 'EPSON-ET-L3210', regex: /\b(?:l3210|l-3210)\b/i },
  { brand: 'Epson', sku: 'EPSON-ET-L3550', regex: /\b(?:l3550|l-3550|l3350)\b/i },
  { brand: 'Epson', sku: 'EPSON-ET-L5290', regex: /\b(?:l5290|l-5290)\b/i },
  { brand: 'Epson', sku: 'EPSON-ET-L1250', regex: /\b(?:l1250|l-1250)\b/i },
  { brand: 'Canon', sku: 'CANON-PIXMA-G3020', regex: /\b(?:g3020|g-3020)\b/i },
  { brand: 'Canon', sku: 'CANON-PIXMA-G2020', regex: /\b(?:g2020|g-2020|g2010)\b/i },
  { brand: 'Canon', sku: 'CANON-PIXMA-G3010', regex: /\b(?:g3010|g-3010)\b/i },
  { brand: 'Canon', sku: 'CANON-PIXMA-G3730', regex: /\b(?:g3730|g-3730)\b/i },
  { brand: 'Brother', sku: 'BROTHER-DCP-T420W', regex: /\b(?:t420w|t-420w|420w)\b/i },
  { brand: 'Brother', sku: 'BROTHER-DCP-T520W', regex: /\b(?:t520w|t-520w|520w|t530dw)\b/i },
  { brand: 'Brother', sku: 'BROTHER-DCP-T720DW', regex: /\b(?:t720dw|t-720dw|720dw)\b/i },
  { brand: 'Brother', sku: 'BROTHER-DCP-T426W', regex: /\b(?:t426w|t-426w|426w)\b/i },
];

function extractCommentSkus(text, brands) {
  const skus = [];
  for (const item of SKU_PATTERNS) {
    if (brands.includes(item.brand) && item.regex.test(text)) {
      skus.push(item.sku);
    }
  }
  return [...new Set(skus)];
}

// Category filter
const OFF_TOPIC_REGEX = /(omen|victus|pavilion|laptop|notebook|โน๊ตบุ๊ค|โน้ตบุ๊ก|การ์ดจอ|gpu|rtx|gtx|ssd|nvme|hdd|hard\s*drive|bios|motherboard|เมนบอร์ด|ram|desktop\s*pc|คอมประกอบ|gaming\s*pc|psu|power\s*supply)/i;
const PRINTER_REGEX = /(printer|print|printing|ink|tank|head|nozzle|เครื่องพิมพ์|ปริ้นเตอร์|ปริ้น|พิมพ์|หมึก|แท้งค์|หัวพิมพ์)/i;
const AI_COPIED_REGEX = /(deepseek|chatgpt|openai|claude|gemini|copilot|ai\s*ตอบว่า|ai\s*แนะนำ)/i;
const GENERAL_ESSAY_REGEX = /(ความรู้เรื่อง\s*printer|ตลาด\s*inkjet|หลักการทำงานของ|ประเภทของเครื่องพิมพ์)/i;
const SUPPORT_QA_REGEX = /(ไฟกระพริบ|ไฟสีส้ม|ไฟสีแดง|error\s*code|กระดาษติดแกน|สั่งพิมพ์จาก\s*excel|สั่งพิมพ์จาก\s*word|ขอภาพหน้าจอ|ตั้งค่า\s*printer|รุ่นอะไรก็ไม่บอก|factory\s*reset|hard\s*reset|driver\s*\.*\s*error|reinstall\s*driver|print\s*test\s*page|กดปุ่ม\s*resume|เป็นอย่างไรบ้างครับ|ได้หรือไม่ได้\s*เงียบเฉย)/i;
const REVIEW_EVAL_REGEX = /(คุ้ม|แนะนำ|ดีมาก|ห่วย|ช้าเกินไป|อย่าซื้อ|ชอบมาก|ยกให้คนอื่น|หมดปัญหา|ใช้อยู่|ซื้อมาใช้)/i;

function classifyCategory(text) {
  if (AI_COPIED_REGEX.test(text)) {
    return { status: 'AI_COPIED_CONTENT', reason: 'Pasted AI assistant chatbot troubleshooting response' };
  }
  if (OFF_TOPIC_REGEX.test(text) && (!PRINTER_REGEX.test(text) || /(omen|bios|nvme|ssd)/i.test(text))) {
    return { status: 'OFF_TOPIC', reason: 'Non-printer hardware (laptop/BIOS/SSD/PC components) unrelated to ink tank printers' };
  }
  if (GENERAL_ESSAY_REGEX.test(text)) {
    return { status: 'GENERAL_CATEGORY_CONTENT', reason: 'General educational tutorial/essay on printer mechanics rather than consumer product experience' };
  }
  if (SUPPORT_QA_REGEX.test(text) && !REVIEW_EVAL_REGEX.test(text)) {
    return { status: 'SUPPORT_DISCUSSION', reason: 'Technical troubleshooting Q&A and LED error blink code diagnostics without product evaluation' };
  }
  const brands = extractCommentBrands(text);
  if (brands.length > 1) {
    return { status: 'VERIFIED_COMPARATIVE_REVIEW', reason: null };
  }
  return { status: 'VERIFIED_REVIEW', reason: null };
}

function cleanTranslation(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/คห\.\s*(\d+)/g, 'Comment #$1')
    .replace(/คห\./g, 'Comment')
    .replace(/[\u0e00-\u0e7f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check translation authenticity
function isFakeTranslation(enText) {
  if (!enText) return true;
  if (typeof enText !== 'string') return true;
  if (/^\[(POSITIVE|NEGATIVE|MIXED|NEUTRAL|UNRESOLVED)\]\s*Consumer\s*feedback/i.test(enText)) return true;
  const thaiCount = (enText.match(/[\u0e00-\u0e7f]/g) || []).length;
  return thaiCount > 0;
}

function extractTranslationText(parsed) {
  if (!parsed) return null;
  let text = null;
  if (typeof parsed === 'string') text = parsed.trim();
  else if (typeof parsed.translation === 'string') text = parsed.translation.trim();
  else if (parsed.translation && typeof parsed.translation === 'object') {
    if (typeof parsed.translation.comment === 'string') text = parsed.translation.comment.trim();
    else if (typeof parsed.translation.text === 'string') text = parsed.translation.text.trim();
    else text = Object.values(parsed.translation).filter(v => typeof v === 'string').join(' ').trim();
  }
  else if (typeof parsed.english === 'string') text = parsed.english.trim();
  else if (typeof parsed.content === 'string') text = parsed.content.trim();
  return cleanTranslation(text);
}

// Call Mistral translation API with 429 retry backoff
async function translateWithMistral(rawThai, apiKey, attempt = 0) {
  const h = hashText(rawThai);
  if (translationCache[h] && !isForce) {
    const cleaned = cleanTranslation(translationCache[h]);
    if (!isFakeTranslation(cleaned)) {
      return cleaned;
    }
  }

  if (!apiKey) {
    return null;
  }

  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'ministral-14b-latest',
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `You are a professional Thai-to-English translator for an Ink Tank printer intelligence platform in Thailand.
CRITICAL REQUIREMENT: You MUST translate the following Thai user review into pure, fluent English prose.
Under NO circumstances should your translation contain any Thai script (ก-ฮ).
Preserve exact meaning, sentiment, brand mentions, printer model numbers (e.g. HP Smart Tank 580, Epson L3250, Brother T420W, Canon G3020) and technical terms.
Do NOT fabricate wrapper templates like "[POSITIVE] Consumer feedback...".
Output strictly valid JSON with the format: {"translation": "<fluent English translation here>"}. Output ONLY JSON.`
          },
          { role: 'user', content: rawThai },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (res.status === 429) {
      await res.text().catch(() => {});
      if (attempt < 6) {
        const delay = 2000 * (attempt + 1);
        await new Promise(r => setTimeout(r, delay));
        return translateWithMistral(rawThai, apiKey, attempt + 1);
      }
      return null;
    }

    if (!res.ok) {
      await res.text().catch(() => {});
      return null;
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    const translation = extractTranslationText(parsed);

    if (translation && !isFakeTranslation(translation)) {
      translationCache[h] = translation;
      saveTranslationCache();
      return translation;
    }
    return null;
  } catch {
    return null;
  }
}

// Entity-level sentiment analyzer
function evaluateEntitySentiments(text, brands, catStatus) {
  const lower = text.toLowerCase();
  const positiveClues = /(ดีมาก|คุ้ม|เปลี่ยนง่าย|สีสวย|คมชัด|สะดวก|ประหยัด|ชอบ|ยอดเยี่ยม|แนะนำ|ไหลลื่น|ทนทาน|ติดใจ|สมราคา)/i;
  const negativeClues = /(ช้า|พัง|ตัน|หลุด|แย่|ห่วย|ไม่จบ|error\s*บ่อย|ตัดออก|ยกให้คนอื่น|เปลือง|แพงเกิน|งอแง|บอร์ดตาย|ตาย|วุ่นวาย)/i;

  const brandSentiments = [];

  for (const b of brands) {
    let s = 'NEUTRAL';

    const brandThemes = [];
    if (/(สี|คมชัด|คุณภาพ|รูปถ่าย|photo|resolution|สวย|ดรอป)/i.test(lower)) brandThemes.push('Print Quality');
    if (/(ช้า|เร็ว|speed|พิมพ์งานช้า|พิมพ์เร็ว|ไว)/i.test(lower)) brandThemes.push('Print Speed');
    if (/(หัวพิมพ์|เปลี่ยนหัว|ตัน|ซับหมึก|ล้างหัว|head|nozzle)/i.test(lower)) brandThemes.push('Maintenance & Heads');
    if (/(ราคา|คุ้ม|แพง|ถูก|ประหยัด|ต้นทุน|cost|value)/i.test(lower)) brandThemes.push('Price & Value');
    if (/(wifi|ไวไฟ|แอป|app|เชื่อมต่อ|mobile)/i.test(lower)) brandThemes.push('Connectivity & Mobile');
    if (/(กระดาษติด|ดึงกระดาษ|ถึก|ทน|ฟีด|ลูกยาง|feed|jam)/i.test(lower)) brandThemes.push('Reliability & Feed');
    if (/(เติมหมึก|เติมง่าย|refill|ขวดหมึก)/i.test(lower)) brandThemes.push('Refill Experience');
    if (/(onsite|ประกัน|ศูนย์|เคลม|service)/i.test(lower)) brandThemes.push('Warranty & Service');

    if (b === 'HP') {
      const hpSlow = /(hp[^\.]*(?:ช้า|พิมพ์ช้า|ไม่จบ|error|ตัดออก)|ยกคนที่เขาไม่มีไปหมดแล้ว)/i.test(lower);
      const hpEasyHead = /(hp[^\.]*(?:เปลี่ยนหัวพิมพ์เองได้ง่าย|สะดวกกว่า|สีดำเข้ม|สีดำ\s*จะดำกว่า))/i.test(lower);
      if (hpSlow && !hpEasyHead) s = 'NEGATIVE';
      else if (hpEasyHead && !hpSlow) s = 'POSITIVE';
      else if (hpSlow && hpEasyHead) s = 'MIXED';
      else if (positiveClues.test(lower) && !negativeClues.test(lower)) s = 'POSITIVE';
      else if (negativeClues.test(lower)) s = 'NEGATIVE';
    } else if (b === 'Brother') {
      const brotherGood = /(แนะนำ\s*brother|brother[^\.]*(?:ดี|ok|ทนทาน|ล้างหัวพิมพ์แบบอัตโนมัติ|จัด|ใช้อยู่|พิมพ์เร็ว|ยอดเยี่ยม|ทำการบ้านมาดี|คุ้มค่า))/i.test(lower);
      const brotherColorWeak = /(brother[^\.]*(?:งานสีจะสู้เจ้าอื่นไม่ค่อยได้|สีไม่สวย|ปริ้นรูปสู้แบรนด์อื่นไม่ได้|สี\s*ที่ออกหม่น))/i.test(lower);
      if (brotherGood && !brotherColorWeak) s = 'POSITIVE';
      else if (brotherColorWeak && !brotherGood) s = 'NEGATIVE';
      else if (brotherGood && brotherColorWeak) s = 'MIXED';
      else if (positiveClues.test(lower)) s = 'POSITIVE';
    } else if (b === 'Epson') {
      const epsonGood = /(epson[^\.]*(?:ทนทาน|คุณภาพดี|แนะนำ|ประหยัดหมึก|สาวก\s*epson))/i.test(lower);
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

  let overallSentiment = 'NEUTRAL';
  if (catStatus === 'SUPPORT_DISCUSSION' || catStatus === 'GENERAL_CATEGORY_CONTENT') {
    overallSentiment = 'NEUTRAL';
  } else if (brandSentiments.length === 1) {
    overallSentiment = brandSentiments[0].sentiment;
  } else if (brandSentiments.length > 1) {
    const hasPos = brandSentiments.some(bs => bs.sentiment === 'POSITIVE');
    const hasNeg = brandSentiments.some(bs => bs.sentiment === 'NEGATIVE');
    if (hasPos && hasNeg) overallSentiment = 'MIXED';
    else if (hasPos) overallSentiment = 'POSITIVE';
    else if (hasNeg) overallSentiment = 'NEGATIVE';
  } else {
    if (positiveClues.test(lower) && !negativeClues.test(lower)) overallSentiment = 'POSITIVE';
    else if (negativeClues.test(lower) && !positiveClues.test(lower)) overallSentiment = 'NEGATIVE';
    else if (positiveClues.test(lower) && negativeClues.test(lower)) overallSentiment = 'MIXED';
  }

  return { overallSentiment, brandSentiments };
}

// Helper to run promises with concurrency limit
async function mapConcurrent(items, limit, fn) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
      await new Promise(r => setTimeout(r, 200));
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// Main execution
async function run() {
  console.log(`\n${'='.repeat(70)}`);
  console.log('PHASE 22: CONSUMER REVIEW DATA INTEGRITY REPROCESSOR');
  console.log(`${'='.repeat(70)}`);
  console.log(`Lake path: ${LAKE_PATH}`);
  console.log(`Dry run: ${isDryRun}`);
  console.log(`Mistral API configured: ${Boolean(mistralKey)}`);

  let data = JSON.parse(readFileSync(LAKE_PATH, 'utf-8'));
  const reviewRecords = data.filter(r => r.channel === 'Consumer Review' || r.activity_type === 'Consumer Review');

  console.log(`Total lake records: ${data.length}`);
  console.log(`Total Consumer Review records: ${reviewRecords.length}`);
  console.log(`Pantip timestamp map entries: ${Object.keys(pantipTimestampMap).length}\n`);

  const audit = {
    totalScanned: reviewRecords.length,
    verifiedReviews: 0,
    comparativeReviews: 0,
    offTopicExcluded: 0,
    generalEssayExcluded: 0,
    supportQaExcluded: 0,
    aiCopiedExcluded: 0,
    brandReassignments: 0,
    skuCorrections: 0,
    sentimentCorrections: 0,
    fakeTranslationsFixed: 0,
    translationFailures: 0,
    temporalReconstructed: 0,
    outOfWindowMarked: 0,
  };

  const beforeCounts = {
    total: reviewRecords.length,
    verified: reviewRecords.filter(r => r.category_status === 'VERIFIED_REVIEW').length,
    comparative: reviewRecords.filter(r => r.category_status === 'VERIFIED_COMPARATIVE_REVIEW').length,
    offTopic: reviewRecords.filter(r => r.category_status === 'OFF_TOPIC').length,
    generalEssay: reviewRecords.filter(r => r.category_status === 'GENERAL_CATEGORY_CONTENT').length,
    supportQa: reviewRecords.filter(r => r.category_status === 'SUPPORT_DISCUSSION').length,
    aiCopied: reviewRecords.filter(r => r.category_status === 'AI_COPIED_CONTENT').length,
  };

  console.log('Phase A: Resolving entities, categories, SKUs, timestamps, and sentiments...');
  for (const r of reviewRecords) {
    const text = r.raw_content_th || '';

    // 1. Category classification
    const cat = classifyCategory(text);
    r.category_status = cat.status;
    r.exclusion_reason = cat.reason;

    // 2. Brand entity extraction
    const detectedBrands = extractCommentBrands(text);
    r.detected_brands = detectedBrands;

    // E-commerce purchase review brand protection
    const isEcom = r.platform !== 'Pantip';

    if (cat.status === 'OFF_TOPIC') {
      r.attribution_status = 'EXCLUDED';
      r.attributed_brands = [];
    } else if (isEcom) {
      // E-commerce listing: product purchased is primary brand
      if (r.raw_title.includes('Brother') || r.seller_name?.includes('Brother')) {
        if (r.brand !== 'Brother') {
          audit.brandReassignments++;
          r.brand = 'Brother';
        }
      }
      const combinedBrands = [...new Set([r.brand, ...detectedBrands])];
      r.attributed_brands = combinedBrands;
      r.attribution_status = combinedBrands.length > 1 ? 'MULTI_BRAND' : 'CONFIRMED';
    } else if (detectedBrands.length > 0) {
      r.attributed_brands = detectedBrands;
      if (detectedBrands.length === 1) {
        if (r.brand !== detectedBrands[0]) {
          audit.brandReassignments++;
          r.brand = detectedBrands[0];
        }
        r.attribution_status = 'CONFIRMED';
      } else {
        r.attribution_status = 'MULTI_BRAND';
        if (!detectedBrands.includes(r.brand)) {
          r.brand = detectedBrands[0];
          audit.brandReassignments++;
        }
      }
    } else {
      r.attributed_brands = [r.brand];
      r.attribution_status = 'UNATTRIBUTED';
    }

    // 3. SKU resolution
    const effectiveBrandsForSku = r.attributed_brands.length > 0 ? r.attributed_brands : [r.brand];
    const detectedSkus = extractCommentSkus(text, effectiveBrandsForSku);
    r.detected_skus = detectedSkus;

    if (isEcom && !r.product_sku) {
      // Preserve verified e-commerce listing SKU from title if present
      for (const item of SKU_PATTERNS) {
        if (item.brand === r.brand && item.regex.test(r.raw_title)) {
          r.product_sku = item.sku;
          audit.skuCorrections++;
          break;
        }
      }
    }

    if (detectedSkus.length > 0) {
      if (r.product_sku !== detectedSkus[0]) {
        audit.skuCorrections++;
        r.product_sku = detectedSkus[0];
      }
      r.attributed_skus = detectedSkus;
    } else if (!isEcom) {
      // Pantip forum: if no explicit model mentioned in comment, product_sku must be null
      if (r.product_sku !== null) {
        audit.skuCorrections++;
        r.product_sku = null;
      }
      r.attributed_skus = [];
    }

    // 4. Timestamp restoration
    if (r.platform === 'Pantip') {
      const m = (r.source_url || '').match(/#comment-(\d+)/);
      if (m && pantipTimestampMap[m[1]]) {
        const trueDate = pantipTimestampMap[m[1]];
        if (r.published_at !== trueDate) {
          audit.temporalReconstructed++;
          r.published_at = trueDate;
        }

        // Check analytical window (28 May 2026 - 28 Aug 2026)
        if (trueDate < '2026-05-28' || trueDate > '2026-08-28') {
          audit.outOfWindowMarked++;
          r.temporal_window_status = 'OUT_OF_WINDOW';
        } else {
          r.temporal_window_status = 'IN_WINDOW';
        }
      } else {
        r.temporal_window_status = 'IN_WINDOW';
      }
    } else {
      r.temporal_window_status = 'IN_WINDOW';
    }

    // 5. Sentiment re-classification & entity-level linking
    const { overallSentiment, brandSentiments } = evaluateEntitySentiments(text, r.attributed_brands, r.category_status);
    r.brand_sentiments = brandSentiments;

    const oldSentiment = r.metadata?.sentiment || (r.evidence_tags || []).find(t => ['POSITIVE', 'NEGATIVE', 'MIXED', 'NEUTRAL'].includes(t));
    if (oldSentiment && oldSentiment !== overallSentiment) {
      audit.sentimentCorrections++;
    }

    if (r.metadata) {
      r.metadata.sentiment = overallSentiment;
    }

    // Update tags to remove false brand sentiment tags
    if (Array.isArray(r.evidence_tags)) {
      const cleanedTags = r.evidence_tags.filter(tag => !tag.endsWith(' Sentiment') && !['POSITIVE', 'NEGATIVE', 'MIXED', 'NEUTRAL'].includes(tag));
      cleanedTags.push(`${r.brand} Sentiment`);
      cleanedTags.push(overallSentiment);
      r.evidence_tags = cleanedTags;
    }

    // Clean cached translations
    if (r.content_en_translation) {
      r.content_en_translation = cleanTranslation(r.content_en_translation);
      if (isFakeTranslation(r.content_en_translation)) {
        r.translation_status = 'UNAVAILABLE';
        r.content_en_translation = null;
      } else {
        r.translation_status = 'TRANSLATED';
      }
    } else {
      r.translation_status = 'UNAVAILABLE';
    }

    if (r.category_status === 'VERIFIED_REVIEW') audit.verifiedReviews++;
    else if (r.category_status === 'VERIFIED_COMPARATIVE_REVIEW') audit.comparativeReviews++;
    else if (r.category_status === 'OFF_TOPIC') audit.offTopicExcluded++;
    else if (r.category_status === 'GENERAL_CATEGORY_CONTENT') audit.generalEssayExcluded++;
    else if (r.category_status === 'SUPPORT_DISCUSSION') audit.supportQaExcluded++;
    else if (r.category_status === 'AI_COPIED_CONTENT') audit.aiCopiedExcluded++;
  }

  // Phase B: Concurrent Mistral translation for fake/untranslated reviews
  console.log('Phase B: Authenticating translations via Mistral API...');
  const needsTranslation = reviewRecords.filter(r => isFakeTranslation(r.content_en_translation));
  console.log(`  Found ${needsTranslation.length} reviews requiring translation.`);

  let translatedProgress = 0;
  await mapConcurrent(needsTranslation, 2, async (r) => {
    audit.fakeTranslationsFixed++;
    const translated = await translateWithMistral(r.raw_content_th, mistralKey);
    if (translated && !isFakeTranslation(translated)) {
      r.content_en_translation = translated;
      r.translation_status = 'TRANSLATED';
    } else {
      r.content_en_translation = null;
      r.translation_status = 'UNAVAILABLE';
      audit.translationFailures++;
    }
    translatedProgress++;
    if (translatedProgress % 20 === 0 || translatedProgress === needsTranslation.length) {
      console.log(`  Translated ${translatedProgress}/${needsTranslation.length}...`);
    }
  });

  saveTranslationCache();

  // Write Machine-Readable Audit Report
  const auditReport = {
    timestamp: new Date().toISOString(),
    isDryRun,
    totalRecords: data.length,
    consumerReviewRecords: reviewRecords.length,
    before: beforeCounts,
    after: {
      verifiedReviews: audit.verifiedReviews,
      comparativeReviews: audit.comparativeReviews,
      offTopic: audit.offTopicExcluded,
      generalContent: audit.generalEssayExcluded,
      supportDiscussions: audit.supportQaExcluded,
      aiCopied: audit.aiCopiedExcluded,
      inWindow: reviewRecords.filter(r => r.temporal_window_status === 'IN_WINDOW').length,
      outOfWindow: audit.outOfWindowMarked,
    },
    modifications: {
      brandReassignments: audit.brandReassignments,
      skuCorrections: audit.skuCorrections,
      sentimentCorrections: audit.sentimentCorrections,
      temporalReconstructed: audit.temporalReconstructed,
      translationsFixed: audit.fakeTranslationsFixed,
      translationFailures: audit.translationFailures,
    },
    brandsBreakdown: {
      HP: reviewRecords.filter(r => r.brand === 'HP').length,
      Epson: reviewRecords.filter(r => r.brand === 'Epson').length,
      Canon: reviewRecords.filter(r => r.brand === 'Canon').length,
      Brother: reviewRecords.filter(r => r.brand === 'Brother').length,
    },
    categoryBreakdown: {
      VERIFIED_REVIEW: audit.verifiedReviews,
      VERIFIED_COMPARATIVE_REVIEW: audit.comparativeReviews,
      OFF_TOPIC: audit.offTopicExcluded,
      GENERAL_CATEGORY_CONTENT: audit.generalEssayExcluded,
      SUPPORT_DISCUSSION: audit.supportQaExcluded,
      AI_COPIED_CONTENT: audit.aiCopiedExcluded,
    },
  };

  if (!isDryRun) {
    writeFileSync(LAKE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    writeFileSync(AUDIT_REPORT_PATH, JSON.stringify(auditReport, null, 2), 'utf-8');
    console.log(`\n💾 Successfully wrote reprocessed evidence lake to ${LAKE_PATH}`);
    console.log(`📊 Successfully generated audit report to ${AUDIT_REPORT_PATH}`);
  } else {
    console.log(`\n🔍 [DRY RUN] No changes were written to ${LAKE_PATH}`);
  }

  console.log(`\n${'─'.repeat(70)}`);
  console.log('REPROCESSING AUDIT REPORT');
  console.log(`${'─'.repeat(70)}`);
  console.table(audit);
  console.log(`${'='.repeat(70)}\n`);
}

run().catch(err => {
  console.error('Fatal error during review reprocessing:', err);
  process.exit(1);
});
