/**
 * RAG Strategic Intelligence API Endpoint
 * POST /api/rag/query
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ragService } from '@/services/rag/ragService';
import { PlatformType } from '@/types/sources';

export const dynamic = 'force-dynamic';

const ragQuerySchema = z.object({
  query: z.string().min(1, 'Query string is required'),
  brand: z.preprocess(
    (val) => (val === 'ALL' || val === '' ? 'All' : val),
    z.enum(['HP', 'Epson', 'Canon', 'Brother', 'All']).nullish()
  ),
  month: z.preprocess(
    (val) => (val === 'All' ? 'ALL' : val === '' ? undefined : val),
    z.enum(['2026-06', '2026-07', '2026-08', 'ALL']).nullish()
  ),
  channel: z.preprocess(
    (val) => (val === 'ALL' || val === '' ? 'All' : val),
    z.enum(['Paid Media', 'Social', 'E-commerce', 'Consumer Review', 'All']).nullish()
  ),
  platform: z.string().nullish(),
  sku_id: z.string().nullish(),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = ragQuerySchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid RAG query payload',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { query, brand, month, channel, platform, sku_id } = parseResult.data;

    const answer = await ragService.query({
      query,
      brandFilter: brand || 'All',
      monthFilter: month || 'ALL',
      channelFilter: channel || 'All',
      platformFilter: (platform as PlatformType) || undefined,
      skuFilter: sku_id || undefined,
    });

    return NextResponse.json(answer, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to process RAG query',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
