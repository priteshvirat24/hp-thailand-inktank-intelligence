/**
 * Deterministic SKU Normalizer & Resolution Service
 * Resolves raw retailer listing and ad titles to canonical SKU master definitions.
 * 
 * Rules:
 * 1. Strictly deterministic (No LLMs, no heuristic guessing).
 * 2. Ambiguous titles return AMBIGUOUS with confidence < 0.5.
 * 3. Contaminated titles (bottles, cartridges, lasers) return UNRESOLVED.
 * 4. Unknown models from target brands return UNRESOLVED preserving brand context.
 */

import { TargetBrand, ProductFamily } from '@/types/brands';
import { SkuResolutionResult } from '@/types/catalog';
import { normalizeBrand, BRAND_FAMILIES } from '@/config/brands';
import { ALL_MARKET_SKUS } from '@/config/skus';

// Compiled negative rejection patterns
const CONTAMINATION_PATTERNS: RegExp[] = [
  // 1. Cartridges
  /(DeskJet|Envy|PIXMA\s*(?:TS|MG|E|iP)\d*|Expression\s*Home|cartridge|หมึกตลับ|ตลับหมึก|เดสก์เจ็ท)/i,
  // 2. Lasers
  /(LaserJet|Laser\s*107|imageCLASS|i-SENSYS|HL-L\d*|DCP-L\d*|MFC-L\d*|Laser\s*Printer|\bLaser\b|toner|ผงหมึก|โทนเนอร์|เครื่องพิมพ์เลเซอร์|เลเซอร์)/i,
  // 3. Standalone bottles / consumables
  /(ink\s*bottle|bottle\s*only|refill\s*ink|refill\s*bottle|standalone\s*ink|ink\s*multipack|เฉพาะขวดหมึก|หมึกเติมขวด|น้ำหมึกเติม|หมึกขวด|ขวดหมึก|\b(?:003|664|GT52|GT53|GI-790|GI-71|GI-71S|BTD60|BT5000)\b)/i,
  // 4. Accessories
  /(printhead|printhead\s*only|maintenance\s*box|waste\s*ink|roller|cable|photo\s*paper|sublimation|ribbon|spare\s*part|หัวพิมพ์|กล่องซับหมึก|กระดาษโฟโต้)/i,
];

function isContaminated(text: string): boolean {
  return CONTAMINATION_PATTERNS.some((pattern) => pattern.test(text));
}

function detectFamily(text: string, brand: TargetBrand): ProductFamily | null {
  const allowedFamilies = BRAND_FAMILIES[brand];
  for (const family of allowedFamilies) {
    const escaped = family.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i').test(text)) {
      return family;
    }
  }
  // Canon PIXMA G series / MegaTank
  if (brand === 'Canon' && /(PIXMA\s*G|MegaTank|เมกะแท็งก์)/i.test(text)) {
    return 'MegaTank';
  }
  // Brother Refill Tank / InkBenefit
  if (brand === 'Brother' && /(InkBenefit|Refill\s*Tank|DCP-T|MFC-T|อิงค์เบเนฟิต)/i.test(text)) {
    return 'InkBenefit';
  }
  // HP Smart Tank
  if (brand === 'HP' && /(Smart\s*Tank|Ink\s*Tank|สมาร์ทแท็งก์)/i.test(text)) {
    return 'Smart Tank';
  }
  // Epson EcoTank
  if (brand === 'Epson' && /(EcoTank|Eco\s*Tank|อีโค่แท็งก์)/i.test(text)) {
    return 'EcoTank';
  }
  return null;
}

/**
 * Resolves a raw product title to a Canonical SKU definition deterministically.
 */
export function resolveSku(
  rawText: string,
  detectedBrandHint?: TargetBrand | null
): SkuResolutionResult {
  const text = (rawText || '').trim();

  if (!text) {
    return {
      status: 'UNRESOLVED',
      canonical_sku_id: null,
      canonical_model_name: null,
      brand: null,
      family: null,
      matched_alias: null,
      confidence: 0.0,
      reason: 'Empty product title',
      raw_input: rawText,
    };
  }

  // 1. Contamination check (bottles, cartridges, lasers, parts)
  if (isContaminated(text)) {
    const brand = detectedBrandHint || normalizeBrand(text);
    return {
      status: 'UNRESOLVED',
      canonical_sku_id: null,
      canonical_model_name: null,
      brand: brand || null,
      family: null,
      matched_alias: null,
      confidence: 0.0,
      reason: 'Contaminated by negative exclusion keyword (e.g. ink bottle, cartridge, laser, or printhead)',
      raw_input: rawText,
    };
  }

  // 2. Brand identification
  const brand = detectedBrandHint || normalizeBrand(text);
  if (!brand) {
    return {
      status: 'UNRESOLVED',
      canonical_sku_id: null,
      canonical_model_name: null,
      brand: null,
      family: null,
      matched_alias: null,
      confidence: 0.0,
      reason: 'No target brand (HP, Epson, Canon, Brother) identified',
      raw_input: rawText,
    };
  }

  const detectedFamily = detectFamily(text, brand);
  const brandSkus = ALL_MARKET_SKUS.filter((s) => s.brand === brand);

  // 3. Match candidates with priority scoring
  interface CandidateMatch {
    sku_id: string;
    model_name: string;
    family: ProductFamily;
    matched_alias: string;
    priority: number; // 1: full model, 2: alias, 3: model code
  }

  const matches: CandidateMatch[] = [];

  for (const sku of brandSkus) {
    // Priority 1: Full canonical model name match (e.g. "Smart Tank 580", "EcoTank L3250")
    const escapedModel = sku.model_name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (new RegExp(`(?:^|[^a-zA-Z0-9])${escapedModel}(?:$|[^a-zA-Z0-9])`, 'i').test(text)) {
      matches.push({
        sku_id: sku.sku_id,
        model_name: sku.model_name,
        family: sku.family,
        matched_alias: sku.model_name,
        priority: 1,
      });
      continue;
    }

    // Priority 2: Full alias match (e.g. "HP 580 Smart Tank", "Smart Tank 580 All-in-One")
    let aliasMatched = false;
    for (const alias of sku.aliases) {
      const escapedAlias = alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      if (new RegExp(`(?:^|[^a-zA-Z0-9])${escapedAlias}(?:$|[^a-zA-Z0-9])`, 'i').test(text)) {
        matches.push({
          sku_id: sku.sku_id,
          model_name: sku.model_name,
          family: sku.family,
          matched_alias: alias,
          priority: 2,
        });
        aliasMatched = true;
        break;
      }
    }
    if (aliasMatched) continue;

    // Priority 3: Specific model alphanumeric code (e.g. "L3250", "G3730", "DCP-T520W", "T520W", "580")
    for (const keyword of sku.known_keywords) {
      const escapedCode = keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      if (new RegExp(`(?:^|[^a-zA-Z0-9])${escapedCode}(?:$|[^a-zA-Z0-9])`, 'i').test(text)) {
        matches.push({
          sku_id: sku.sku_id,
          model_name: sku.model_name,
          family: sku.family,
          matched_alias: keyword,
          priority: 3,
        });
        break;
      }
    }
  }

  // 4. Evaluate candidates
  if (matches.length === 1) {
    const single = matches[0];
    return {
      status: 'MATCHED',
      canonical_sku_id: single.sku_id,
      canonical_model_name: single.model_name,
      brand,
      family: single.family,
      matched_alias: single.matched_alias,
      confidence: single.priority === 1 ? 0.99 : single.priority === 2 ? 0.95 : 0.90,
      raw_input: rawText,
    };
  }

  if (matches.length > 1) {
    // Sort by priority (lowest number is highest priority)
    matches.sort((a, b) => a.priority - b.priority);

    // If top match has strictly higher priority than second match (e.g. exact model vs loose code), select it
    if (matches[0].priority < matches[1].priority) {
      const best = matches[0];
      return {
        status: 'MATCHED',
        canonical_sku_id: best.sku_id,
        canonical_model_name: best.model_name,
        brand,
        family: best.family,
        matched_alias: best.matched_alias,
        confidence: 0.92,
        raw_input: rawText,
      };
    }

    // Otherwise, truly ambiguous (e.g. title mentions multiple models)
    return {
      status: 'AMBIGUOUS',
      canonical_sku_id: null,
      canonical_model_name: null,
      brand,
      family: detectedFamily,
      matched_alias: null,
      confidence: 0.4,
      reason: `Ambiguous match: multiple canonical models identified (${matches.map((m) => m.model_name).join(', ')})`,
      raw_input: rawText,
    };
  }

  // 5. No matches found for target brand
  return {
    status: 'UNRESOLVED',
    canonical_sku_id: null,
    canonical_model_name: null,
    brand,
    family: detectedFamily,
    matched_alias: null,
    confidence: detectedFamily ? 0.5 : 0.2,
    reason: detectedFamily
      ? `Target brand (${brand}) and family (${detectedFamily}) detected, but specific model was not found in the 28-SKU catalog`
      : `Target brand (${brand}) detected, but no recognized model or Ink Tank family found`,
    raw_input: rawText,
  };
}
