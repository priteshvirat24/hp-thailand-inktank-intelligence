/**
 * Authoritative Domain Contracts for Insights & Recommendations Intelligence Engine
 * Section 13 & Phase 5A Compliance
 */

import { TargetBrand } from '@/types/brands';
import { AnalyticalMonth, MetricId } from '@/types/analytics';

export type InsightCategory =
  | 'VISIBILITY'
  | 'ADVERTISING'
  | 'CREATIVE_MESSAGING'
  | 'SOCIAL'
  | 'ECOMMERCE'
  | 'PRICING'
  | 'PROMOTION'
  | 'PRODUCT'
  | 'CONSUMER_SENTIMENT'
  | 'STRATEGIC';

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type CorroborationLevel = 'SINGLE-CUT' | 'CORROBORATED' | 'MULTI-CUT';

export type DataCut =
  | 'Online Visibility / SOV'
  | 'Advertising / Creatives'
  | 'Social Media Activity'
  | 'E-commerce Presence, Pricing, Promotions & Traction'
  | 'Consumer Sentiment / Recommendation';

export interface SupportingMetricSnapshot {
  readonly metric_id: MetricId;
  readonly metric_name: string;
  readonly brand: TargetBrand;
  readonly value: number | null;
  readonly unit: string;
  readonly observation_count: number;
}

export interface InsightSourceLink {
  readonly label: string;
  readonly url: string;
  readonly platform: string;
  readonly evidence_id?: string;
}

export interface ObservedVsInterpretation {
  readonly observed: string;        // Pure verified facts
  readonly interpretation: string;  // Analytical inference / hypothesis
  readonly recommendation: string;  // Direct consideration for HP
}

export interface Insight {
  readonly id: string;
  readonly priority: PriorityLevel;
  readonly category: InsightCategory;
  readonly title: string;
  readonly finding: string;              // Finding statement
  readonly evidenceSummary: string;     // Quantified evidence points
  readonly implication: string;         // Implication for HP
  readonly recommendation: string;      // Specific actionable recommendation
  readonly confidence: CorroborationLevel;
  readonly significance: PriorityLevel;
  readonly supportingDataCuts: readonly DataCut[];
  readonly supportingMetrics: readonly SupportingMetricSnapshot[];
  readonly evidenceIds: readonly string[];
  readonly sourceUrls: readonly InsightSourceLink[];
  readonly affectedBrands: readonly TargetBrand[];
  readonly affectedSkus: readonly string[];
  readonly analyticalMonth: AnalyticalMonth;
  readonly dataState: 'OBSERVED' | 'INSUFFICIENT_EVIDENCE';
  readonly methodologyNote: string;
  readonly observedVsInterpretation: ObservedVsInterpretation;
}

export interface CandidateSignal {
  readonly id: string;
  readonly category: InsightCategory;
  readonly title: string;
  readonly rawFinding: string;
  readonly observedFact: string;
  readonly analyticalInterpretation: string;
  readonly strategicImplication: string;
  readonly actionConsideration: string;
  readonly primaryBrand: TargetBrand | 'All';
  readonly competitorBrands: readonly TargetBrand[];
  readonly affectedSkus: readonly string[];
  readonly supportingCuts: readonly DataCut[];
  readonly supportingMetrics: readonly SupportingMetricSnapshot[];
  readonly evidenceIds: readonly string[];
  readonly sourceUrls: readonly InsightSourceLink[];
  readonly magnitudeScore: number;    // 1 to 10
  readonly persistenceScore: number;  // 1 to 10
  readonly hpRelevanceScore: number;  // 1 to 10
  readonly dataState: 'OBSERVED' | 'INSUFFICIENT_EVIDENCE';
  readonly analyticalMonth: AnalyticalMonth;
  readonly methodologyNote: string;
}
