/**
 * Authoritative Scraper Ingestion Pipeline
 * 
 * Orchestrates the full lifecycle:
 * Discovery → Extraction → Classification → SKU Normalization → Deterministic ID → Zod Validation → Idempotent Persistence → Analytical Cube Sync
 */

import { ScraperProvider } from './providers/types';
import { apifyProvider } from './providers/apify';
import { brightDataProvider } from './providers/brightdata';
import { ScraperAdapter, IngestionReport, IngestionError, RawObservation } from './types';
import { CrawlTarget } from '@/config/seeds';
import { scraperRegistry } from './scraperRegistry';
import { classifyPrinterItem } from '@/services/classification/classifier';
import { resolveSku } from '@/services/catalog/skuNormalizer';
import { generateDeterministicEvidenceId } from '@/lib/evidenceId';
import { convertBuddhistYearToGregorian } from '@/lib/dates';
import { validateEvidenceRecord } from '@/services/evidence/evidenceValidator';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { analyticsService } from '@/services/analytics/analyticsService';
import { globalRunHistory, IngestionRunSummary, IngestionRunStatus } from './runHistory';
import { RawEvidenceRecord } from '@/types/evidence';

export class IngestionPipeline {
  /**
   * Ingests observations for a specific CrawlTarget through its adapter and provider.
   */
  public async runIngestion(
    target: CrawlTarget,
    provider: ScraperProvider,
    adapter: ScraperAdapter,
    customPayload?: unknown[]
  ): Promise<IngestionReport> {
    const startedAt = new Date().toISOString();
    const crawlRunId = `RUN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const errors: IngestionError[] = [];
    const persistedRecords: RawEvidenceRecord[] = [];

    let discoveredCount = 0;
    let fetchedCount = 0;
    let extractedCount = 0;
    let acceptedCount = 0;
    let rejectedCount = 0;
    let unresolvedSkuCount = 0;
    let ambiguousSkuCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;

    try {
      // 1. Discovery
      const discoveredTargets = await adapter.discover(target);
      discoveredCount = discoveredTargets.length;

      // 2. Fetch / Provider Execution
      let rawData: unknown[] = [];
      if (customPayload) {
        // Direct fixture or batch payload passed
        rawData = customPayload;
        fetchedCount = rawData.length;
      } else {
        const response = await provider.run({ target });
        if (!response.success) {
          errors.push({
            code: 'PROVIDER_FAILED',
            message: response.errorMessage || `Provider ${provider.name} failed execution`,
            target_id: target.target_id,
          });
          failedCount++;
          return this.buildReport({
            crawlRunId,
            target,
            providerName: provider.name,
            discoveredCount,
            fetchedCount: 0,
            extractedCount: 0,
            acceptedCount: 0,
            rejectedCount: 0,
            unresolvedSkuCount: 0,
            ambiguousSkuCount: 0,
            duplicateCount: 0,
            failedCount,
            persistedRecords: [],
            errors,
            startedAt,
          });
        }
        rawData = response.data;
        fetchedCount = rawData.length;
      }

      // 3. Extraction
      const rawObservations: RawObservation[] = await adapter.extract(rawData, target, crawlRunId);
      extractedCount = rawObservations.length;

      // 4. Processing each observation
      for (const obs of rawObservations) {
        try {
          // A. Date parsing & Thai Buddhist Era conversion
          const normalizedPublishedAt = obs.published_at
            ? convertBuddhistYearToGregorian(obs.published_at)
            : obs.captured_at.split('T')[0];

          // B. Category Classification (6-Gate)
          const classification = classifyPrinterItem(obs.raw_title, obs.price_current_thb || null);

          if (classification.decision === 'REJECT') {
            rejectedCount++;
            continue; // Excluded (cartridge, laser, standalone consumable bottle, non-target brand)
          }

          // C. SKU Normalization
          const skuResolution = resolveSku(obs.raw_title, obs.brand);
          let canonicalSkuName: string | null = null;

          if (skuResolution.status === 'MATCHED') {
            canonicalSkuName = skuResolution.canonical_model_name;
          } else if (skuResolution.status === 'UNRESOLVED') {
            unresolvedSkuCount++;
          } else if (skuResolution.status === 'AMBIGUOUS') {
            ambiguousSkuCount++;
          }

          // D. Deterministic Evidence ID Generation
          const evidenceId = generateDeterministicEvidenceId({
            platform: obs.platform,
            sourceUrl: obs.source_url,
            publishedAt: normalizedPublishedAt,
            platformEntityId: obs.platform_entity_id,
          });

          // E. Construct Full Evidence Record
          const record: RawEvidenceRecord = {
            evidence_id: evidenceId,
            published_at: normalizedPublishedAt,
            captured_at: obs.captured_at,
            brand: obs.brand,
            channel: obs.channel,
            platform: obs.platform,
            activity_type: obs.activity_type,
            product_sku: canonicalSkuName,
            raw_title: obs.raw_title,
            raw_content_th: obs.raw_content_th,
            content_en_translation: obs.content_en_translation || obs.raw_title,
            price_current_thb: typeof obs.price_current_thb === 'number' ? obs.price_current_thb : null,
            price_original_thb: typeof obs.price_original_thb === 'number' ? obs.price_original_thb : null,
            discount_pct: typeof obs.discount_pct === 'number' ? obs.discount_pct : null,
            seller_name: obs.seller_name || null,
            is_official_store: Boolean(obs.is_official_store),
            stock_status: obs.stock_status || 'In Stock',
            displayed_sales: obs.displayed_sales || null,
            rating: typeof obs.rating === 'number' ? obs.rating : null,
            review_count: typeof obs.review_count === 'number' ? obs.review_count : null,
            creative_format: obs.creative_format || null,
            creative_asset_url: obs.creative_asset_url || null,
            source_url: obs.source_url,
            evidence_tags: obs.evidence_tags || [obs.channel, obs.platform],
            extraction_method:
              provider.name === 'apify'
                ? 'Apify Actor'
                : provider.name === 'brightdata'
                ? 'Bright Data Scraping Browser'
                : 'Direct HTTP',
            confidence_score: classification.confidence,
          };

          // F. Strict Schema Validation (Zod)
          const validation = validateEvidenceRecord(record);
          if (!validation.valid) {
            failedCount++;
            errors.push({
              code: 'VALIDATION_FAILED',
              message: `Validation failed: ${validation.errors?.join(', ')}`,
              target_id: target.target_id,
              raw_input: obs.raw_title,
            });
            continue;
          }

          // G. Idempotent Persistence
          const insertResult = globalEvidenceStore.insert(record);
          if (insertResult.inserted) {
            acceptedCount++;
          } else if (insertResult.updated) {
            duplicateCount++;
          }
          persistedRecords.push(record);
        } catch (itemError) {
          failedCount++;
          errors.push({
            code: 'PARSE_FAILED',
            message: itemError instanceof Error ? itemError.message : 'Unknown parsing error',
            target_id: target.target_id,
            raw_input: obs.raw_title,
          });
        }
      }
    } catch (pipelineError) {
      failedCount++;
      errors.push({
        code: 'UNKNOWN',
        message: pipelineError instanceof Error ? pipelineError.message : 'Unhandled pipeline exception',
        target_id: target.target_id,
      });
    }

    return this.buildReport({
      crawlRunId,
      target,
      providerName: provider.name,
      discoveredCount,
      fetchedCount,
      extractedCount,
      acceptedCount,
      rejectedCount,
      unresolvedSkuCount,
      ambiguousSkuCount,
      duplicateCount,
      failedCount,
      persistedRecords,
      errors,
      startedAt,
    });
  }

  /**
   * Executes a batch crawl across multiple targets with automatic provider mapping,
   * rate-limiting, error isolation, run history tracking, and analytical cube rebuild.
   */
  public async runBatch(
    targets: readonly CrawlTarget[],
    options?: { customPayloads?: Record<string, unknown[]> }
  ): Promise<IngestionRunSummary> {
    const startedAt = new Date().toISOString();
    const runId = `BATCH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const sourceReports: IngestionReport[] = [];

    let totalExtracted = 0;
    let totalAccepted = 0;
    let totalRejected = 0;
    let totalUnresolved = 0;
    let totalAmbiguous = 0;
    let totalDuplicates = 0;
    let totalErrors = 0;
    let targetsSuccessful = 0;

    for (const target of targets) {
      const adapter = scraperRegistry.getAdapter(target.source_id);
      if (!adapter) continue;

      // Select provider based on channel / platform architecture
      const provider: ScraperProvider =
        target.channel === 'E-commerce' && target.platform !== 'TikTok Shop'
          ? brightDataProvider
          : apifyProvider;

      const customPayload = options?.customPayloads?.[target.target_id];
      const report = await this.runIngestion(target, provider, adapter, customPayload);
      sourceReports.push(report);

      totalExtracted += report.extracted;
      totalAccepted += report.accepted;
      totalRejected += report.rejected;
      totalUnresolved += report.unresolved_sku;
      totalAmbiguous += report.ambiguous_sku;
      totalDuplicates += report.duplicate;
      totalErrors += report.errors.length;

      if (report.errors.length === 0 && report.failed === 0) {
        targetsSuccessful++;
      }
    }

    // Rebuild Analytical Cube from updated evidence lake
    analyticsService.rebuildAnalyticsFromEvidence();

    // Determine overall status
    let status: IngestionRunStatus = 'SUCCESS';
    if (targets.length === 0) {
      status = 'SUCCESS';
    } else if (targetsSuccessful === 0 && totalErrors > 0) {
      status = 'FAILED';
    } else if (targetsSuccessful < targets.length || totalErrors > 0) {
      status = 'PARTIAL_SUCCESS';
    }

    const summary: IngestionRunSummary = {
      run_id: runId,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      status,
      targets_attempted: targets.length,
      targets_successful: targetsSuccessful,
      observations_extracted: totalExtracted,
      records_accepted: totalAccepted,
      records_rejected: totalRejected,
      unresolved_sku: totalUnresolved,
      ambiguous_sku: totalAmbiguous,
      duplicates: totalDuplicates,
      errors_count: totalErrors,
      source_reports: sourceReports,
    };

    globalRunHistory.recordRun(summary);
    return summary;
  }

  private buildReport(params: {
    crawlRunId: string;
    target: CrawlTarget;
    providerName: ScraperProvider['name'];
    discoveredCount: number;
    fetchedCount: number;
    extractedCount: number;
    acceptedCount: number;
    rejectedCount: number;
    unresolvedSkuCount: number;
    ambiguousSkuCount: number;
    duplicateCount: number;
    failedCount: number;
    persistedRecords: RawEvidenceRecord[];
    errors: IngestionError[];
    startedAt: string;
  }): IngestionReport {
    return {
      crawl_run_id: params.crawlRunId,
      source_id: params.target.source_id,
      provider: params.providerName,
      target_count: params.discoveredCount,
      discovered: params.discoveredCount,
      fetched: params.fetchedCount,
      extracted: params.extractedCount,
      accepted: params.acceptedCount,
      rejected: params.rejectedCount,
      unresolved_sku: params.unresolvedSkuCount,
      ambiguous_sku: params.ambiguousSkuCount,
      duplicate: params.duplicateCount,
      failed: params.failedCount,
      persisted_records: params.persistedRecords,
      errors: params.errors,
      started_at: params.startedAt,
      completed_at: new Date().toISOString(),
    };
  }
}

export const ingestionPipeline = new IngestionPipeline();
