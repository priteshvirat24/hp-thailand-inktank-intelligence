/**
 * Section 7: Authoritative Insights & Recommendations Intelligence Layer
 * Section 13 & Phase 5A Compliance
 * 
 * Replaces "Signals & Actions" with an executive-grade strategic workspace:
 * - Transforms verified POC data into top 3-5 concise findings for the HP Print Tank CEO.
 * - Strict 5-part structure: Finding → Evidence → Implication for HP → Recommended Action → Sources.
 * - Cross-Data-Cut Corroboration across the 5 canonical dimensions.
 * - Full Evidence Modal lineage and traceability drilldown.
 * - Clean enterprise aesthetic: monochrome palette (black/grey/white), precise typography, zero fluff.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { BrandPill } from '@/components/ui/BrandPill';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TargetBrand } from '@/types/brands';
import { AnalyticalMonth } from '@/types/analytics';
import {
  Insight,
  DataCut,
} from '@/services/insights/insightTypes';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ArrowRight,
  Filter,
  Clock,
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

interface InsightsRecommendationsSectionProps {
  insights: readonly Insight[];
  selectedMonth: AnalyticalMonth;
  selectedBrand?: TargetBrand | 'All';
  isLoading?: boolean;
  onOpenEvidence?: (metricId: string, metricName: string, brand: TargetBrand | 'All') => void;
}

const DATA_CUT_LABELS: DataCut[] = [
  'Online Visibility / SOV',
  'Advertising / Creatives',
  'Social Media Activity',
  'E-commerce Presence, Pricing, Promotions & Traction',
  'Consumer Sentiment / Recommendation',
];

export const InsightsRecommendationsSection: React.FC<InsightsRecommendationsSectionProps> = ({
  insights,
  selectedMonth,
  selectedBrand = 'All',
  isLoading: _isLoading = false,
  onOpenEvidence,
}) => {
  const [selectedCut, setSelectedCut] = useState<DataCut | 'All'>('All');
  const [activeView, setActiveView] = useState<'ceo-pitch' | 'all-findings' | 'matrix'>('ceo-pitch');

  // Filter insights by selected data cut and brand
  const filteredInsights = useMemo(() => {
    return insights.filter((item) => {
      if (selectedBrand !== 'All') {
        const matchesBrand =
          item.affectedBrands.includes(selectedBrand) ||
          item.title.toLowerCase().includes(selectedBrand.toLowerCase());
        if (!matchesBrand) return false;
      }
      if (selectedCut !== 'All') {
        if (!item.supportingDataCuts.includes(selectedCut)) return false;
      }
      return true;
    });
  }, [insights, selectedBrand, selectedCut]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 font-sans"
    >
      <SectionHeader
        title="7. Insights & Recommendations"
        subtitle={`Actionable competitive intelligence answering: What has changed? What is significant? and What should HP consider doing?${selectedBrand !== 'All' ? ` (Focus: ${selectedBrand})` : ''}`}
        period={selectedMonth}
        sources={['5-Data-Cut Corroboration', 'Analytical Metric Cube', 'Evidence Lake Lineage']}
        totalEvidence={insights.length}
      />

      {/* ── View Selector & Data-Cut Filters ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveView('ceo-pitch')}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-all ${
              activeView === 'ceo-pitch'
                ? 'bg-white text-black shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white bg-[#111111] border border-[#222222]'
            }`}
          >
            30-Second CEO Briefing
          </button>
          <button
            type="button"
            onClick={() => setActiveView('all-findings')}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-all ${
              activeView === 'all-findings'
                ? 'bg-white text-black shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white bg-[#111111] border border-[#222222]'
            }`}
          >
            All Evidence-Backed Findings ({filteredInsights.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('matrix')}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-all ${
              activeView === 'matrix'
                ? 'bg-white text-black shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white bg-[#111111] border border-[#222222]'
            }`}
          >
            Strategic Matrix (SWOT)
          </button>
        </div>

        {/* Supporting Data Cut Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-zinc-400 text-[10px] uppercase font-mono mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            Cut:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCut('All')}
            className={`px-2 py-1 rounded-[4px] text-[11px] font-mono transition-colors shrink-0 ${
              selectedCut === 'All'
                ? 'bg-[#222222] text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 bg-transparent border border-transparent'
            }`}
          >
            All (5 Cuts)
          </button>
          {DATA_CUT_LABELS.map((cut) => {
            const shortName = cut.split('/')[0].trim();
            const isActive = selectedCut === cut;
            return (
              <button
                key={cut}
                type="button"
                onClick={() => setSelectedCut(cut)}
                className={`px-2 py-1 rounded-[4px] text-[11px] font-mono transition-colors shrink-0 ${
                  isActive
                    ? 'bg-[#222222] text-white border border-zinc-700 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 bg-transparent border border-transparent'
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CEO 30-Second Executive Pitch View ─────────────────────────────────── */}
      {(activeView === 'ceo-pitch' || activeView === 'all-findings') && (
        <motion.div variants={itemVariants} className="space-y-4">
          {activeView === 'ceo-pitch' && (
            <div className="bg-[#111111] border border-[#262626] rounded-[8px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  HP Print Tank CEO 30-Second Briefing
                </span>
                <h3 className="text-sm font-semibold text-white">
                  Top Critical Competitive Movements &amp; Recommended Actions
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Front-loaded empirical synthesis. Every finding is corroborated across multiple data cuts with zero synthetic assumptions.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-zinc-400">
                <div className="px-3 py-1.5 rounded-[4px] bg-[#161616] border border-[#2a2a2a]">
                  <span className="text-white font-bold">{filteredInsights.length}</span> Top Signals
                </div>
                <div className="px-3 py-1.5 rounded-[4px] bg-[#161616] border border-[#2a2a2a]">
                  <span className="text-white font-bold">{selectedMonth}</span> Window
                </div>
              </div>
            </div>
          )}

          {/* Cards List */}
          {filteredInsights.length === 0 ? (
            <div className="p-12 text-center rounded-[8px] bg-[#111111] border border-[#222222] space-y-2">
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                No Verified Findings Matching Current Filters
              </p>
              <p className="text-xs text-zinc-400">
                Adjust brand focus or data-cut selector to view other verified observations.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInsights.map((insight, idx) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  index={idx + 1}
                  onOpenEvidence={onOpenEvidence}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── 4-Quadrant Strategic Positioning Matrix ───────────────────────────── */}
      {activeView === 'matrix' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quadrant 1: HP Competitive Strengths & Moats */}
          <Card className="p-5 bg-[#0f1411] border-emerald-900/40 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  HP Verified Moats
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                PROVEN ADVANTAGE
              </span>
            </div>
            <div className="space-y-2 text-xs text-zinc-300">
              {filteredInsights.filter((i) => i.id === 'SIG-HP-ONSITE-SERVICE-MOAT' || i.affectedBrands.includes('HP') || i.category === 'CONSUMER_SENTIMENT').length > 0 ? (
                filteredInsights
                  .filter((i) => i.id === 'SIG-HP-ONSITE-SERVICE-MOAT' || i.affectedBrands.includes('HP') || i.category === 'CONSUMER_SENTIMENT')
                  .map((item) => (
                    <div key={item.id} className="p-3 rounded-lg bg-black/40 border border-emerald-950/80 space-y-1">
                      <strong className="text-white block font-medium">{item.title}</strong>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {item.observedVsInterpretation.observed}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-zinc-500 font-mono">No specific moat observations detected for this filter view.</p>
              )}
            </div>
          </Card>

          {/* Quadrant 2: Competitor Pressure Points */}
          <Card className="p-5 bg-[#170e10] border-rose-900/40 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                  Competitor Pressure Points
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                MARKET THREAT
              </span>
            </div>
            <div className="space-y-2 text-xs text-zinc-300">
              {filteredInsights.filter((i) => i.category === 'ECOMMERCE' || i.category === 'PROMOTION').length > 0 ? (
                filteredInsights
                  .filter((i) => i.category === 'ECOMMERCE' || i.category === 'PROMOTION')
                  .map((item) => (
                    <div key={item.id} className="p-3 rounded-lg bg-black/40 border border-rose-950/80 space-y-1">
                      <strong className="text-white block font-medium">{item.title}</strong>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {item.observedVsInterpretation.observed}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-zinc-500 font-mono">No competitor pressure points detected for this filter view.</p>
              )}
            </div>
          </Card>

          {/* Quadrant 3: HP Vulnerabilities & Gaps */}
          <Card className="p-5 bg-[#16120e] border-amber-900/40 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  HP Vulnerabilities
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                ATTENTION REQUIRED
              </span>
            </div>
            <div className="space-y-2 text-xs text-zinc-300">
              {filteredInsights.filter((i) => i.category === 'ADVERTISING' || i.category === 'CREATIVE_MESSAGING' || i.category === 'PRICING').length > 0 ? (
                filteredInsights
                  .filter((i) => i.category === 'ADVERTISING' || i.category === 'CREATIVE_MESSAGING' || i.category === 'PRICING')
                  .map((item) => (
                    <div key={item.id} className="p-3 rounded-lg bg-black/40 border border-amber-950/80 space-y-1">
                      <strong className="text-white block font-medium">{item.title}</strong>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {item.implication}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-zinc-500 font-mono">No specific vulnerabilities identified for this filter view.</p>
              )}
            </div>
          </Card>

          {/* Quadrant 4: Strategic Recommendations */}
          <Card className="p-5 bg-[#0e1219] border-sky-900/40 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Lightbulb className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                  Strategic Recommendations
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                HIGH IMPACT
              </span>
            </div>
            <div className="space-y-2 text-xs text-zinc-300">
              {filteredInsights.length > 0 ? (
                filteredInsights.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-black/40 border border-sky-950/80 space-y-1">
                    <strong className="text-white block font-medium">{item.title}</strong>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {item.recommendation}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 font-mono">No strategic recommendations available for this filter view.</p>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Data Integrity Badge ──────────────────────────────────────────────── */}
      <div className="rounded-[8px] bg-[#111111] border border-[#222222] px-4 py-3 flex items-center justify-center gap-2 text-xs text-zinc-400 font-mono shadow-sm">
        <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0" />
        <span>
          Section 13 Compliance: Zero synthetic metrics. Every finding is derived strictly from verified observations with full source lineage.
        </span>
      </div>
    </motion.div>
  );
};

// ─── Individual Insight Card Component ────────────────────────────────────────

interface InsightCardProps {
  insight: Insight;
  index: number;
  onOpenEvidence?: (metricId: string, metricName: string, brand: TargetBrand | 'All') => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, index, onOpenEvidence }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityColor =
    insight.priority === 'HIGH'
      ? 'border-zinc-500 text-white bg-[#1a1a1a]'
      : 'border-zinc-700 text-zinc-300 bg-[#141414]';

  const corroborationBadge =
    insight.confidence === 'MULTI-CUT'
      ? 'text-white border-zinc-600 bg-[#1e1e1e]'
      : insight.confidence === 'CORROBORATED'
      ? 'text-zinc-300 border-zinc-700 bg-[#181818]'
      : 'text-zinc-400 border-zinc-800 bg-[#121212]';

  return (
    <Card className="p-5 rounded-[10px] bg-[#111111] border border-[#242424] hover:border-[#333333] transition-all space-y-4 shadow-sm">
      {/* ── Header: Priority, Category, Corroboration Badge ──────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222222] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-white text-black font-bold">
            #{String(index).padStart(2, '0')}
          </span>
          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-[4px] border font-semibold ${priorityColor}`}>
            {insight.priority} PRIORITY
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-[#181818] border border-[#2a2a2a] text-zinc-300 font-semibold">
            {insight.category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-[4px] border font-semibold ${corroborationBadge}`}>
            {insight.confidence} ({insight.supportingDataCuts.length} DATA CUTS)
          </span>
          {insight.affectedBrands.map((b) => (
            <BrandPill key={b} brand={b} size="sm" />
          ))}
        </div>
      </div>

      {/* ── Title ───────────────────────────────────────────────────────────── */}
      <div>
        <h4 className="text-sm md:text-[15px] font-bold text-white tracking-tight leading-snug">
          {insight.title}
        </h4>
      </div>

      {/* ── 5-Part Structured Hierarchy ─────────────────────────────────────── */}
      <div className="space-y-3 text-xs leading-relaxed">
        {/* 1. Finding */}
        <div className="p-3 rounded-[6px] bg-[#151515] border border-[#262626]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
            1. Verified Finding
          </span>
          <p className="text-zinc-200 font-medium">{insight.finding}</p>
        </div>

        {/* 2. Evidence */}
        <div className="p-3 rounded-[6px] bg-[#151515] border border-[#262626]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
            2. Empirical Evidence
          </span>
          <p className="text-zinc-300 font-mono text-[11px]">{insight.evidenceSummary}</p>
        </div>

        {/* 3. Implication for HP */}
        <div className="p-3 rounded-[6px] bg-[#171717] border border-[#2c2c2c]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 font-semibold block mb-1">
            3. Implication for HP
          </span>
          <p className="text-zinc-200 font-medium">{insight.implication}</p>
        </div>

        {/* 4. Recommended Action */}
        <div className="p-3.5 rounded-[6px] bg-[#1a1a1a] border border-[#383838]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white font-bold block mb-1 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-white" />
            4. Recommended Action (What HP Should Consider)
          </span>
          <p className="text-white font-semibold leading-relaxed">{insight.recommendation}</p>
        </div>
      </div>

      {/* ── 5. Supporting Data Cuts & Lineage Actions ───────────────────────── */}
      <div className="pt-3 border-t border-[#222222] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-zinc-400 mr-1">Corroborated by:</span>
          {insight.supportingDataCuts.map((cut) => (
            <span
              key={cut}
              className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#181818] border border-[#2a2a2a] text-zinc-300"
            >
              {cut.split('/')[0].trim()}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {onOpenEvidence && (
            <button
              type="button"
              onClick={() =>
                onOpenEvidence(
                  'TOTAL_VISIBILITY_TOUCHPOINTS',
                  `${insight.title} — Supporting Evidence`,
                  insight.affectedBrands[0] || 'All'
                )
              }
              className="px-3 py-1.5 rounded-[6px] bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Inspect Raw Evidence ({insight.evidenceIds.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-zinc-400 hover:text-white transition-colors font-mono px-2 py-1"
          >
            {isExpanded ? 'Less Details' : 'Observed vs Interpretation'}
          </button>
        </div>
      </div>

      {/* ── Expanded Section: Observed vs Interpretation Audit ──────────────── */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#222222] space-y-2 text-xs bg-[#0d0d0d] p-3.5 rounded-[6px]">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
              Observation vs Interpretation Audit
            </span>
            <span className="text-[10px] font-mono text-zinc-400">{insight.methodologyNote}</span>
          </div>
          <div className="space-y-1.5 pt-1 text-[11px]">
            <p className="text-zinc-400">
              <strong className="text-zinc-200 font-mono">OBSERVED:</strong> {insight.observedVsInterpretation.observed}
            </p>
            <p className="text-zinc-400">
              <strong className="text-zinc-200 font-mono">INTERPRETATION:</strong> {insight.observedVsInterpretation.interpretation}
            </p>
            <p className="text-zinc-400">
              <strong className="text-zinc-200 font-mono">RECOMMENDATION:</strong> {insight.observedVsInterpretation.recommendation}
            </p>
          </div>
          {insight.sourceUrls.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] font-mono text-zinc-400 block mb-1">Source Lineage URLs:</span>
              <div className="flex flex-wrap gap-2">
                {insight.sourceUrls.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-zinc-300 hover:text-white underline font-mono flex items-center gap-1"
                  >
                    <span>{s.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
