/**
 * Secure Server-Side Ingestion API Endpoint
 * POST /api/ingestion/run
 * 
 * Supports targeted crawl execution by:
 * - Single Target ID (`target_id`)
 * - Brand Targets (`brand: 'HP' | 'Epson' | 'Canon' | 'Brother'`)
 * - Channel Targets (`channel: 'Paid Media' | 'E-commerce' | 'Social'`)
 * - Source ID (`source_id`)
 * - Full Targeted Crawl (`all: true`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateRequestAuthorization } from '@/lib/security';
import { getSeedById, getSeedsByBrand, getSeedsBySource, CRAWL_SEEDS, CrawlTarget } from '@/config/seeds';
import { ChannelType } from '@/types/sources';
import { TargetBrand } from '@/types/brands';
import { ingestionPipeline } from '@/services/scrapers/ingestionPipeline';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Authentication check
  const auth = validateRequestAuthorization(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Invalid or missing authentication credentials.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const targetId: string | undefined = body.target_id || body.targetId;
    const brand: TargetBrand | undefined = body.brand;
    const channel: ChannelType | undefined = body.channel;
    const sourceId: string | undefined = body.source_id;
    const runAll: boolean = Boolean(body.all);
    const customPayloads: Record<string, unknown[]> | undefined = body.custom_payloads || body.customPayloads;

    let targetsToRun: readonly CrawlTarget[] = [];

    if (targetId) {
      const singleTarget = getSeedById(targetId);
      if (!singleTarget) {
        return NextResponse.json(
          {
            error: `Target ID "${targetId}" not found in authoritative seed registry.`,
            available_targets: CRAWL_SEEDS.map((s) => ({ target_id: s.target_id, brand: s.brand, platform: s.platform })),
          },
          { status: 404 }
        );
      }
      targetsToRun = [singleTarget];
    } else if (brand) {
      targetsToRun = getSeedsByBrand(brand);
      if (targetsToRun.length === 0) {
        return NextResponse.json({ error: `No active crawl targets for brand "${brand}".` }, { status: 404 });
      }
    } else if (sourceId) {
      targetsToRun = getSeedsBySource(sourceId);
      if (targetsToRun.length === 0) {
        return NextResponse.json({ error: `No active crawl targets for source "${sourceId}".` }, { status: 404 });
      }
    } else if (channel) {
      targetsToRun = CRAWL_SEEDS.filter((s) => s.channel === channel);
      if (targetsToRun.length === 0) {
        return NextResponse.json({ error: `No active crawl targets for channel "${channel}".` }, { status: 404 });
      }
    } else if (runAll) {
      targetsToRun = CRAWL_SEEDS.filter((s) => s.status === 'ACTIVE_SEED');
    } else {
      return NextResponse.json(
        {
          error: 'Missing required crawl filter. Provide "target_id", "brand", "channel", "source_id", or "all: true".',
          available_targets: CRAWL_SEEDS.map((s) => ({ target_id: s.target_id, brand: s.brand, platform: s.platform, channel: s.channel })),
        },
        { status: 400 }
      );
    }

    // Execute batch ingestion through pipeline
    const runSummary = await ingestionPipeline.runBatch(targetsToRun, {
      customPayloads,
    });

    return NextResponse.json(runSummary, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal ingestion execution failure',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
