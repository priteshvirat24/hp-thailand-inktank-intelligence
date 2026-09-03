/**
 * Authoritative SKU Resolution & Catalog Contracts
 */

import { TargetBrand, ProductFamily } from './brands';

export type SkuResolutionStatus = 'MATCHED' | 'UNRESOLVED' | 'AMBIGUOUS';

export interface SkuResolutionResult {
  readonly status: SkuResolutionStatus;
  readonly canonical_sku_id: string | null;
  readonly canonical_model_name: string | null;
  readonly brand: TargetBrand | null;
  readonly family: ProductFamily | null;
  readonly matched_alias: string | null;
  readonly confidence: number;
  readonly reason?: string;
  readonly raw_input: string;
}
