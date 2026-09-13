/**
 * Phase 22: Complete Consumer Review Data Integrity Remediation Test Suite
 * 
 * Behavioral and Adversarial Verification:
 * 1. Translation Authenticity & Validation (No synthetic wrappers, no unhandled Thai script in EN)
 * 2. Language Detection (TH, EN, mixed)
 * 3. Thread vs Comment Entity Isolation (No thread-level brand/SKU inheritance)
 * 4. Multi-Brand Attribution & Entity-Linked Sentiment (Subject sentiment mapping)
 * 5. SKU Precision & Null-on-Ambiguity (No forced HP-ST-580 defaults)
 * 6. Category Contamination Gate (Rejection of BIOS, Omen, SSD, laptops, PC accessories)
 * 7. AI-Generated / Copied Content Quarantine
 * 8. Generic Educational Content Quarantine (GENERAL_CATEGORY_CONTENT)
 * 9. Diagnostic Support Q&A Quarantine (SUPPORT_DISCUSSION)
 * 10. Temporal Reconstruction & Buddhist Era Conversion (Out-of-window preservation, no fake 2026-08-15)
 * 11. Metric Cube Gating (isValidConsumerReview ensures only verified reviews feed metrics)
 * 12. RAG Review Isolation (Off-topic, support, and AI-copied chunks excluded from consumer voice queries)
 * 13. Idempotency & Evidence Lineage
 */

import { describe, it, expect } from 'vitest';
import {
  classifyReviewCategory,
  extractBrandEntities,
  resolveSkuAttribution,
  validateTranslation,
  detectReviewLanguage,
  extractEntitySentiments,
  parseAuthenticDate,
  buddhistEraToIso,
  reprocessReviewRecord,
} from '@/services/reviews/reviewReprocessor';
import { isValidConsumerReview } from '@/services/analytics/metricRegistry';
import { isOffTopicForRag } from '@/services/rag/retrievalEngine';
import { RawEvidenceRecord } from '@/types/evidence';

describe('Phase 22: Consumer Review Data Integrity Remediation', () => {

  // =========================================================================
  // Section 71: Adversarial Review Fixtures (13 Mandatory Test Cases)
  // =========================================================================
  describe('Adversarial Review Fixtures (13 Scenarios)', () => {

    // Fixture 1: HP thread + Brother/Epson comment
    it('Fixture 1: should attribute Brother and Epson from comment text, refusing thread-level HP inheritance', () => {
      const commentText = 'ระหว่าง Brother T430W กับ Epson L3250 ตัวไหนทนกว่าและพิมพ์งานได้คุ้มกว่ากันครับ';
      
      const brands = extractBrandEntities(commentText);
      expect(brands.detected_brands).toContain('Brother');
      expect(brands.detected_brands).toContain('Epson');
      expect(brands.detected_brands).not.toContain('HP');
      expect(brands.attributed_brands).toContain('Brother');
      expect(brands.attributed_brands).toContain('Epson');

      const skus = resolveSkuAttribution(commentText, brands.attributed_brands);
      expect(skus.attributed_skus).not.toContain('HP-ST-580');
      expect(skus.detected_skus.some(s => /430|3250/.test(s))).toBe(true);
    });

    // Fixture 2: HP thread + unrelated laptop comment
    it('Fixture 2: should classify HP OMEN laptop BIOS update as OFF_TOPIC with exclusion reason', () => {
      const commentText = 'อัพเดท BIOS ของ HP OMEN 16 แล้วเครื่องเปิดไม่ติด พัดลมหมุนแรงมาก มีใครเจอปัญหานี้บ้าง';
      const category = classifyReviewCategory(commentText);
      
      expect(category.status).toBe('OFF_TOPIC');
      expect(category.exclusion_reason).toBeDefined();
      expect(category.exclusion_reason).toContain('Off-topic hardware/software');
    });

    // Fixture 3: Positive Brother + negative HP
    it('Fixture 3: should extract entity-linked sentiment: HP negative, Brother positive', () => {
      const commentText = 'ผมยกเครื่องพิมพ์ HP ให้คนอื่นหมดเลยเพราะปริ้นช้ามาก ตอนนี้หันมาใช้ Brother ดีกว่าเยอะ เร็วกว่าและไม่งอแง';
      const brands = extractBrandEntities(commentText);
      expect(brands.detected_brands).toContain('HP');
      expect(brands.detected_brands).toContain('Brother');

      const entitySentiments = extractEntitySentiments(commentText, brands.attributed_brands);
      const hpSentiment = entitySentiments.find(s => s.brand === 'HP');
      const brotherSentiment = entitySentiments.find(s => s.brand === 'Brother');

      expect(hpSentiment).toBeDefined();
      expect(hpSentiment?.sentiment).toBe('NEGATIVE');
      expect(brotherSentiment).toBeDefined();
      expect(brotherSentiment?.sentiment).toBe('POSITIVE');
    });

    // Fixture 4: Mixed HP/Epson comparison
    it('Fixture 4: should handle multi-brand comparison with distinct entity sentiments and themes', () => {
      const commentText = 'HP สามารถเปลี่ยนหัวพิมพ์เองได้ง่ายกว่า แต่ Epson หมึกแท้ทนทานและหัวพิมพ์ตันยากกว่า';
      const brands = extractBrandEntities(commentText);
      expect(brands.detected_brands).toContain('HP');
      expect(brands.detected_brands).toContain('Epson');

      const entitySentiments = extractEntitySentiments(commentText, brands.attributed_brands);
      const hpItem = entitySentiments.find(s => s.brand === 'HP');
      const epsonItem = entitySentiments.find(s => s.brand === 'Epson');

      expect(hpItem?.sentiment).toBe('POSITIVE');
      expect(hpItem?.themes).toContain('DIY Maintenance / Printhead');
      expect(epsonItem?.sentiment).toBe('POSITIVE');
      expect(epsonItem?.themes).toContain('Durability & Reliability');
    });

    // Fixture 5: No brand mentioned
    it('Fixture 5: should return empty detected/attributed brands and UNATTRIBUTED when no brand mentioned', () => {
      const commentText = 'เครื่องพิมพ์รุ่นนี้หมึกหมดไวมาก และเสียงการทำงานดังรบกวนเวลาพิมพ์ดึกๆ';
      const brands = extractBrandEntities(commentText);
      expect(brands.detected_brands.length).toBe(0);
      expect(brands.attributed_brands.length).toBe(0);
      expect(brands.attribution_status).toBe('UNATTRIBUTED');
    });

    // Fixture 6: No SKU mentioned
    it('Fixture 6: should keep SKU null when only generic brand is mentioned without specific model', () => {
      const commentText = 'เครื่องปริ้น HP ตัวใหม่ใช้งานดี สีสวย คุ้มราคามาก';
      const brands = extractBrandEntities(commentText);
      expect(brands.detected_brands).toContain('HP');

      const skus = resolveSkuAttribution(commentText, brands.attributed_brands);
      expect(skus.primary_sku).toBeNull();
      expect(skus.detected_skus.length).toBe(0);
    });

    // Fixture 7: Historical 2022 timestamp
    it('Fixture 7: should parse authentic 2022 date, never overwriting with 2026-08-15, and mark OUT_OF_WINDOW', () => {
      const rawDateStr = '2022-04-10 14:20:00';
      const parsed = parseAuthenticDate(rawDateStr);

      expect(parsed.published_at).toBe('2022-04-10T14:20:00.000Z');
      expect(parsed.temporal_window_status).toBe('OUT_OF_WINDOW');
      expect(parsed.published_at).not.toBe('2026-08-15');
    });

    // Fixture 8: Pure Thai comment
    it('Fixture 8: should correctly detect Thai language for pure Thai text', () => {
      const commentText = 'ใช้งานง่าย พิมพ์ได้ต่อเนื่อง หมึกไม่เยิ้ม ดีมากครับ';
      const lang = detectReviewLanguage(commentText);
      expect(lang).toBe('th');
    });

    // Fixture 9: Pure English comment
    it('Fixture 9: should detect English and mark translation_status as SOURCE_EN without redundant translation', () => {
      const commentText = 'Great print quality and the wireless setup was very smooth.';
      const lang = detectReviewLanguage(commentText);
      expect(lang).toBe('en');

      const transVal = validateTranslation(commentText, commentText);
      expect(transVal.translation_status).toBe('SOURCE_EN');
      expect(transVal.content_en_translation).toBe(commentText);
    });

    // Fixture 10: Thai + English mixed comment
    it('Fixture 10: should detect mixed language safely and validate English translation', () => {
      const commentText = 'เครื่องพิมพ์ HP Smart Tank 580 ใช้งานดีมาก setup ผ่าน Wi-Fi ง่ายสุดๆ';
      const lang = detectReviewLanguage(commentText);
      expect(lang).toBe('mixed');

      const validEnTranslation = 'The HP Smart Tank 580 printer works very well, and setup via Wi-Fi was extremely easy.';
      const transVal = validateTranslation(commentText, validEnTranslation);
      expect(transVal.translation_status).toBe('TRANSLATED');
      expect(transVal.content_en_translation).toBe(validEnTranslation);
    });

    // Fixture 11: Copied AI troubleshooting text
    it('Fixture 11: should quarantine DeepSeek / ChatGPT copied answers as AI_COPIED_CONTENT', () => {
      const commentText = 'จากการวิเคราะห์ของ DeepSeek R1 วิธีแก้ปัญหาหมึกไม่ออกในเครื่อง Ink Tank มีดังนี้ 1. ทำการ Head Cleaning ผ่านโปรแกรมไดรเวอร์ 2. ตรวจสอบระบบท่อส่งหมึก';
      const category = classifyReviewCategory(commentText);
      expect(category.status).toBe('AI_COPIED_CONTENT');
      expect(category.exclusion_reason).toContain('AI-generated or copied technical answer');
    });

    // Fixture 12: Generic printer education essay
    it('Fixture 12: should classify educational tutorial as GENERAL_CATEGORY_CONTENT rather than consumer review', () => {
      const commentText = 'ความรู้เรื่อง Printer เบื้องต้น: ความแตกต่างระหว่าง Inkjet Cartridge กับ Ink Tank ในด้านต้นทุนต่อแผ่นและความถี่ในการใช้งาน';
      const category = classifyReviewCategory(commentText);
      expect(category.status).toBe('GENERAL_CATEGORY_CONTENT');
      expect(category.exclusion_reason).toContain('Generic educational or tutorial article');
    });

    // Fixture 13: Support diagnostic Q&A
    it('Fixture 13: should classify diagnostic troubleshooting Q&A as SUPPORT_DISCUSSION and exclude from sentiment', () => {
      const commentText = 'เครื่องมีอาการ ไฟกระพริบสีส้ม 3 ครั้ง ตอนเปิดเครื่อง ปริ้นไม่ออก มีใครทราบบ้างครับว่า error code อะไรและแก้ยังไง';
      const category = classifyReviewCategory(commentText);
      expect(category.status).toBe('SUPPORT_DISCUSSION');
      expect(category.exclusion_reason).toContain('Technical support / diagnostic troubleshooting discussion');
    });
  });

  // =========================================================================
  // Section 70: Specific Behavioral Invariants
  // =========================================================================
  describe('Translation Authenticity & Validation', () => {
    it('should reject fake template wrappers like "[POSITIVE] Consumer feedback ..."', () => {
      const rawThai = 'หมึกพิมพ์สวย คมชัดมาก';
      const fakeWrapper = '[POSITIVE] Consumer feedback on HP: "หมึกพิมพ์สวย คมชัดมาก"';
      
      const validation = validateTranslation(rawThai, fakeWrapper);
      expect(validation.translation_status).toBe('FAILED');
      expect(validation.content_en_translation).toBeNull();
    });

    it('should reject English translations containing predominantly Thai script', () => {
      const rawThai = 'ใช้งานดีมาก พิมพ์รูปสวย';
      const badEn = 'The printer works very well พิมพ์รูปสวย';
      
      const validation = validateTranslation(rawThai, badEn);
      expect(validation.translation_status).toBe('FAILED');
      expect(validation.content_en_translation).toBeNull();
    });

    it('should accept valid, authentic English translations', () => {
      const rawThai = 'ใช้งานดีมาก พิมพ์รูปสวย คุ้มค่าเงิน';
      const validEn = 'Very easy to use, prints beautiful photos, great value for money.';
      
      const validation = validateTranslation(rawThai, validEn);
      expect(validation.translation_status).toBe('TRANSLATED');
      expect(validation.content_en_translation).toBe(validEn);
    });
  });

  describe('Buddhist Era (BE) Date Conversion', () => {
    it('should correctly convert Thai Buddhist Era year (2569 -> 2026)', () => {
      const thaiBeDate = '15/08/2569 10:30:00';
      const iso = buddhistEraToIso(thaiBeDate);
      expect(iso).toBeDefined();
      expect(iso?.startsWith('2026-08-15')).toBe(true);
    });

    it('should correctly convert historical Thai Buddhist Era year (2565 -> 2022)', () => {
      const thaiBeDate = '10/04/2565 14:20:00';
      const iso = buddhistEraToIso(thaiBeDate);
      expect(iso).toBeDefined();
      expect(iso?.startsWith('2022-04-10')).toBe(true);
    });
  });

  describe('Metric Cube Protection (isValidConsumerReview)', () => {
    it('should reject OFF_TOPIC records from metric aggregation', () => {
      const offTopicRecord = {
        evidence_id: 'TEST-OFFTOPIC-01',
        channel: 'Consumer Review',
        category_status: 'OFF_TOPIC',
        brand: 'HP',
      } as unknown as RawEvidenceRecord;

      expect(isValidConsumerReview(offTopicRecord)).toBe(false);
    });

    it('should reject SUPPORT_DISCUSSION and GENERAL_CATEGORY_CONTENT records from metric aggregation', () => {
      const supportRecord = {
        evidence_id: 'TEST-SUPPORT-01',
        channel: 'Consumer Review',
        category_status: 'SUPPORT_DISCUSSION',
        brand: 'HP',
      } as unknown as RawEvidenceRecord;

      const tutorialRecord = {
        evidence_id: 'TEST-TUTORIAL-01',
        channel: 'Consumer Review',
        category_status: 'GENERAL_CATEGORY_CONTENT',
        brand: 'Epson',
      } as unknown as RawEvidenceRecord;

      expect(isValidConsumerReview(supportRecord)).toBe(false);
      expect(isValidConsumerReview(tutorialRecord)).toBe(false);
    });

    it('should accept VERIFIED_REVIEW and VERIFIED_COMPARATIVE_REVIEW records', () => {
      const verifiedReview = {
        evidence_id: 'TEST-VERIFIED-01',
        channel: 'Consumer Review',
        category_status: 'VERIFIED_REVIEW',
        brand: 'HP',
      } as unknown as RawEvidenceRecord;

      const verifiedComp = {
        evidence_id: 'TEST-VERIFIED-02',
        channel: 'Consumer Review',
        category_status: 'VERIFIED_COMPARATIVE_REVIEW',
        brand: 'Brother',
      } as unknown as RawEvidenceRecord;

      expect(isValidConsumerReview(verifiedReview)).toBe(true);
      expect(isValidConsumerReview(verifiedComp)).toBe(true);
    });
  });

  describe('RAG Scope Isolation for Consumer Review Invariants', () => {
    it('should isolate non-printer hardware queries (HP Omen, BIOS, SSD) via isOffTopicForRag', () => {
      expect(isOffTopicForRag('What do consumers say about HP Omen BIOS?')).toBe(true);
      expect(isOffTopicForRag('What are user reviews for HP laptop SSD upgrade?')).toBe(true);
      expect(isOffTopicForRag('Tell me about HP printer printhead reliability')).toBe(false);
      expect(isOffTopicForRag('What do customers say about Brother vs Epson ink tank?')).toBe(false);
    });
  });

  // =========================================================================
  // Section 72: Idempotency Verification
  // =========================================================================
  describe('Idempotency & Lineage Verification', () => {
    it('reprocessing the same raw input twice should produce identical deterministic outputs', () => {
      const mockRawRecord: Partial<RawEvidenceRecord> = {
        evidence_id: 'EVID-TEST-REPROCESS-01',
        source_url: 'https://pantip.com/topic/42878421#comment3',
        raw_content_th: 'Brother T430W ใช้งานดีมาก พิมพ์เร็ว ประหยัดหมึก ไม่จุกจิก แนะนำเลยครับ',
        content_en_translation: 'Brother T430W works very well, fast printing, ink-saving, and hassle-free. Highly recommended.',
        published_at: '2026-06-15T08:30:00.000Z',
        captured_at: '2026-08-28T12:00:00.000Z',
        brand: 'HP', // Intentionally wrong initial state to simulate contaminated lake
        product_sku: 'HP-ST-580', // Intentionally wrong initial state
      };

      const pass1 = reprocessReviewRecord(mockRawRecord as RawEvidenceRecord);
      const pass2 = reprocessReviewRecord(pass1);

      // Verify deterministic transformations
      expect(pass1.category_status).toBe('VERIFIED_REVIEW');
      expect(pass1.attributed_brands).toContain('Brother');
      expect(pass1.attributed_brands).not.toContain('HP');
      expect(pass1.product_sku).toBe('BROTHER-IB-T430W');
      expect(pass1.evidence_tags).toContain('POSITIVE');

      // Second pass should be identical to first pass
      expect(pass2.category_status).toBe(pass1.category_status);
      expect(pass2.attributed_brands).toEqual(pass1.attributed_brands);
      expect(pass2.product_sku).toBe(pass1.product_sku);
      expect(pass2.evidence_tags).toEqual(pass1.evidence_tags);
      expect(pass2.content_en_translation).toBe(pass1.content_en_translation);
      expect(pass2.published_at).toBe(pass1.published_at);
      expect(pass2.temporal_window_status).toBe(pass1.temporal_window_status);
    });
  });
});
