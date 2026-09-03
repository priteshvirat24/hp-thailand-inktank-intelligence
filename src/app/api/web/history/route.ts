/**
 * Web Crawl History Endpoint
 * GET /api/web/history
 */

import { NextRequest, NextResponse } from 'next/server';
import { globalCrawlSessionStore } from '@/services/web/sessionStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  const history = globalCrawlSessionStore.getRecentSessions(limit);
  return NextResponse.json({ sessions: history }, { status: 200 });
}
