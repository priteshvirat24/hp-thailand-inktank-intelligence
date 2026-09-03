/**
 * Evidence Ingestion & Lake Management API Endpoint
 * POST /api/ingestion/evidence - Ingest new evidence
 * GET  /api/ingestion/evidence - Count evidence by brand
 * DELETE /api/ingestion/evidence - Purge memory and reload ONLY pure verified lake file from disk
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateEvidenceRecord } from '@/services/evidence/evidenceValidator';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { analyticsService } from '@/services/analytics/analyticsService';
import { RawEvidenceRecord } from '@/types/evidence';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawRecords: unknown[] = Array.isArray(body.records) ? body.records : Array.isArray(body) ? body : [];

    if (rawRecords.length === 0) {
      return NextResponse.json(
        { error: 'No evidence records provided. Body must contain an array of records under "records".' },
        { status: 400 }
      );
    }

    const validRecords: RawEvidenceRecord[] = [];
    const validationErrors: Array<{ index: number; errors: string[] }> = [];

    rawRecords.forEach((item, index) => {
      const validation = validateEvidenceRecord(item);
      if (validation.valid && validation.data) {
        validRecords.push(validation.data);
      } else {
        validationErrors.push({
          index,
          errors: validation.errors ?? ['Invalid record format'],
        });
      }
    });

    // Ingest valid records
    const insertSummary = globalEvidenceStore.insertBatch(validRecords);

    // Synchronize the Analytical Cube with the new evidence
    analyticsService.rebuildAnalyticsFromEvidence();

    return NextResponse.json(
      {
        success: true,
        received: rawRecords.length,
        inserted: insertSummary.insertedCount,
        updated: insertSummary.updatedCount,
        rejected: validationErrors.length,
        total_lake_observations: globalEvidenceStore.getCount(),
        errors: validationErrors.slice(0, 10),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to process evidence ingestion',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const count = globalEvidenceStore.getCount();
  return NextResponse.json(
    {
      total_observations: count,
      brands: {
        HP: globalEvidenceStore.getByBrand('HP').length,
        Epson: globalEvidenceStore.getByBrand('Epson').length,
        Canon: globalEvidenceStore.getByBrand('Canon').length,
        Brother: globalEvidenceStore.getByBrand('Brother').length,
      },
    },
    { status: 200 }
  );
}

export async function DELETE() {
  // Purge any residual memory store completely
  globalEvidenceStore.clear();
  
  // Reload exclusively genuine verified file from disk with force=true
  globalEvidenceStore.loadFromDisk(true);
  
  // Rebuild analytical cube strictly from pure real records
  analyticsService.rebuildAnalyticsFromEvidence();

  return NextResponse.json(
    {
      success: true,
      message: 'Purged all in-memory records. Reloaded exclusively verified real records from disk.',
      total_lake_observations: globalEvidenceStore.getCount(),
      brands: {
        HP: globalEvidenceStore.getByBrand('HP').length,
        Epson: globalEvidenceStore.getByBrand('Epson').length,
        Canon: globalEvidenceStore.getByBrand('Canon').length,
        Brother: globalEvidenceStore.getByBrand('Brother').length,
      },
    },
    { status: 200 }
  );
}
