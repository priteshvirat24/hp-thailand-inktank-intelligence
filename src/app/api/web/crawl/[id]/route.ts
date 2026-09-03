/**
 * Web Crawl Session Status & Audit Endpoint
 * GET /api/web/crawl/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { globalCrawlSessionStore } from '@/services/web/sessionStore';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = globalCrawlSessionStore.getSession(id);

  if (!session) {
    return NextResponse.json(
      { error: `Crawl session '${id}' not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(session, { status: 200 });
}
