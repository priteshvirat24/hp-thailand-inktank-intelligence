/**
 * GET /api/screenshots
 * Returns the Scrapling multi-channel screenshot manifest.
 * Reads data/evidence_lake/screenshot_manifest.json from disk.
 */
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export interface ScreenshotEntry {
  id: string;
  brand: string;
  channel: string;
  platform: string;
  screenshot_url: string;
  source_url: string;
  status: 'captured' | 'already_captured' | 'failed';
  file_size_kb?: number;
  captured_at: string;
  error?: string;
}

const MANIFEST_PATH = path.join(process.cwd(), 'data/evidence_lake/screenshot_manifest.json');

export async function GET() {
  try {
    if (!fs.existsSync(MANIFEST_PATH)) {
      return NextResponse.json({ screenshots: [], total: 0, manifest_exists: false });
    }
    const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    const all: ScreenshotEntry[] = JSON.parse(raw);
    const captured = all.filter(s => s.status !== 'failed');
    return NextResponse.json({
      screenshots: captured,
      total: captured.length,
      manifest_exists: true,
      by_channel: captured.reduce<Record<string, number>>((acc, s) => {
        acc[s.channel] = (acc[s.channel] ?? 0) + 1;
        return acc;
      }, {}),
      by_brand: captured.reduce<Record<string, number>>((acc, s) => {
        acc[s.brand] = (acc[s.brand] ?? 0) + 1;
        return acc;
      }, {}),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
