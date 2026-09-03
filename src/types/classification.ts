/**
 * Authoritative classification decision and result contracts
 */

import { TargetBrand } from './brands';

export type ClassificationDecision = 'ACCEPT' | 'REJECT' | 'REVIEW';

export type PriceAssessment =
  | 'HARDWARE_PLAUSIBLE'
  | 'BELOW_THRESHOLD'
  | 'ABOVE_THRESHOLD'
  | 'NO_PRICE';

export interface PriceSignalInfo {
  readonly raw_price_thb: number | null;
  readonly meets_threshold: boolean | null;
  readonly price_assessment: PriceAssessment;
}

export interface ClassificationResult {
  readonly decision: ClassificationDecision;
  readonly confidence: number;
  readonly normalized_brand: TargetBrand | null;
  readonly normalized_sku: string | null;
  readonly matched_positive_signals: readonly string[];
  readonly matched_negative_signals: readonly string[];
  readonly rejection_reason?: string;
  readonly review_reason?: string;
  readonly price_signal: PriceSignalInfo;
  readonly is_tank_hardware: boolean;
  readonly classification_version: string;
}
