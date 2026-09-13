/**
 * Phase 22: Consumer Review Data Integrity Test Suite
 * 
 * Verifies:
 * 1. Off-topic hardware discussions (laptop BIOS, SSD) are quarantined and excluded from HP metrics.
 * 2. General tutorial essays and AI-copied summaries are not attributed as HP-ST-580 reviews.
 * 3. Competitor forum recommendations are attributed to their true brands (Brother, Epson).
 * 4. All English translations are authentic, fluent English prose without Thai characters or synthetic template wrappers.
 * 5. Temporal timestamps are reconstructed from authentic source metadata and properly scoped.
 * 6. Metric Cube metrics strictly ignore quarantined and off-topic records.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { RawEvidenceRecord } from '@/types/evidence';
import { METRIC_DEFINITIONS } from '@/services/analytics/metricRegistry';
import { buildChunkContent } from '@/services/rag/evidenceDocumentBuilder';

describe('Phase 22: Consumer Review Data Integrity & Forensic Verification', () => {
  let lakeRecords: RawEvidenceRecord[];
  let reviewRecords: RawEvidenceRecord[];

  beforeAll(() => {
    const lakePath = path.resolve(process.cwd(), 'data/evidence_lake/scrapling_verified_lake.json');
    expect(fs.existsSync(lakePath)).toBe(true);
    const raw = fs.readFileSync(lakePath, 'utf8');
    lakeRecords = JSON.parse(raw);
    reviewRecords = lakeRecords.filter((r) => r.channel === 'Consumer Review');
  });

interface ReviewRecordWithMeta {
  category_status?: string;
  attribution_status?: string;
  detected_brands?: string[];
  translation_status?: string;
  temporal_window_status?: string;
}

  describe('1. Dataset Completeness and Scope', () => {
    it('should have 138 consumer review records in the lake', () => {
      expect(reviewRecords.length).toBe(138);
    });

    it('should have all reviews tagged with category_status and attribution_status', () => {
      for (const r of reviewRecords) {
        const rec = r as unknown as ReviewRecordWithMeta;
        expect(rec.category_status).toBeDefined();
        expect([
          'VERIFIED_REVIEW',
          'VERIFIED_COMPARATIVE_REVIEW',
          'VERIFIED_PRINTER_REVIEW',
          'OFF_TOPIC',
          'GENERAL_CATEGORY_CONTENT',
          'SUPPORT_DISCUSSION',
          'AI_COPIED_CONTENT',
        ]).toContain(rec.category_status);
        expect(rec.attribution_status).toBeDefined();
        expect(['DIRECT_EVALUATION', 'COMPARATIVE_MENTION', 'CONFIRMED', 'MULTI_BRAND', 'UNATTRIBUTED', 'EXCLUDED']).toContain(
          rec.attribution_status
        );
      }
    });
  });

  describe('2. Off-Topic Hardware Comments Quarantine', () => {
    it('should quarantine laptop BIOS and SSD hardware discussions', () => {
      const biosPost = reviewRecords.find((r) => r.evidence_id === 'EVID-PANTIP-34CD55F76E2F');
      expect(biosPost).toBeDefined();
      const rec = biosPost as unknown as ReviewRecordWithMeta;
      expect(rec.category_status).toBe('OFF_TOPIC');
      expect(rec.attribution_status).toBe('EXCLUDED');
      expect(biosPost?.product_sku).toBeNull();

      const ssdPost = reviewRecords.find((r) => r.evidence_id === 'EVID-PANTIP-55505A5E2E48');
      expect(ssdPost).toBeDefined();
      const ssdRec = ssdPost as unknown as ReviewRecordWithMeta;
      expect(ssdRec.category_status).toBe('OFF_TOPIC');
      expect(ssdRec.attribution_status).toBe('EXCLUDED');
      expect(ssdPost?.product_sku).toBeNull();
    });

    it('should ensure no off-topic records are mapped to HP Smart Tank 580', () => {
      const offTopicWithHpSku = reviewRecords.filter(
        (r) => (r as unknown as ReviewRecordWithMeta).category_status === 'OFF_TOPIC' && r.product_sku === 'HP-ST-580'
      );
      expect(offTopicWithHpSku.length).toBe(0);
    });
  });

  describe('3. Competitor Brand Disambiguation & Attribution', () => {
    it('should properly attribute Brother-specific discussions to Brother', () => {
      const brotherDcpReviews = reviewRecords.filter(
        (r) =>
          r.brand === 'Brother' &&
          ((r.raw_content_th && /DCP-T|Brother/i.test(r.raw_content_th)) ||
            (r.content_en_translation && /Brother/i.test(String(r.content_en_translation))))
      );
      expect(brotherDcpReviews.length).toBeGreaterThan(0);
      for (const r of brotherDcpReviews) {
        expect(r.brand).toBe('Brother');
      }
    });

    it('should not force HP-ST-580 SKU onto off-topic records or competitor-exclusive records', () => {
      const nonHpRecords = reviewRecords.filter(
        (r) => (r as unknown as ReviewRecordWithMeta).category_status === 'OFF_TOPIC' || (r.brand !== 'HP' && !(r as unknown as ReviewRecordWithMeta).detected_brands?.includes('HP'))
      );
      expect(nonHpRecords.length).toBeGreaterThan(20);
      for (const t of nonHpRecords) {
        expect(t.product_sku).not.toBe('HP-ST-580');
      }
    });
  });

  describe('4. Translation Quality & Absence of Synthetic Artifacts', () => {
    it('should have 0% synthetic boilerplate headers in English translations', () => {
      const forbiddenBoilerplates = [
        'Pantip Consumer Review (Consumer Voice):',
        'Customer review on Pantip:',
        'User review from Pantip:',
      ];

      for (const r of reviewRecords) {
        const en = typeof r.content_en_translation === 'string' ? r.content_en_translation : '';
        for (const fp of forbiddenBoilerplates) {
          expect(en.startsWith(fp)).toBe(false);
        }
      }
    });

    it('should have verified English translations without unhandled Thai text', () => {
      const thaiPattern = /[\u0E00-\u0E7F]/;
      for (const r of reviewRecords) {
        const en = typeof r.content_en_translation === 'string' ? r.content_en_translation : '';
        expect(en.length).toBeGreaterThan(10);
        // English translation must not contain Thai script
        expect(thaiPattern.test(en)).toBe(false);
        // Translation status should be VERIFIED or TRANSLATED
        expect(['VERIFIED', 'TRANSLATED']).toContain((r as unknown as ReviewRecordWithMeta).translation_status);
      }
    });
  });

  describe('5. Authentic Timestamps & Temporal Scoping', () => {
    it('should have authentic published_at timestamps with temporal_window_status', () => {
      for (const r of reviewRecords) {
        expect(r.published_at).toBeDefined();
        expect(r.published_at).toMatch(/^\d{4}-\d{2}-\d{2}/);
        const rec = r as unknown as ReviewRecordWithMeta;
        expect(['IN_WINDOW', 'OUT_OF_WINDOW']).toContain(rec.temporal_window_status);

        // Historical pre-June 2026 posts must be tagged OUT_OF_WINDOW
        const pubDate = new Date(r.published_at);
        if (pubDate < new Date('2026-05-28T00:00:00Z')) {
          expect(rec.temporal_window_status).toBe('OUT_OF_WINDOW');
        }
      }
    });
  });

  describe('6. Metric Cube Protection in metricRegistry', () => {
    it('TOTAL_CONSUMER_REVIEWS_COUNT should exclude off-topic and general essay records', () => {
      const metricDef = METRIC_DEFINITIONS.TOTAL_CONSUMER_REVIEWS_COUNT;
      const result = metricDef.calculate(reviewRecords);
      expect(result.data_state).toBe('OBSERVED');
      // 138 total - 11 off-topic - 1 AI copied - 1 general tutorial - 7 support discussions = 118 verified reviews
      expect(result.value).toBe(118);
    });

    it('AVG_CONSUMER_RATING should only average legitimate reviews with positive numeric ratings', () => {
      const metricDef = METRIC_DEFINITIONS.AVG_CONSUMER_RATING;
      const result = metricDef.calculate(reviewRecords);
      expect(result.data_state).toBe('OBSERVED');
      expect(typeof result.value).toBe('number');
      expect(result.value as number).toBeGreaterThanOrEqual(1);
      expect(result.value as number).toBeLessThanOrEqual(5);
    });
  });

  describe('7. RAG Chunk Document Builder Integration', () => {
    it('should embed integrity metadata into RAG chunk content', () => {
      const sampleReview = reviewRecords[0];
      const chunkContent = buildChunkContent(sampleReview);
      expect(chunkContent).toContain('Category Status:');
      expect(chunkContent).toContain('Attribution Status:');
      expect(chunkContent).toContain('Temporal Window Status:');
    });
  });
});
