/**
 * ASK INTELLIGENCE / RAG Banner Component
 * Wireframe Section: Top Q&A Bar (Section 12.2 of Technical Implementation Brief)
 * Provides natural-language Q&A across all collected data with evidence-backed answers,
 * supporting metrics, implications for HP, and direct source links.
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Sparkles, Search, CornerDownLeft, ExternalLink, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendRagQuery } from '@/lib/apiClient';
import { RagAnswer } from '@/types/rag';
import { AnalyticalMonth } from '@/types/analytics';
import { TargetBrand } from '@/types/brands';
import { getVerifiedWorkingSourceUrl } from '@/lib/urlHelpers';
import { FormattedMarkdown } from '@/components/ui/FormattedMarkdown';

interface AskIntelligenceBannerProps {
  currentMonth: AnalyticalMonth;
  currentBrand: TargetBrand | 'All';
  onOpenEvidence?: (metricId: string, metricName: string, brand: TargetBrand | 'All') => void;
}

const SUGGESTED_BRIEF_QUESTIONS = [
  'How does HP compare with Epson, Canon and Brother in Thailand?',
  'Which brands and products are most visible across e-commerce and paid ads?',
  'What are competitors emphasizing in their messaging vs HP?',
  'What are the main consumer complaints and praise themes for Ink Tank printers?',
  'What are the key competitive threats and strategic opportunities for HP?',
];

export const AskIntelligenceBanner: React.FC<AskIntelligenceBannerProps> = ({
  currentMonth,
  currentBrand,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<RagAnswer | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;
    setIsLoading(true);
    setQuery(questionText);
    setIsExpanded(true);

    try {
      const res = await sendRagQuery({
        query: questionText,
        brandFilter: currentBrand,
        monthFilter: currentMonth,
      });
      setAnswer(res);
    } catch (err) {
      console.error('RAG Query failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mb-6">
      <Card className="p-4 bg-gradient-to-r from-[#111318] via-[#0d0f14] to-[#121016] border-[#252836] shadow-xl rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  ASK INTELLIGENCE / RAG ENGINE
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono bg-sky-950/80 border border-sky-800 text-sky-300 rounded">
                  SYNTHESIS ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Natural-language Q&amp;A across 2,880 observations with Answer → Evidence → Implication → Sources contract
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
            Enterprise Intelligence • 90-Day Ecosystem Window
          </span>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleAsk(query);
          }}
          className="mt-3 relative flex items-center"
        >
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything (e.g. How does HP compare with Epson on pricing and visibility in Thailand?)..."
            className="w-full bg-zinc-950/90 border border-zinc-800 rounded-lg pl-9 pr-24 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-1.5 px-3 py-1 bg-white text-zinc-950 hover:bg-zinc-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
          >
            {isLoading ? (
              <span className="animate-spin text-xs">⟳</span>
            ) : (
              <>
                <span>Query</span>
                <CornerDownLeft className="w-3 h-3 text-zinc-600" />
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[10px] text-zinc-500 uppercase font-mono shrink-0">Brief Prompts:</span>
          {SUGGESTED_BRIEF_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => void handleAsk(q)}
              className="px-2.5 py-1 text-[11px] rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all shrink-0 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Answer Display */}
        <AnimatePresence>
          {isExpanded && (answer || isLoading) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-zinc-800/80 space-y-4"
            >
              {isLoading ? (
                <div className="p-6 text-center text-xs font-mono text-zinc-400 animate-pulse">
                  Querying Evidence Lake &amp; Metric Cube for verified Thai market facts...
                </div>
              ) : answer ? (
                <div className="space-y-3 font-sans">
                  {/* Part 1: Direct Answer */}
                  <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-sky-400 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                      1. Evidence-Backed Strategic Answer
                    </div>
                    <FormattedMarkdown
                      content={answer.answer}
                      className="text-xs text-zinc-200 leading-relaxed font-sans"
                    />
                  </div>

                  {/* Part 2: Supporting Metrics & Observations */}
                  {answer.supporting_metrics && answer.supporting_metrics.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {answer.supporting_metrics.slice(0, 3).map((m, idx) => (
                        <div key={idx} className="p-2.5 rounded-md bg-black/50 border border-zinc-800 text-xs">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                            {m.metric_name}
                          </span>
                          <span className="text-white font-bold font-mono text-sm mt-0.5 block">
                            {m.value !== null ? m.value.toLocaleString() : '--'}
                          </span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">
                            {m.month} • {m.brand}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Part 3: Implication for HP */}
                  {answer.implication_for_hp && (
                    <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-amber-400 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        3. Strategic Implication for HP
                      </div>
                      <FormattedMarkdown
                        content={answer.implication_for_hp}
                        className="text-xs text-amber-200/90 leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Part 4: Evidence Sources & Traceability */}
                  {answer.sources && answer.sources.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        Grounded in {answer.sources.length} Verified Evidence Records:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {answer.sources.slice(0, 4).map((s, idx) => (
                          <a
                            key={idx}
                            href={getVerifiedWorkingSourceUrl({ source_url: s.source_url, platform: s.platform, brand: s.brand } as Parameters<typeof getVerifiedWorkingSourceUrl>[0])}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-sky-400 hover:text-sky-300 font-mono"
                          >
                            <span>{s.evidence_id || `${s.brand} ${s.platform}`}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};
