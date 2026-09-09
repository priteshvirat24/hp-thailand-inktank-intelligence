/**
 * Insight Synthesis Engine (Section 13 Compliance)
 * Transforms Scored Signals into finalized, executive-ready Insight contracts.
 * Strictly separates:
 * 1. Finding (Observed Fact)
 * 2. Evidence (Quantified Points)
 * 3. Implication for HP (Strategic Threat or Opportunity)
 * 4. Recommended Action (Actionable Consideration: "HP should consider...")
 * 5. Sources (Verified Evidence Lineage & URLs)
 */

import { Insight } from './insightTypes';
import { ScoredSignal } from './insightScorer';

export class InsightSynthesizer {
  /**
   * Synthesizes a ScoredSignal into an executive Insight object
   */
  public synthesize(scored: ScoredSignal): Insight {
    const { candidate, priority, corroboration } = scored;

    // Formatting evidence summary as concise bullet lines
    const evidenceSummary = candidate.supportingMetrics.length > 0
      ? candidate.supportingMetrics
          .map((m) => `${m.brand} ${m.metric_name}: ${m.value !== null ? m.value : '—'} ${m.unit} (${m.observation_count} obs)`)
          .slice(0, 3)
          .join(' • ')
      : candidate.observedFact;

    return {
      id: candidate.id,
      priority,
      category: candidate.category,
      title: candidate.title,
      finding: candidate.rawFinding,
      evidenceSummary,
      implication: candidate.strategicImplication,
      recommendation: candidate.actionConsideration,
      confidence: corroboration,
      significance: priority,
      supportingDataCuts: candidate.supportingCuts,
      supportingMetrics: candidate.supportingMetrics,
      evidenceIds: candidate.evidenceIds,
      sourceUrls: candidate.sourceUrls,
      affectedBrands: candidate.competitorBrands,
      affectedSkus: candidate.affectedSkus,
      analyticalMonth: candidate.analyticalMonth,
      dataState: candidate.dataState,
      methodologyNote: candidate.methodologyNote,
      observedVsInterpretation: {
        observed: candidate.observedFact,
        interpretation: candidate.analyticalInterpretation,
        recommendation: candidate.actionConsideration,
      },
    };
  }

  /**
   * Batch synthesizes ranked signals into a list of Insights
   */
  public synthesizeBatch(scoredList: readonly ScoredSignal[]): Insight[] {
    return scoredList.map((s) => this.synthesize(s));
  }
}

export const insightSynthesizer = new InsightSynthesizer();
