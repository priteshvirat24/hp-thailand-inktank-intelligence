/**
 * Generic Web Evidence Adapter
 * 
 * Transforms arbitrary WebAcquisitionResult payloads into validated RawEvidenceRecords.
 * Pipes each observation through:
 * 1. 6-Gate Contamination Classifier (classifyPrinterItem)
 * 2. Deterministic SKU Resolver (resolveSku)
 * 3. Deterministic Evidence ID (generateDeterministicEvidenceId)
 * 4. Zod Evidence Validation (validateEvidenceRecord)
 * 5. Idempotent Evidence Store (globalEvidenceStore)
 * 6. Analytical Cube Synchronization (analyticsService.rebuildAnalyticsFromEvidence)
 */

import { WebAcquisitionResult, GenericObservationResult } from '../acquisition/types';
import { RawEvidenceRecord } from '@/types/evidence';
import { TargetBrand } from '@/types/brands';
import { ChannelType, PlatformType } from '@/types/sources';
import { extractProductFromHtml } from '../extraction/productExtractor';
import { classifyPrinterItem } from '@/services/classification/classifier';
import { resolveSku } from '@/services/catalog/skuNormalizer';
import { generateDeterministicEvidenceId } from '@/lib/evidenceId';
import { validateEvidenceRecord } from '@/services/evidence/evidenceValidator';
import { globalEvidenceStore } from '@/services/evidence/evidenceStore';
import { analyticsService } from '@/services/analytics/analyticsService';
import { convertBuddhistYearToGregorian } from '@/lib/dates';

export class GenericWebAdapter {
  /**
   * Ingests an acquired web page into the Evidence Lake.
   */
  public ingestAcquisition(acquisition: WebAcquisitionResult): GenericObservationResult {
    const result: GenericObservationResult = {
      observations: [],
      accepted: 0,
      rejected: 0,
      duplicate: 0,
      unresolved_sku: 0,
      rejected_reasons: [],
    };

    if (acquisition.status !== 'SUCCESS' && acquisition.status !== 'PARTIAL_SUCCESS') {
      return result;
    }

    if (!acquisition.html) {
      return result;
    }

    // 1. Extract product data from HTML
    const prod = extractProductFromHtml(acquisition.html, acquisition.final_url);
    if (!prod.title) {
      return result;
    }

    // Determine Brand
    let brand: TargetBrand | null = null;
    if (prod.brand === 'HP' || prod.brand === 'Epson' || prod.brand === 'Canon' || prod.brand === 'Brother') {
      brand = prod.brand;
    } else if (acquisition.domain.includes('hp.com')) {
      brand = 'HP';
    } else if (acquisition.domain.includes('epson.co.th')) {
      brand = 'Epson';
    } else if (acquisition.domain.includes('canon.co.th')) {
      brand = 'Canon';
    } else if (acquisition.domain.includes('brother.co.th')) {
      brand = 'Brother';
    }

    if (!brand) {
      result.rejected++;
      result.rejected_reasons.push(`Non-target brand in title: ${prod.title}`);
      return result;
    }

    // 2. 6-Gate Contamination Classifier
    const classification = classifyPrinterItem(prod.title, prod.price_current_thb || undefined);
    if (classification.decision === 'REJECT') {
      result.rejected++;
      result.rejected_reasons.push(
        `Contamination Filter: ${prod.title} (${classification.rejection_reason || 'Not an ink-tank printer'})`
      );
      return result;
    }

    // 3. Deterministic SKU Resolver
    const skuResolution = resolveSku(prod.title, brand);
    let resolvedModelName: string | null = null;
    if (skuResolution.status === 'MATCHED') {
      resolvedModelName = skuResolution.canonical_model_name;
    } else {
      result.unresolved_sku++;
    }

    // 4. Platform & Channel Mapping
    let platform: PlatformType = 'Advice';
    let channel: ChannelType = 'E-commerce';

    if (acquisition.domain.includes('shopee')) platform = 'Shopee';
    else if (acquisition.domain.includes('lazada')) platform = 'Lazada';
    else if (acquisition.domain.includes('tiktok')) platform = 'TikTok Shop';
    else if (acquisition.domain.includes('jib.co.th')) platform = 'JIB';
    else if (acquisition.domain.includes('powerbuy')) platform = 'Power Buy';
    else if (acquisition.domain.includes('facebook')) {
      platform = 'Facebook';
      channel = 'Social';
    } else if (acquisition.domain.includes('instagram')) {
      platform = 'Instagram';
      channel = 'Social';
    } else if (acquisition.domain.includes('youtube')) {
      platform = 'YouTube';
      channel = 'Social';
    }

    // Date normalization
    const dateStr = convertBuddhistYearToGregorian(new Date().toISOString().split('T')[0]);

    // 5. Build Deterministic Evidence ID
    const evidenceId = generateDeterministicEvidenceId({
      platform,
      sourceUrl: acquisition.final_url,
      publishedAt: dateStr,
      platformEntityId: prod.sku || prod.model || prod.title,
    });

    const rawObservation: RawEvidenceRecord = {
      evidence_id: evidenceId,
      published_at: dateStr,
      captured_at: acquisition.fetched_at,
      brand,
      channel,
      platform,
      activity_type: channel === 'Social' ? 'Social Post' : 'Product Listing',
      product_sku: resolvedModelName,
      raw_title: prod.title,
      raw_content_th: prod.description_th || prod.title,
      content_en_translation: prod.description_en || prod.title,
      price_current_thb: prod.price_current_thb,
      price_original_thb: prod.price_original_thb,
      discount_pct: prod.discount_pct,
      seller_name: prod.seller_name || acquisition.domain,
      is_official_store: prod.is_official_store,
      stock_status: prod.availability === 'InStock' ? 'In Stock' : 'Out of Stock',
      displayed_sales: prod.sold_count || null,
      rating: prod.rating,
      review_count: prod.review_count,
      creative_format: null,
      creative_asset_url: prod.images[0] || null,
      source_url: acquisition.final_url,
      evidence_tags: ['Web Ingestion', platform, prod.source_quality],
      extraction_method: 'Direct HTTP',
      confidence_score: skuResolution.confidence,
    };

    // 6. Zod Validation
    const validation = validateEvidenceRecord(rawObservation);
    if (!validation.valid || !validation.data) {
      result.rejected++;
      result.rejected_reasons.push(
        `Schema Validation Failed: ${validation.errors ? validation.errors.join(', ') : 'Unknown schema error'}`
      );
      return result;
    }

    const validRecord: RawEvidenceRecord = validation.data;

    // 7. Idempotent Insert into Global Evidence Store
    const inserted = globalEvidenceStore.insert(validRecord);
    if (inserted) {
      result.accepted++;
      result.observations.push(validRecord);
    } else {
      result.duplicate++;
    }

    // 8. Rebuild Analytical Cube
    analyticsService.rebuildAnalyticsFromEvidence();

    return result;
  }
}

export const genericWebAdapter = new GenericWebAdapter();
