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
  brandFilter: z.preprocess(
    (val) => (val === 'ALL' || val === '' ? 'All' : val),
    z.enum(['HP', 'Epson', 'Canon', 'Brother', 'All']).nullish()
  ),
  month: z.preprocess(
    (val) => (val === 'All' ? 'ALL' : val === '' ? undefined : val),
    z.string().regex(/^(\d{4}-\d{2}|ALL)$/, 'Month must be in YYYY-MM or ALL format').nullish()
  ),
  monthFilter: z.preprocess(
    (val) => (val === 'All' ? 'ALL' : val === '' ? undefined : val),
    z.string().regex(/^(\d{4}-\d{2}|ALL)$/, 'Month must be in YYYY-MM or ALL format').nullish()
  ),
  channel: z.preprocess(
    (val) => (val === 'ALL' || val === '' ? 'All' : val),
    z.enum(['Paid Media', 'Social', 'E-commerce', 'Consumer Review', 'All']).nullish()
  ),
  channelFilter: z.preprocess(
    (val) => (val === 'ALL' || val === '' ? 'All' : val),
    z.enum(['Paid Media', 'Social', 'E-commerce', 'Consumer Review', 'All']).nullish()
  ),
  platform: z.string().nullish(),
  platformFilter: z.string().nullish(),
  sku_id: z.string().nullish(),
  skuFilter: z.string().nullish(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1, 'Message content cannot be empty').max(3000, 'Message content exceeds maximum length'),
      })
    )
    .max(10, 'History is bounded to a maximum of 10 conversational turns')
    .nullish(),
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

    const {
      query,
      brand,
      brandFilter,
      month,
      monthFilter,
      channel,
      channelFilter,
      platform,
      platformFilter,
      sku_id,
      skuFilter,
      history,
    } = parseResult.data;

    const requestId = `rag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const startTime = Date.now();

    const answer = await ragService.query({
      query,
      brandFilter: brand || brandFilter || 'All',
      monthFilter: month || monthFilter || 'ALL',
      channelFilter: channel || channelFilter || 'All',
      platformFilter: ((platform || platformFilter) as PlatformType) || undefined,
      skuFilter: sku_id || skuFilter || undefined,
      history: history || undefined,
    });

    // Requirement 19: Internal observability logging (zero secrets or sensitive queries)
    console.log(
      JSON.stringify({
        event: 'RAG_QUERY_OBSERVABILITY',
        request_id: requestId,
        provider: answer.generation.provider,
        model: answer.generation.model,
        generation_status: answer.generation.status,
        latency_ms: answer.generation.latency_ms ?? (Date.now() - startTime),
        retrieval_evidence_count: answer.supporting_evidence.length,
        history_message_count: history ? history.length : 0,
        fallback_used: answer.generation.fallback_used ?? false,
        error_code: answer.generation.error_code ?? null,
      })
    );

    return NextResponse.json(answer, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to process RAG query',
        message: error instanceof Error ? error.message : 'Unknown internal error',
        generation: {
          provider: 'system',
          model: null,
          status: 'generation_failed',
          error_code: 'SERVER_EXCEPTION',
        },
      },
      { status: 500 }
    );
  }
}
