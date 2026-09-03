import { NextResponse } from 'next/server';
import { getServerEnv } from '@/config/env';
import { PROJECT_METADATA } from '@/config/constants';
import { DATE_CONFIG } from '@/config/dates';
import { TARGET_BRANDS, CANONICAL_SKUS } from '@/config/brands';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const env = getServerEnv();

    const healthReport = {
      status: 'HEALTHY',
      phase: 'Phase 1 (Authoritative Domain Model Active)',
      timestamp: new Date().toISOString(),
      project: PROJECT_METADATA.name,
      geography: PROJECT_METADATA.geography,
      currency: PROJECT_METADATA.currency,
      analysis_window: {
        start: DATE_CONFIG.OBSERVATION_START,
        end: DATE_CONFIG.OBSERVATION_END,
        months: DATE_CONFIG.ANALYTICAL_MONTHS,
      },
      target_brands: TARGET_BRANDS,
      canonical_sku_count: CANONICAL_SKUS.length,
      environment: {
        node_env: env.NODE_ENV,
        apify_configured: Boolean(env.APIFY_API_KEY),
        brightdata_configured: Boolean(env.BRIGHTDATA_API_KEY),
        openai_configured: Boolean(env.OPENAI_API_KEY),
        gemini_configured: Boolean(env.GEMINI_API_KEY),
        mistral_configured: Boolean(env.MISTRAL_API_KEY),
        auth_protection_configured: Boolean(env.DASHBOARD_ACCESS_PASSWORD),
      },
      services: {
        classification_engine: 'READY',
        evidence_store: 'INITIALIZED (0 Records)',
        analytics_engine: 'STANDBY (Awaiting Ingestion)',
        rag_engine: 'STANDBY (Awaiting Vector Ingestion)',
      },
    };

    return NextResponse.json(healthReport, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        message: error instanceof Error ? error.message : 'Unknown internal error',
      },
      { status: 500 }
    );
  }
}
