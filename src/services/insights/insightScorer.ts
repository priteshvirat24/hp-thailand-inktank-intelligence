/**
 * Deterministic Significance Scoring & Prioritization Engine
 * Evaluates Candidate Signals without synthetic randomness or false precision.
 */

import {
  CandidateSignal,
  PriorityLevel,
  CorroborationLevel,
} from './insightTypes';

export interface ScoredSignal {
  readonly candidate: CandidateSignal;
  readonly compositeScore: number;
  readonly priority: PriorityLevel;
  readonly corroboration: CorroborationLevel;
}

export class InsightScorer {
  /**
   * Scores an individual candidate signal deterministically
   */
  public scoreSignal(candidate: CandidateSignal): ScoredSignal {
    // 1. Corroboration level from actual supporting data cuts
    const cutsCount = candidate.supportingCuts.length;
    let corroboration: CorroborationLevel = 'SINGLE-CUT';
    let corroborationWeight = 4.0;

    if (cutsCount >= 3) {
      corroboration = 'MULTI-CUT';
      corroborationWeight = 10.0;
    } else if (cutsCount === 2) {
      corroboration = 'CORROBORATED';
      corroborationWeight = 7.5;
    }

    // 2. Deterministic composite score (out of 10.0)
    // Weights: Magnitude (30%), Persistence (25%), HP Relevance (30%), Cross-Cut Corroboration (15%)
    const rawScore =
      candidate.magnitudeScore * 0.3 +
      candidate.persistenceScore * 0.25 +
      candidate.hpRelevanceScore * 0.3 +
      corroborationWeight * 0.15;

    const compositeScore = Number(rawScore.toFixed(2));

    // 3. Categorical Priority Assignment
    let priority: PriorityLevel = 'LOW';
    if (compositeScore >= 7.5 || (candidate.hpRelevanceScore >= 8.5 && cutsCount >= 2)) {
      priority = 'HIGH';
    } else if (compositeScore >= 5.0) {
      priority = 'MEDIUM';
    }

    return {
      candidate,
      compositeScore,
      priority,
      corroboration,
    };
  }

  /**
   * Ranks scored signals and enforces the authoritative Top 3–5 Insight Limit.
   * Never manufactures placeholder insights if fewer than 3 strong signals exist.
   */
  public rankAndFilterTopSignals(
    candidates: readonly CandidateSignal[],
    limit = 5
  ): ScoredSignal[] {
    if (candidates.length === 0) return [];

    const scored = candidates.map((c) => this.scoreSignal(c));

    // Sort descending by compositeScore, then by number of supporting cuts
    scored.sort((a, b) => {
      if (b.compositeScore !== a.compositeScore) {
        return b.compositeScore - a.compositeScore;
      }
      return b.candidate.supportingCuts.length - a.candidate.supportingCuts.length;
    });

    // Enforce max limit (default 5, min 1)
    const effectiveLimit = Math.max(1, Math.min(5, limit));
    return scored.slice(0, effectiveLimit);
  }
}

export const insightScorer = new InsightScorer();
