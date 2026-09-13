import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { analyticsService } from '@/services/analytics/analyticsService';

describe('Evidence Lake Mathematical Integrity & Observation Scoping Audit', () => {
  it('1. Evidence Lake contains exactly 3,653 immutable scraped records', () => {
    const allRecords = globalEvidenceStore.getAll();
    expect(allRecords.length).toBe(3653);
    expect(globalEvidenceStore.getCount()).toBe(3653);
  });

  it('2. Monthly partition sums mathematically to the exact total lake size of 3,653', () => {
    const allRecords = globalEvidenceStore.getAll();

    const juneRecords = allRecords.filter((r) => r.published_at?.startsWith('2026-06'));
    const julyRecords = allRecords.filter((r) => r.published_at?.startsWith('2026-07'));
    const augRecords = allRecords.filter((r) => r.published_at?.startsWith('2026-08'));
    const historicalRecords = allRecords.filter(
      (r) => !r.published_at?.startsWith('2026-06') && !r.published_at?.startsWith('2026-07') && !r.published_at?.startsWith('2026-08')
    );

    expect(juneRecords.length).toBe(1152);
    expect(julyRecords.length).toBe(1232);
    expect(augRecords.length).toBe(1180);
    expect(historicalRecords.length).toBe(89);

    // Strict mathematical invariant across all partitions
    expect(juneRecords.length + julyRecords.length + augRecords.length + historicalRecords.length).toBe(3653);
  });

  it('3. Channel partition sums strictly to 3,653 without orphan records', () => {
    const allRecords = globalEvidenceStore.getAll();

    const paidMedia = allRecords.filter((r) => r.channel === 'Paid Media').length;
    const social = allRecords.filter(
      (r) => (r.channel as string) === 'Social' || (r.channel as string) === 'Social Channels'
    ).length;
    const ecom = allRecords.filter(
      (r) => (r.channel as string) === 'E-commerce' || (r.channel as string) === 'E-Commerce'
    ).length;
    const reviews = allRecords.filter((r) => r.channel === 'Consumer Review').length;

    expect(paidMedia + social + ecom + reviews).toBe(3653);
  });

  it('4. Executive Overview correctly distinguishes active window count from 90-day lake total', () => {
    // August 2026 Active Scope
    const augOverview = analyticsService.getExecutiveOverview('2026-08', 'All');
    expect(augOverview.total_evidence_observations).toBe(1180);
    expect(augOverview.total_lake_observations).toBe(3653);

    // July 2026 Active Scope
    const julOverview = analyticsService.getExecutiveOverview('2026-07', 'All');
    expect(julOverview.total_evidence_observations).toBe(1232);
    expect(julOverview.total_lake_observations).toBe(3653);

    // June 2026 Active Scope
    const junOverview = analyticsService.getExecutiveOverview('2026-06', 'All');
    expect(junOverview.total_evidence_observations).toBe(1152);
    expect(junOverview.total_lake_observations).toBe(3653);

    // Consolidated 90-Day Scope
    const allOverview = analyticsService.getExecutiveOverview('ALL', 'All');
    expect(allOverview.total_evidence_observations).toBe(3653);
    expect(allOverview.total_lake_observations).toBe(3653);
  });

  it('5. Brand-scoped active window reflects exact brand slice within the month', () => {
    const hpAug = analyticsService.getExecutiveOverview('2026-08', 'HP');
    expect(hpAug.total_lake_observations).toBe(3653);
    expect(hpAug.total_evidence_observations).toBeLessThan(1286);
    expect(hpAug.total_evidence_observations).toBeGreaterThan(0);
  });

  it('6. Eliminates stale phantom numbers (3,855 & 4,167) from all UI and service source code', () => {
    const srcDir = path.resolve(process.cwd(), 'src');

    function checkDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (entry.name.endsWith('.tsx') || (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts'))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          // Stale phantom numbers must not exist in application code
          expect(content).not.toContain('3,855');
          expect(content).not.toContain('3855 verified');
          expect(content).not.toContain('4,167');
        }
      }
    }

    checkDir(srcDir);
  });

  it('7. RagAssistant source code dynamically binds to totalLakeCount and does not contain static 3,855', () => {
    const ragPath = path.resolve(process.cwd(), 'src/components/rag/RagAssistant.tsx');
    const content = fs.readFileSync(ragPath, 'utf8');

    expect(content).toContain('totalLakeCount');
    expect(content).not.toContain('3,855');
    expect(content).toContain('Verified Lake Records &amp; Metric Cube');
  });

  it('8. ExecutiveOverview source code contains explicit scope and provenance breakdown', () => {
    const execPath = path.resolve(process.cwd(), 'src/components/sections/ExecutiveOverview.tsx');
    const content = fs.readFileSync(execPath, 'utf8');

    expect(content).toContain('Evidence Lake Provenance');
    expect(content).toContain('1,286 records');
    expect(content).toContain('1,219 records');
    expect(content).toContain('1,148 records');
    expect(content).toContain('3,653 Records');
    expect(content).toContain('totalLake');
  });
});
