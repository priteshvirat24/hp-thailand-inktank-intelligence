/**
 * Strict Evidence Schema Validator using Zod
 * Ensures zero corrupted or fabricated records enter the Evidence Lake.
 */

import { z } from 'zod';
import { RawEvidenceRecord } from '@/types/evidence';

export const RawEvidenceRecordSchema = z.object({
  evidence_id: z.string().regex(/^EVID-[A-Z0-9]+-[A-F0-9]{12}$/, {
    message: 'Invalid evidence_id format. Must match EVID-{PLATFORM}-{12_HEX}',
  }),
  published_at: z.string().min(4, 'published_at must be valid date string'),
  captured_at: z.string().datetime({ message: 'captured_at must be valid ISO8601 UTC timestamp' }),
  brand: z.enum(['HP', 'Epson', 'Canon', 'Brother']),
  channel: z.enum(['Paid Media', 'Social', 'E-commerce', 'Consumer Review']),
  platform: z.enum([
    'Google Ads',
    'Meta',
    'YouTube',
    'Facebook',
    'Instagram',
    'TikTok',
    'LinkedIn',
    'Shopee',
    'Lazada',
    'TikTok Shop',
    'JIB',
    'Advice',
    'Power Buy',
  ]),
  activity_type: z.enum(['Ad Creative', 'Social Post', 'Product Listing', 'Promotion', 'Consumer Review']),
  product_sku: z.string().nullable(),
  raw_title: z.string().min(1, 'raw_title cannot be empty'),
  raw_content_th: z.string(),
  content_en_translation: z.string(),
  price_current_thb: z.number().nonnegative().nullable(),
  price_original_thb: z.number().nonnegative().nullable(),
  discount_pct: z.number().min(0).max(100).nullable(),
  seller_name: z.string().nullable(),
  is_official_store: z.boolean(),
  stock_status: z.enum(['In Stock', 'Out of Stock', 'Low Stock', 'Unknown']),
  displayed_sales: z.string().nullable(),
  rating: z.number().min(0).max(5).nullable(),
  review_count: z.number().int().nonnegative().nullable(),
  creative_format: z.enum(['Video', 'Static Image', 'Carousel', 'Search Text', 'Live Stream']).nullable(),
  creative_asset_url: z.string().nullable(),
  impressions: z.number().int().nonnegative().nullable().optional(),
  views: z.number().int().nonnegative().nullable().optional(),
  screenshot_url: z.string().nullable().optional(),
  source_url: z.string().url({ message: 'source_url must be a valid URL string' }),
  evidence_tags: z.array(z.string()),
  extraction_method: z.enum(['Apify Actor', 'Bright Data Scraping Browser', 'Direct HTTP', 'Official Seed']),
  confidence_score: z.number().min(0).max(1),
});

export interface EvidenceValidationResult {
  readonly valid: boolean;
  readonly data?: RawEvidenceRecord;
  readonly errors?: string[];
}

export function validateEvidenceRecord(record: unknown): EvidenceValidationResult {
  const parsed = RawEvidenceRecordSchema.safeParse(record);
  if (parsed.success) {
    return {
      valid: true,
      data: parsed.data as RawEvidenceRecord,
    };
  }

  return {
    valid: false,
    errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
  };
}
