/**
 * Web Crawl Execution Endpoint
 * POST /api/web/crawl
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { globalCrawlSessionStore } from '@/services/web/sessionStore';
import { TargetBrand } from '@/types/brands';
import { AcquisitionStrategy } from '@/services/web/acquisition/types';

export const dynamic = 'force-dynamic';

const crawlRequestSchema = z.object({
  seedUrls: z.array(z.string()).optional(),
  query: z.string().optional(),
  brand: z.enum(['HP', 'Epson', 'Canon', 'Brother']).optional(),
  skuId: z.string().optional(),
  domains: z.array(z.string()).optional(),
  maxDepth: z.number().min(1).max(5).optional(),
  maxPages: z.number().min(1).max(100).optional(),
  strategy: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = crawlRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid web crawl parameters', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { seedUrls, query, brand, skuId, domains, maxDepth, maxPages, strategy } = parseResult.data;

    const session = await globalCrawlSessionStore.runCrawl({
      seedUrls,
      query,
      brand: brand as TargetBrand | undefined,
      skuId,
      domains,
      maxDepth,
      maxPages,
      strategy: strategy as AcquisitionStrategy | 'AUTO' | undefined,
    });

    return NextResponse.json(
      {
        crawlId: session.crawl_id,
        status: session.status,
        summary: {
          started_at: session.started_at,
          completed_at: session.completed_at,
          discovered_urls: session.discovered_urls.length,
          acquired_urls: session.acquired_urls.length,
          successful_pages: session.successful_pages,
          blocked_pages: session.blocked_pages,
          evidence_created: session.evidence_created,
          evidence_rejected: session.evidence_rejected,
          unresolved_skus: session.unresolved_skus,
        },
        session,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to execute web crawl job',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
