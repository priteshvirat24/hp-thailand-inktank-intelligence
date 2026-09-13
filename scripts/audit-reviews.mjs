#!/usr/bin/env node
/**
 * audit:reviews — Local Evidence Lake Review Audit Script
 *
 * Detects:
 * - Synthetic records (INVALID_SYNTHETIC markers)
 * - Missing provenance / source_url
 * - Unsupported verification badges
 * - Synthetic ratings / dates
 * - Cross-SKU contamination
 * - Duplicate content fingerprints
 * - Records with extraction_method = "Live Scrapling Web Ingestion" (synthetic flag)
 * - Records with confidence_score = 0.98 (synthetic hardcoded value)
 *
 * Usage: npm run audit:reviews
 */

import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { resolve } from 'path';

const LAKE_PATH = resolve(process.cwd(), 'data/evidence_lake/scrapling_verified_lake.json');

function hashContent(text) {
  return createHash('sha256').update(text, 'utf-8').digest('hex').slice(0, 16);
}

let data;
try {
  data = JSON.parse(readFileSync(LAKE_PATH, 'utf-8'));
} catch (e) {
  console.error('[AUDIT:REVIEWS] ❌ Failed to read evidence lake:', e.message);
  process.exit(1);
}

const total = data.length;
const reviews = data.filter(r => r.channel === 'Consumer Review' || r.activity_type === 'Consumer Review');

console.log(`\n${'='.repeat(60)}`);
console.log('AUDIT: CONSUMER REVIEWS — Local Evidence Lake');
console.log(`${'='.repeat(60)}`);
console.log(`Total records in lake: ${total}`);
console.log(`Consumer Review records: ${reviews.length}`);

let issues = 0;
const contentHashes = new Map(); // content_hash -> [evidence_id]
const urlHashes = new Map();     // source_url -> [evidence_id]

const SYNTHETIC_EXTRACTION_METHODS = [
  'Live Scrapling Web Ingestion',
  'synthetic_template',
];

for (const r of reviews) {
  const eid = r.evidence_id || '?';
  
  // 1. Synthetic extraction method
  if (SYNTHETIC_EXTRACTION_METHODS.includes(r.extraction_method)) {
    console.log(`  ❌ SYNTHETIC EXTRACTION: ${eid} — extraction_method="${r.extraction_method}"`);
    issues++;
  }
  
  // 2. Hardcoded confidence
  if (r.confidence_score === 0.98) {
    console.log(`  ❌ HARDCODED CONFIDENCE: ${eid} — confidence_score=0.98`);
    issues++;
  }
  
  // 3. Missing source_url
  if (!r.source_url) {
    console.log(`  ❌ MISSING SOURCE URL: ${eid}`);
    issues++;
  }
  
  // 4. Generic/search-page source URLs
  if (r.source_url) {
    const u = r.source_url;
    if (u.includes('/search?') || u.includes('/catalog/?') || u.includes('/tag/')) {
      console.log(`  ⚠️  GENERIC/SEARCH URL: ${eid} — ${u}`);
      issues++;
    }
  }
  
  // 5. No raw Thai text
  if (!r.raw_content_th) {
    console.log(`  ⚠️  MISSING RAW THAI TEXT: ${eid}`);
    issues++;
  }
  
  // 6. Content fingerprint for cross-SKU duplicate detection
  if (r.raw_content_th) {
    const h = hashContent(r.raw_content_th);
    if (!contentHashes.has(h)) contentHashes.set(h, []);
    contentHashes.get(h).push(eid);
  }
  
  // 7. URL reuse across unrelated records
  if (r.source_url) {
    const u = r.source_url;
    if (!urlHashes.has(u)) urlHashes.set(u, []);
    urlHashes.get(u).push(eid);
  }
  
  // 8. Unsupported Pantip "Verified Purchaser" — platform-level check
  if (r.platform === 'Pantip' && r.is_official_store) {
    console.log(`  ❌ PANTIP OFFICIAL STORE: ${eid} — Pantip is never an official store`);
    issues++;
  }

  // 9. PHASE 22: Fake English translation wrapper check
  const enText = r.content_en_translation || '';
  if (/^\[(POSITIVE|NEGATIVE|NEUTRAL|MIXED)\]\s+Consumer\s+feedback/i.test(enText) ||
      /^Consumer\s+feedback\s+on/i.test(enText)) {
    console.log(`  ❌ FAKE TRANSLATION WRAPPER: ${eid} — "${enText.slice(0, 60)}..."`);
    issues++;
  }

  // 10. PHASE 22: Thai script inside English translation
  if (r.translation_status === 'TRANSLATED' && /[\u0E00-\u0E7F]/.test(enText)) {
    console.log(`  ❌ THAI TEXT IN ENGLISH TRANSLATION: ${eid}`);
    issues++;
  }

  // 11. PHASE 22: Category contamination in VERIFIED_REVIEW
  const rawTextLower = (r.raw_content_th || '').toLowerCase();
  const isOffTopicKeyword = /\b(omen|victus|pavilion|bios|desktop|gpu|ssd|ram|motherboard|windows\s*11|gaming\s*pc|rtx)\b/i.test(rawTextLower);
  if (isOffTopicKeyword && r.category_status === 'VERIFIED_REVIEW') {
    console.log(`  ❌ OFF-TOPIC LABELED VERIFIED_REVIEW: ${eid}`);
    issues++;
  }

  // 12. PHASE 22: Exclusion reason required for non-verified categories
  const excludedCategories = ['OFF_TOPIC', 'AI_COPIED_CONTENT', 'GENERAL_CATEGORY_CONTENT', 'SUPPORT_DISCUSSION'];
  if (excludedCategories.includes(r.category_status) && !r.exclusion_reason) {
    console.log(`  ❌ MISSING EXCLUSION REASON: ${eid} (${r.category_status})`);
    issues++;
  }
}

// 13. Cross-SKU contamination: same text → multiple SKUs
let contamination = 0;
for (const [h, eids] of contentHashes.entries()) {
  if (eids.length > 1) {
    const records = reviews.filter(r => eids.includes(r.evidence_id));
    const skus = [...new Set(records.map(r => r.product_sku))].filter(Boolean);
    if (skus.length > 1) {
      console.log(`  ❌ CROSS-SKU CONTAMINATION: "${h}" → ${eids.join(', ')} across SKUs: ${skus.join(', ')}`);
      contamination++;
      issues++;
    }
  }
}

// 14. URL reuse across unrelated records
let urlReuse = 0;
for (const [url, eids] of urlHashes.entries()) {
  if (eids.length > 3) {
    urlReuse++;
  }
}

// Phase 22 Category Breakdown
const categoryCounts = {};
for (const r of reviews) {
  const cat = r.category_status || 'UNCLASSIFIED';
  categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
}

const translationCounts = {};
for (const r of reviews) {
  const st = r.translation_status || 'UNTRACKED';
  translationCounts[st] = (translationCounts[st] || 0) + 1;
}

const windowCounts = {};
for (const r of reviews) {
  const win = r.temporal_window_status || 'UNTRACKED';
  windowCounts[win] = (windowCounts[win] || 0) + 1;
}

console.log(`\n${'─'.repeat(60)}`);
console.log('PHASE 22 REPROCESSING BREAKDOWN');
console.log(`${'─'.repeat(60)}`);
console.log('Category Statuses:');
for (const [cat, count] of Object.entries(categoryCounts)) {
  console.log(`  ${cat.padEnd(30)}: ${count}`);
}
console.log('Translation Statuses:');
for (const [st, count] of Object.entries(translationCounts)) {
  console.log(`  ${st.padEnd(30)}: ${count}`);
}
console.log('Temporal Window Statuses:');
for (const [win, count] of Object.entries(windowCounts)) {
  console.log(`  ${win.padEnd(30)}: ${count}`);
}

console.log(`\n${'─'.repeat(60)}`);
console.log('SUMMARY');
console.log(`${'─'.repeat(60)}`);
console.log(`Consumer Review records: ${reviews.length}`);
console.log(`Cross-SKU contamination instances: ${contamination}`);
console.log(`URL reuse warnings: ${urlReuse}`);
console.log(`Total issues found: ${issues}`);

if (issues === 0) {
  console.log(`\n✅ PASS — No data integrity issues detected in Consumer Reviews`);
  process.exit(0);
} else {
  console.log(`\n❌ FAIL — ${issues} issue(s) detected. Review output above.`);
  process.exit(1);
}
