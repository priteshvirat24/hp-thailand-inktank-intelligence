/**
 * Authoritative 6-Gate Ink Tank Category Classifier & Normalization Engine
 * 
 * Enforces strict boundary rules per the Authoritative Brief:
 * 1. Target brand normalization (HP, Epson, Canon, Brother)
 * 2. Hard negative exclusion (Cartridge, Laser/Toner, Consumables, Accessories)
 * 3. Positive Ink Tank verification (English & Thai lexicons)
 * 4. Model & SKU normalization (Canonical 28-SKU registry via skuNormalizer)
 * 5. Price signal assessment (฿2,500 threshold as validation signal)
 * 6. Explicit decision synthesis: ACCEPT | REJECT | REVIEW
 */

import { ClassificationResult, PriceSignalInfo } from '@/types/classification';
import { normalizeBrand } from '@/config/brands';
import { resolveSku } from '@/services/catalog/skuNormalizer';
import {
  PROJECT_METADATA,
  POSITIVE_CATEGORY_KEYWORDS,
} from '@/config/constants';

const CLASSIFICATION_VERSION = 'v2.0-contract';

// Compiled negative regex patterns with descriptive categories
const NEGATIVE_RULES: { category: string; regex: RegExp }[] = [
  // 1. Cartridge inkjet printers
  {
    category: 'Cartridge Inkjet',
    regex: /(DeskJet|Envy|PIXMA\s*(?:TS|MG|E|iP)\d*|Expression\s*Home|cartridge|หมึกตลับ|ตลับหมึก|เดสก์เจ็ท)/i,
  },
  // 2. Laser and toner printers
  {
    category: 'Laser / Toner',
    regex: /(LaserJet|Laser\s*107|imageCLASS|i-SENSYS|HL-L\d*|DCP-L\d*|MFC-L\d*|Laser\s*Printer|\bLaser\b|toner|ผงหมึก|โทนเนอร์|เครื่องพิมพ์เลเซอร์|เลเซอร์)/i,
  },
  // 3. Standalone refill ink bottles and multipacks
  {
    category: 'Standalone Consumable / Bottle',
    regex: /(ink\s*bottle|bottle\s*only|refill\s*ink|refill\s*bottle|standalone\s*ink|ink\s*multipack|เฉพาะขวดหมึก|หมึกเติมขวด|น้ำหมึกเติม|หมึกขวด|ขวดหมึก|\b(?:003|664|GT52|GT53|GI-790|GI-71|GI-71S|BTD60|BT5000)\b)/i,
  },
  // 4. Accessories, spare parts, printheads, paper
  {
    category: 'Accessory / Spare Part',
    regex: /(printhead|printhead\s*only|maintenance\s*box|waste\s*ink|roller|cable|photo\s*paper|sublimation|ribbon|spare\s*part|หัวพิมพ์|กล่องซับหมึก|กระดาษโฟโต้)/i,
  },
];

// Compiled positive regex patterns
const ALL_POSITIVE_KEYWORDS = [
  ...POSITIVE_CATEGORY_KEYWORDS.english,
  ...POSITIVE_CATEGORY_KEYWORDS.thai,
];

export function classifyPrinterItem(
  title: string,
  priceThb: number | null = null
): ClassificationResult {
  const normalizedTitle = (title || '').trim();

  // Initialize price signal assessment
  let priceSignal: PriceSignalInfo = {
    raw_price_thb: priceThb,
    meets_threshold: null,
    price_assessment: 'NO_PRICE',
  };

  if (priceThb !== null && !isNaN(priceThb)) {
    const meetsThreshold = priceThb >= PROJECT_METADATA.hardware_price_envelope.min_thb;
    let assessment: PriceSignalInfo['price_assessment'] = 'HARDWARE_PLAUSIBLE';

    if (priceThb < PROJECT_METADATA.hardware_price_envelope.min_thb) {
      assessment = 'BELOW_THRESHOLD';
    } else if (priceThb > PROJECT_METADATA.hardware_price_envelope.max_thb) {
      assessment = 'ABOVE_THRESHOLD';
    }

    priceSignal = {
      raw_price_thb: priceThb,
      meets_threshold: meetsThreshold,
      price_assessment: assessment,
    };
  }

  // -------------------------------------------------------------------------
  // GATE 1: Brand Identification & Normalization
  // -------------------------------------------------------------------------
  const detectedBrand = normalizeBrand(normalizedTitle);
  if (!detectedBrand) {
    return {
      decision: 'REJECT',
      confidence: 0.99,
      normalized_brand: null,
      normalized_sku: null,
      matched_positive_signals: [],
      matched_negative_signals: [],
      rejection_reason: 'Non-target brand or unidentifiable manufacturer (Must be HP, Epson, Canon, or Brother)',
      price_signal: priceSignal,
      is_tank_hardware: false,
      classification_version: CLASSIFICATION_VERSION,
    };
  }

  // -------------------------------------------------------------------------
  // GATE 2: Negative Exclusion Check
  // -------------------------------------------------------------------------
  const matchedNegativeSignals: string[] = [];
  for (const rule of NEGATIVE_RULES) {
    if (rule.regex.test(normalizedTitle)) {
      matchedNegativeSignals.push(rule.category);
    }
  }

  // If title explicitly contains negative terms (e.g., ink bottle, cartridge, laser, printhead), reject immediately
  if (matchedNegativeSignals.length > 0) {
    return {
      decision: 'REJECT',
      confidence: 0.95,
      normalized_brand: detectedBrand,
      normalized_sku: null,
      matched_positive_signals: [],
      matched_negative_signals: matchedNegativeSignals,
      rejection_reason: `Matched negative exclusion: ${matchedNegativeSignals.join(', ')}`,
      price_signal: priceSignal,
      is_tank_hardware: false,
      classification_version: CLASSIFICATION_VERSION,
    };
  }

  // -------------------------------------------------------------------------
  // GATE 3: Positive Category Signals Check
  // -------------------------------------------------------------------------
  const matchedPositiveSignals: string[] = [];
  for (const keyword of ALL_POSITIVE_KEYWORDS) {
    if (new RegExp(keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i').test(normalizedTitle)) {
      matchedPositiveSignals.push(keyword);
    }
  }

  const hasPositiveSignal = matchedPositiveSignals.length > 0;

  // -------------------------------------------------------------------------
  // GATE 4: Canonical SKU Matching & Normalization via skuNormalizer
  // -------------------------------------------------------------------------
  const resolution = resolveSku(normalizedTitle, detectedBrand);
  const matchedSku = resolution.status === 'MATCHED' ? resolution.canonical_model_name : null;

  // -------------------------------------------------------------------------
  // GATE 5 & 6: Decision Synthesis & Price Threshold Review
  // -------------------------------------------------------------------------

  // Case A: Ambiguous short query like "HP 580" without explicit "Smart Tank" or "Ink Tank"
  if (!hasPositiveSignal && matchedSku) {
    return {
      decision: 'REVIEW',
      confidence: 0.6,
      normalized_brand: detectedBrand,
      normalized_sku: matchedSku,
      matched_positive_signals: [],
      matched_negative_signals: [],
      review_reason: 'Ambiguous model number without explicit Ink Tank keyword or hardware confirmation',
      price_signal: priceSignal,
      is_tank_hardware: false,
      classification_version: CLASSIFICATION_VERSION,
    };
  }

  // Case B: No positive Ink Tank signal and no SKU matched -> REJECT
  if (!hasPositiveSignal && !matchedSku) {
    return {
      decision: 'REJECT',
      confidence: 0.9,
      normalized_brand: detectedBrand,
      normalized_sku: null,
      matched_positive_signals: [],
      matched_negative_signals: [],
      rejection_reason: 'Does not match positive Ink Tank terminology or recognized family naming',
      price_signal: priceSignal,
      is_tank_hardware: false,
      classification_version: CLASSIFICATION_VERSION,
    };
  }

  // Case C: Has positive Ink Tank signal, but price is below hardware floor (฿2,500)
  // Flag for REVIEW rather than silently accepting or rejecting
  if (priceSignal.price_assessment === 'BELOW_THRESHOLD') {
    return {
      decision: 'REVIEW',
      confidence: 0.65,
      normalized_brand: detectedBrand,
      normalized_sku: matchedSku,
      matched_positive_signals: matchedPositiveSignals,
      matched_negative_signals: [],
      review_reason: `Price ฿${priceThb} is below hardware threshold (฿${PROJECT_METADATA.hardware_price_envelope.min_thb}); requires review for promotional anomaly vs bundled consumable`,
      price_signal: priceSignal,
      is_tank_hardware: true,
      classification_version: CLASSIFICATION_VERSION,
    };
  }

  // Case D: Has positive signal, but price is above hardware ceiling (฿25,000)
  // Flag for REVIEW (unless it's an A3 unit like L15150)
  if (priceSignal.price_assessment === 'ABOVE_THRESHOLD' && matchedSku !== 'EcoTank L15150') {
    return {
      decision: 'REVIEW',
      confidence: 0.7,
      normalized_brand: detectedBrand,
      normalized_sku: matchedSku,
      matched_positive_signals: matchedPositiveSignals,
      matched_negative_signals: [],
      review_reason: `Price ฿${priceThb} exceeds consumer/SMB hardware ceiling (฿${PROJECT_METADATA.hardware_price_envelope.max_thb}); requires review for commercial unit`,
      price_signal: priceSignal,
      is_tank_hardware: true,
      classification_version: CLASSIFICATION_VERSION,
    };
  }

  // Case E: Clear positive Ink Tank hardware match with plausible price or ad/social post without price
  return {
    decision: 'ACCEPT',
    confidence: matchedSku ? 0.98 : 0.85,
    normalized_brand: detectedBrand,
    normalized_sku: matchedSku,
    matched_positive_signals: matchedPositiveSignals,
    matched_negative_signals: [],
    price_signal: priceSignal,
    is_tank_hardware: true,
    classification_version: CLASSIFICATION_VERSION,
  };
}
