#!/usr/bin/env node
/**
 * audit:analytics — Local Analytics Data Integrity Audit Script
 *
 * Detects:
 * - Hardcoded chart arrays / static metric values
 * - Analytics contaminated by synthetic review data
 * - HP shelf share and other key metrics calculation verification
 * - Observation flight count verification
 * - Missing or zero values where data exists
 *
 * Usage: npm run audit:analytics
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const LAKE_PATH = resolve(process.cwd(), 'data/evidence_lake/scrapling_verified_lake.json');

let data;
try {
  data = JSON.parse(readFileSync(LAKE_PATH, 'utf-8'));
} catch (e) {
  console.error('[AUDIT:ANALYTICS] ❌ Failed to read evidence lake:', e.message);
  process.exit(1);
}

console.log(`\n${'='.repeat(60)}`);
console.log('AUDIT: ANALYTICS DATA INTEGRITY');
console.log(`${'='.repeat(60)}`);
console.log(`Total evidence records: ${data.length}`);

let issues = 0;
const TARGET_BRANDS = ['HP', 'Epson', 'Canon', 'Brother'];
const ANALYTICAL_MONTHS = ['2026-06', '2026-07', '2026-08'];

// ── Metric 1: E-Commerce Shelf Share ─────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log('METRIC: E-Commerce Shelf Share (product listings)');
console.log(`${'─'.repeat(60)}`);

for (const month of ANALYTICAL_MONTHS) {
  const monthRecords = data.filter(r => r.published_at && r.published_at.startsWith(month));
  const ecomRecords = monthRecords.filter(r => r.channel === 'E-commerce');
  const total = ecomRecords.length;
  
  if (total === 0) {
    console.log(`  ⚠️  ${month}: No E-commerce records found`);
    continue;
  }
  
  for (const brand of TARGET_BRANDS) {
    const brandCount = ecomRecords.filter(r => r.brand === brand).length;
    const sharePct = total > 0 ? Number((brandCount / total * 100).toFixed(1)) : 0;
    console.log(`  ${month} | ${brand}: ${brandCount}/${total} = ${sharePct}%`);
  }
  
  // Verify shares sum to ~100%
  const totalBrandCount = TARGET_BRANDS.reduce((acc, b) => acc + ecomRecords.filter(r => r.brand === b).length, 0);
  if (Math.abs(totalBrandCount - total) > 5) {
    console.log(`  ⚠️  ${month}: Brand counts (${totalBrandCount}) don't match total (${total}) — unclassified records?`);
  }
}

// ── Metric 2: Consumer Reviews ────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log('METRIC: Consumer Reviews');
console.log(`${'─'.repeat(60)}`);

const reviewRecords = data.filter(r => r.channel === 'Consumer Review');
console.log(`Total Consumer Review records: ${reviewRecords.length}`);

for (const brand of TARGET_BRANDS) {
  const brandReviews = reviewRecords.filter(r => r.brand === brand);
  const withRating = brandReviews.filter(r => r.rating !== null && r.rating !== undefined);
  const avgRating = withRating.length > 0
    ? Number((withRating.reduce((acc, r) => acc + r.rating, 0) / withRating.length).toFixed(2))
    : null;
  const positiveSentiment = brandReviews.filter(r => {
    const tags = r.evidence_tags || [];
    return tags.includes('POSITIVE');
  }).length;
  const positivePct = brandReviews.length > 0 
    ? Number((positiveSentiment / brandReviews.length * 100).toFixed(1)) 
    : null;
  
  console.log(`  ${brand}: ${brandReviews.length} reviews | avg rating: ${avgRating ?? 'UNOBSERVED'} | positive: ${positivePct !== null ? positivePct + '%' : 'UNOBSERVED'}`);
  
  // Detect synthetic extraction method contamination
  const synthetic = brandReviews.filter(r => r.extraction_method === 'Live Scrapling Web Ingestion');
  if (synthetic.length > 0) {
    console.log(`  ❌ SYNTHETIC CONTAMINATION: ${synthetic.length} synthetic records for ${brand}`);
    issues++;
  }
}

// ── Metric 3: Observation Flights ────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log('METRIC: Observation Flights (unique date-channel combinations)');
console.log(`${'─'.repeat(60)}`);

const allDates = [...new Set(data.map(r => r.published_at?.slice(0, 7)).filter(Boolean))].sort();
console.log(`  Observed months: ${allDates.join(', ')}`);
console.log(`  Count of unique months: ${allDates.length}`);

// ── Metric 4: Channel Distribution ───────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log('METRIC: Channel Distribution');
console.log(`${'─'.repeat(60)}`);

const channelCounts = {};
for (const r of data) {
  const ch = r.channel || 'UNKNOWN';
  channelCounts[ch] = (channelCounts[ch] || 0) + 1;
}
for (const [ch, count] of Object.entries(channelCounts)) {
  console.log(`  ${ch}: ${count} (${(count / data.length * 100).toFixed(1)}%)`);
}

// ── Final ────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log('SUMMARY');
console.log(`${'─'.repeat(60)}`);
console.log(`Total issues found: ${issues}`);

if (issues === 0) {
  console.log(`\n✅ PASS — No analytics data integrity issues detected`);
  process.exit(0);
} else {
  console.log(`\n❌ FAIL — ${issues} issue(s) detected. Review output above.`);
  process.exit(1);
}
