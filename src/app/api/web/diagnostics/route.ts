/**
 * Domain Diagnostics & Crawlability API Endpoint
 * GET /api/web/diagnostics?url=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { runDomainDiagnostics } from '@/services/web/diagnostics/acquisitionDiagnostics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json(
      { error: 'Missing required query parameter: url' },
      { status: 400 }
    );
  }

  try {
    const diagnostics = await runDomainDiagnostics(targetUrl);
    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to run domain diagnostics',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
