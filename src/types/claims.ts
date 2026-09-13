/**
 * Authoritative Numerical Claim Contract & Structured Validation Schemas
 * 
 * Defines machine-verifiable claim representations for RAG generation and auditing.
 */

import { z } from 'zod';
import { TargetBrand } from './brands';
import { MetricId } from './analytics';

export type ClaimType =
  | 'VALUE'
  | 'COUNT'
  | 'PERCENTAGE'
  | 'CURRENCY'
  | 'RATING'
  | 'RANK'
  | 'DELTA'
  | 'RATIO'
  | 'COMPARISON'
  | 'STATUS'
  | 'UNSUPPORTED';

export type ClaimComparatorOperator =
  | 'EQ'
  | 'GT'
  | 'GTE'
  | 'LT'
  | 'LTE'
  | 'DIFF'
  | 'PERCENT_DIFF';

export const ClaimComparatorZodSchema = z.object({
  operator: z.enum(['EQ', 'GT', 'GTE', 'LT', 'LTE', 'DIFF', 'PERCENT_DIFF']),
  compared_brand: z.enum(['HP', 'Canon', 'Epson', 'Brother']).nullable().optional(),
  compared_value: z.number().nullable().optional(),
  expected_difference: z.number().nullable().optional(),
});

export type ClaimComparator = z.infer<typeof ClaimComparatorZodSchema>;

export interface NumericalClaim {
  claim_id?: string;
  metric_id?: string | null;
  claim_type: ClaimType;
  value: number | null;
  unit?: string | null;
  brand?: TargetBrand | 'All' | 'None' | null;
  month?: string | null;
  channel?: string | null;
  platform?: string | null;
  sku_id?: string | null;
  comparator?: ClaimComparator;
  evidence_ids?: string[];
  confidence?: number;
  raw_text?: string;
}

export const NumericalClaimZodSchema = z.object({
  claim_id: z.string().optional().default(() => `claim-${Math.random().toString(36).slice(2, 9)}`),
  metric_id: z.string().nullable().optional(),
  claim_type: z.enum([
    'VALUE',
    'COUNT',
    'PERCENTAGE',
    'CURRENCY',
    'RATING',
    'RANK',
    'DELTA',
    'RATIO',
    'COMPARISON',
    'STATUS',
    'UNSUPPORTED',
  ]),
  value: z.number().nullable(),
  unit: z.string().nullable().optional(),
  brand: z.enum(['HP', 'Canon', 'Epson', 'Brother', 'All', 'None']).nullable().optional(),
  month: z.string().nullable().optional(),
  channel: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  sku_id: z.string().nullable().optional(),
  comparator: ClaimComparatorZodSchema.optional(),
  evidence_ids: z.array(z.string()).optional().default([]),
  confidence: z.number().optional().default(1.0),
  raw_text: z.string().optional(),
});

export const MistralStructuredResponseZodSchema = z.object({
  direct_answer: z.string(),
  strategic_implication: z.string().optional().default(''),
  claims: z.array(NumericalClaimZodSchema).optional().default([]),
});

export type MistralStructuredResponse = z.infer<typeof MistralStructuredResponseZodSchema>;

export type ClaimViolationType =
  | 'VALUE_MISMATCH'
  | 'SCOPE_MISMATCH'
  | 'UNIT_MISMATCH'
  | 'DATA_STATE_MISMATCH'
  | 'UNSUPPORTED_DOMAIN'
  | 'ARITHMETIC_MISMATCH'
  | 'RANKING_INVERSION'
  | 'EXTRANEOUS_UNVERIFIED_NUMBER'
  | 'NEGATIVE_VALUE_PROHIBITED';

export interface ClaimViolation {
  readonly violation_id: string;
  readonly type: ClaimViolationType;
  readonly message: string;
  readonly claim?: NumericalClaim;
  readonly authoritativeValue?: number | string | null;
  readonly claimedValue?: number | string | null;
  readonly metricId?: MetricId | string;
  readonly brand?: TargetBrand | string;
}

export interface ValidationToleranceConfig {
  readonly absoluteCurrencyTolerance: number;   // 0.5 THB for presentation rounding (e.g. 5733.40 -> 5733)
  readonly absolutePercentageTolerance: number; // 0.15% for presentation rounding (e.g. 30.77% -> 30.8%)
  readonly absoluteRatingTolerance: number;     // 0.1 for display rounding (e.g. 4.5 vs 4.50)
  readonly absoluteCountTolerance: number;      // 0 exact for counts
  readonly defaultRelativeTolerancePct: number; // 0%
}

export const DEFAULT_TOLERANCE_CONFIG: ValidationToleranceConfig = {
  absoluteCurrencyTolerance: 0.5,
  absolutePercentageTolerance: 0.15,
  absoluteRatingTolerance: 0.05,
  absoluteCountTolerance: 0,
  defaultRelativeTolerancePct: 0.0,
};
