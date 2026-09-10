import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';

describe('Friday Presentation Evidentiary Compliance & Regression Suite', () => {
  const lakePath = path.join(process.cwd(), 'data/evidence_lake/scrapling_verified_lake.json');
  const manifestPath = path.join(process.cwd(), 'data/evidence_lake/screenshot_manifest.json');

  it('verifies Epson Thailand YouTube is validated with official channel URL and authentic screenshot', () => {
    const rawLake = fs.readFileSync(lakePath, 'utf-8');
    const lake = JSON.parse(rawLake);
    const epsonYT = lake.filter((r: { brand: string; platform: string; source_url: string; screenshot_url: string }) => r.brand === 'Epson' && r.platform === 'YouTube');
    expect(epsonYT.length).toBe(25);
    for (const r of epsonYT) {
      expect(r.source_url).toBe('https://www.youtube.com/@EpsonThailandOfficial');
      expect(r.screenshot_url).toBe('/screenshots/social/youtube_epson.png');
    }

    const rawManifest = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(rawManifest);
    const epsonManifest = manifest.find((item: { id: string }) => item.id === 'youtube_epson');
    expect(epsonManifest).toBeDefined();
    expect(epsonManifest.url).toBe('https://www.youtube.com/@EpsonThailandOfficial');
  });

  it('verifies Google Ads and TikTok are dropped from Evidence Lake to prevent claiming unevidenced sources', () => {
    const rawLake = fs.readFileSync(lakePath, 'utf-8');
    const lake = JSON.parse(rawLake);
    const gads = lake.filter((r: { platform: string }) => r.platform === 'Google Ads');
    const tiktok = lake.filter((r: { platform: string }) => r.platform === 'TikTok');
    expect(gads.length).toBe(0);
    expect(tiktok.length).toBe(0);
  });

  it('verifies 100% of remaining Evidence Lake records have valid, existing screenshots', () => {
    const rawLake = fs.readFileSync(lakePath, 'utf-8');
    const lake = JSON.parse(rawLake);
    expect(lake.length).toBeGreaterThan(3000);

    for (const record of lake) {
      expect(record.screenshot_url).toBeDefined();
      const relPath = record.screenshot_url.replace(/^\//, '');
      const fullPath = path.join(process.cwd(), 'public', relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
    }
  });

  it('verifies Consumer Sentiment ALL aggregation view computes valid ratings across all 4 brands', () => {
    globalEvidenceStore.loadFromDisk(true);
    const records = globalEvidenceStore.getAll();
    const reviews = records.filter((r) => r.channel === 'Consumer Review');
    expect(reviews.length).toBeGreaterThan(0);

    const brands = ['HP', 'Epson', 'Canon', 'Brother'] as const;
    for (const b of brands) {
      const bReviews = reviews.filter((r) => r.brand === b);
      expect(bReviews.length).toBeGreaterThanOrEqual(100);
      const validRatings = bReviews.filter((r) => r.rating !== null && r.rating !== undefined);
      expect(validRatings.length).toBeGreaterThan(0);
    }
  });
});
