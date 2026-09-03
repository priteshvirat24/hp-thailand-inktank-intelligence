/**
 * Ingestion Run History API Endpoint
 * GET /api/ingestion/history
 */

import { NextRequest, NextResponse } from 'next/server';
import { globalRunHistory } from '@/services/scrapers/runHistory';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const history = globalRunHistory.getRecentRuns(limit);
    return NextResponse.json({ count: history.length, history }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve ingestion run history',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
