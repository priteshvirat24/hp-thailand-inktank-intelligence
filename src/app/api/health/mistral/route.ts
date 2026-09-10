/**
 * Production Mistral AI Live Diagnostic Endpoint
 * GET /api/health/mistral
 * 
 * Verifies live upstream Mistral API connectivity, model health, and probe validation.
 * Strictly avoids exposing secrets, keys, or sensitive environment variables.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/config/env';
import { PRIMARY_MISTRAL_MODEL, FALLBACK_MISTRAL_MODEL } from '@/services/rag/groundingEngine';

export const dynamic = 'force-dynamic';

const PROBE_TOKEN = 'MISTRAL_PRODUCTION_PROBE_92741';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const env = getServerEnv();
    const mistralKey = env.MISTRAL_API_KEY?.trim();

    // Protection check: if DASHBOARD_ACCESS_PASSWORD is set, require either bearer token or query param
    if (env.DASHBOARD_ACCESS_PASSWORD) {
      const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
      const queryKey = req.nextUrl.searchParams.get('auth');
      if (authHeader !== env.DASHBOARD_ACCESS_PASSWORD && queryKey !== env.DASHBOARD_ACCESS_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized diagnostic access' }, { status: 401 });
      }
    }

    if (!mistralKey) {
      return NextResponse.json(
        {
          status: 'UNCONFIGURED',
          configured: false,
          reachable: false,
          message: 'MISTRAL_API_KEY is not configured on this runtime.',
          timestamp: new Date().toISOString(),
          latency_ms: Date.now() - startTime,
        },
        { status: 503 }
      );
    }

    // Dispatch minimal diagnostic probe to primary model
    let modelAttempted = PRIMARY_MISTRAL_MODEL;
    let isFallback = false;

    let res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mistralKey}`,
      },
      body: JSON.stringify({
        model: modelAttempted,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'diagnostic_probe',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                probe_response: { type: 'string' },
              },
              required: ['probe_response'],
              additionalProperties: false,
            },
          },
        },
        max_tokens: 100,
        temperature: 0.0,
        messages: [
          {
            role: 'system',
            content: 'You are a diagnostic health probe. Return JSON { probe_response: string } containing the exact token.',
          },
          { role: 'user', content: `Reply with exactly: ${PROBE_TOKEN}` },
        ],
      }),
    });

    // If primary model fails, attempt fallback model
    if (!res.ok) {
      modelAttempted = FALLBACK_MISTRAL_MODEL;
      isFallback = true;
      res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mistralKey}`,
        },
        body: JSON.stringify({
          model: modelAttempted,
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'diagnostic_probe',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  probe_response: { type: 'string' },
                },
                required: ['probe_response'],
                additionalProperties: false,
              },
            },
          },
          max_tokens: 100,
          temperature: 0.0,
          messages: [
            {
              role: 'system',
              content: 'You are a diagnostic health probe. Return JSON { probe_response: string } containing the exact token.',
            },
            { role: 'user', content: `Reply with exactly: ${PROBE_TOKEN}` },
          ],
        }),
      });
    }

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      return NextResponse.json(
        {
          status: 'UNREACHABLE',
          configured: true,
          reachable: false,
          http_status: res.status,
          model_attempted: modelAttempted,
          is_fallback: isFallback,
          error: `Mistral API returned status ${res.status}: ${res.statusText}`,
          latency_ms: latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const probeMatched = content.includes(PROBE_TOKEN);

    return NextResponse.json(
      {
        status: probeMatched ? 'HEALTHY' : 'DEGRADED',
        configured: true,
        reachable: true,
        probe_sent: PROBE_TOKEN,
        probe_matched: probeMatched,
        model_configured: modelAttempted,
        model_returned: data.model || modelAttempted,
        is_fallback: isFallback,
        http_status: res.status,
        latency_ms: latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: probeMatched ? 200 : 500 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        configured: true,
        reachable: false,
        error: error instanceof Error ? error.message : 'Unknown diagnostic error',
        latency_ms: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
