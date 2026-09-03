/**
 * Authoritative brand and SKU domain type contracts
 */

export type TargetBrand = 'HP' | 'Epson' | 'Canon' | 'Brother';

export type ProductFamily = 'Smart Tank' | 'EcoTank' | 'MegaTank' | 'InkBenefit';

export type TargetSegment = 'Consumer / Home / Personal' | 'Small Business / SMB (<100 employees)';

export interface SkuMasterDefinition {
  readonly sku_id: string;
  readonly brand: TargetBrand;
  readonly family: ProductFamily;
  readonly model_name: string;
  readonly aliases: readonly string[];
  readonly normalized_model: string;
  readonly target_segment: TargetSegment;
  readonly functions: readonly string[] | null;
  readonly known_keywords: readonly string[];
  readonly competitor_equivalents: readonly string[] | null;
  readonly known_exclusions: readonly string[];
  readonly claimed_benefits: readonly string[] | null;
  readonly launch_rrp_thb: number | null;
}
