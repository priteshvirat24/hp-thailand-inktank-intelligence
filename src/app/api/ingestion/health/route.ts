/**
 * Provider Health & Ingestion Status API Endpoint
 * GET /api/ingestion/health
 * 
 * Safely inspects provider configuration status (Apify, Bright Data)
 * and evidence lake metrics without exposing credentials.
 */

import { NextResponse } from 'next/server';
import { apifyProvider } from '@/services/scrapers/providers/apify';
import { brightDataProvider } from '@/services/scrapers/providers/brightdata';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { globalRunHistory } from '@/services/scrapers/runHistory';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [apifyHealth, brightDataHealth] = await Promise.all([
      apifyProvider.healthCheck(),
      brightDataProvider.healthCheck(),
    ]);

    const latestRun = globalRunHistory.getLatestRun();

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        providers: {
          apify: {
            status: apifyHealth.status,
            configured: apifyHealth.configured,
            message: apifyHealth.message,
          },
          brightdata: {
            status: brightDataHealth.status,
            configured: brightDataHealth.configured,
            message: brightDataHealth.message,
          },
        },
        evidence_lake: {
          total_records: globalEvidenceStore.getCount(),
        },
        last_ingestion: latestRun
          ? {
              run_id: latestRun.run_id,
              status: latestRun.status,
              completed_at: latestRun.completed_at,
              targets_attempted: latestRun.targets_attempted,
              targets_successful: latestRun.targets_successful,
              records_accepted: latestRun.records_accepted,
              errors_count: latestRun.errors_count,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve ingestion provider health status',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
