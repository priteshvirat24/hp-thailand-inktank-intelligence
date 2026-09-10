/**
 * Executive Visual Analytics Unit & Contract Test Suite
 * 
 * Verifies:
 * 1. Component export and contract integrity.
 * 2. Strict non-fabrication invariant: all radar and timeline points are derived
 *    100% deterministically from verified scraped evidence.
 * 3. Correct 5-dimension radar values across HP, Epson, Canon, Brother.
 * 4. Chronological timeline shares summing to ~100% across all observation flights.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { analyticsService } from '@/services/analytics/analyticsService';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { TARGET_BRANDS } from '@/config/brands';
import { ExecutiveVisualAnalytics } from '@/components/sections/ExecutiveVisualAnalytics';

describe('Executive Visual Analytics: Competitor War Room & Shelf Share Trend', () => {
  beforeAll(() => {
    globalEvidenceStore.loadFromDisk(true);
    analyticsService.rebuildAnalyticsFromEvidence();
  });

  describe('Component Contract', () => {
    it('exports ExecutiveVisualAnalytics as a valid React component', () => {
      expect(typeof ExecutiveVisualAnalytics).toBe('function');
    });
  });

  describe('Deterministic Data Engine (analyticsService.getVisualAnalytics)', () => {
    it('produces exactly 5 verified radar dimensions matching the project scope', () => {
      const visualData = analyticsService.getVisualAnalytics('2026-08', 'All');
      expect(visualData.radarDimensions).toHaveLength(5);

      const keys = visualData.radarDimensions.map((d) => d.key);
      expect(keys).toEqual([
        'shelf_share',
        'paid_visibility',
        'social_reach',
        'promo_drive',
        'user_rating',
      ]);
    });

    it('contains non-synthetic raw metrics matching analytical cube for August 2026', () => {
      const visualData = analyticsService.getVisualAnalytics('2026-08', 'All');
      const shelfShare = visualData.radarDimensions.find((d) => d.key === 'shelf_share')!;
      const paidVis = visualData.radarDimensions.find((d) => d.key === 'paid_visibility')!;
      const userRating = visualData.radarDimensions.find((d) => d.key === 'user_rating')!;

      // E-Commerce Shelf Share
      expect(shelfShare.rawValues.HP).toBe(18.9);
      expect(shelfShare.rawValues.Epson).toBe(30.9);
      expect(shelfShare.rawValues.Canon).toBe(27.0);
      expect(shelfShare.rawValues.Brother).toBe(23.2);

      // Paid Visibility
      expect(paidVis.rawValues.HP).toBe(30.8);
      expect(paidVis.rawValues.Epson).toBe(23.1);

      // Customer Rating (HP leads with verified 4.78 / 5)
      expect(userRating.rawValues.HP).toBeCloseTo(4.78, 1);
      expect(userRating.formattedValues.HP).toContain('4.78 / 5');
    });

    it('ensures normalized scores are strictly bounded between 0 and 100', () => {
      const visualData = analyticsService.getVisualAnalytics('2026-08', 'All');
      for (const dim of visualData.radarDimensions) {
        for (const brand of TARGET_BRANDS) {
          const score = dim.scores[brand];
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        }
      }
    });

    it('provides multi-channel chronological timeline flights with valid shares', () => {
      const visualData = analyticsService.getVisualAnalytics('2026-08', 'All');
      expect(visualData.timeline.ecommerce.length).toBeGreaterThan(0);

      // Verify each flight has shares summing to ~100%
      for (const pt of visualData.timeline.ecommerce) {
        expect(pt.displayDate).toBeDefined();
        expect(pt.totalObservations).toBeGreaterThan(0);
        const sum = pt.shares.HP + pt.shares.Epson + pt.shares.Canon + pt.shares.Brother;
        expect(sum).toBeGreaterThanOrEqual(99.0);
        expect(sum).toBeLessThanOrEqual(101.0);
      }
    });

    it('identifies the latest benchmark accurately for focus brand', () => {
      const visualData = analyticsService.getVisualAnalytics('2026-08', 'HP');
      expect(visualData.latestBenchmark.brand).toBe('HP');
      expect(visualData.latestBenchmark.sharePct).toBeGreaterThan(0);
      expect(typeof visualData.latestBenchmark.periodLabel).toBe('string');
    });

    it('attaches visual_analytics payload to ExecutiveOverviewData automatically', () => {
      const summary = analyticsService.getExecutiveOverview('2026-08', 'All');
      expect(summary.visual_analytics).toBeDefined();
      expect(summary.visual_analytics?.radarDimensions).toHaveLength(5);
      expect(summary.visual_analytics?.timeline.ecommerce.length).toBeGreaterThan(0);
    });
  });
});
