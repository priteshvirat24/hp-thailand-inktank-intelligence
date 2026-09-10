/**
 * Floating Global Intelligence Assistant — Pixel-Accurate Enterprise Edition
 *
 * Grounded conversational competitive-intelligence analyst anchored to the bottom-right corner.
 * Conforms to the 4-part Answer Contract:
 * 1. Strategic Answer
 * 2. Supporting Evidence & Metrics (with deep modal drilldown)
 * 3. Strategic Implication for HP
 * 4. Verified Source Citations
 *
 * Strict No-Hallucination UX: Communicates missing or insufficient evidence explicitly.
 */

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { sendRagQuery } from '@/lib/apiClient';
import { RagAnswer, RagQuery } from '@/types/rag';
import { TargetBrand } from '@/types/brands';
import { AnalyticalMonth } from '@/types/analytics';
import { BrandPill } from '@/components/ui/BrandPill';
import { DataStateBadge } from '@/components/ui/DataStateBadge';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Cpu,
} from 'lucide-react';
import { cn, formatTHB } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getVerifiedWorkingSourceUrl } from '@/lib/urlHelpers';

export interface RagAssistantProps {
  currentMonth: AnalyticalMonth;
  currentBrand: TargetBrand | 'All';
  isEvidenceModalOpen?: boolean;
  onOpenEvidence?: (
    metricId: string,
    metricName: string,
    brand: TargetBrand | 'All',
    skuId?: string
  ) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  queryText?: string;
  answer?: RagAnswer;
  error?: string;
}

const SUGGESTED_QUERIES = [
  'How does HP compare on online visibility?',
  'Which brands have the strongest paid-media presence?',
  'Which SKUs show the strongest price positioning?',
  "What evidence supports this month's SOV?",
  'What competitive threats are visible?',
  'Where is evidence insufficient?',
] as const;

export const RagAssistant: React.FC<RagAssistantProps> = ({
  currentMonth,
  currentBrand,
  isEvidenceModalOpen = false,
  onOpenEvidence,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<TargetBrand | 'All'>(currentBrand);
  const [activeMonth, setActiveMonth] = useState<AnalyticalMonth>(currentMonth);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setActiveBrand(currentBrand);
  }, [currentBrand]);

  useEffect(() => {
    setActiveMonth(currentMonth);
  }, [currentMonth]);

  const lastAssistantAnswer = [...messages]
    .reverse()
    .find((m) => m.sender === 'assistant' && m.answer)?.answer;

  const headerBadge = useMemo(() => {
    if (!lastAssistantAnswer?.generation) {
      return {
        label: 'Mistral AI • 1024-dim RAG',
        className: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400',
      };
    }
    const gen = lastAssistantAnswer.generation;
    if (gen.provider === 'mistral') {
      if (gen.status === 'fallback_model_generated') {
        return {
          label: `Mistral AI (${gen.model || 'ministral-8b'} fallback)`,
          className: 'bg-amber-950/60 border-amber-800/60 text-amber-400',
        };
      }
      return {
        label: `Mistral AI (${gen.model || 'ministral-14b'})`,
        className: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400',
      };
    }
    return {
      label: 'Analytical Baseline (Non-LLM)',
      className: 'bg-zinc-800/80 border-zinc-700/80 text-zinc-300',
    };
  }, [lastAssistantAnswer]);

  // Focus input on dialog open without forcibly auto-scrolling to the bottom of previous content
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleCopyAnswer = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleSendQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      queryText: text,
    };

    // Serialize bounded recent conversational turns (last 6-8 relevant natural-language turns)
    const recentHistory = messages
      .filter((m) => !m.error && ((m.sender === 'user' && m.queryText) || (m.sender === 'assistant' && m.answer?.answer)))
      .slice(-8)
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.sender === 'user' ? m.queryText!.trim() : m.answer!.answer.trim(),
      }))
      .filter((m) => m.content.length > 0);

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    // Smoothly scroll to bring the newly submitted question and incoming answer start into view
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 60);

    try {
      const payload: RagQuery = {
        query: text,
        brandFilter: activeBrand,
        monthFilter: activeMonth,
        history: recentHistory.length > 0 ? recentHistory : undefined,
      };

      const result = await sendRagQuery(payload);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        answer: result,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: err instanceof Error ? err.message : 'Unable to retrieve grounded intelligence.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendQuery(inputQuery);
    }
  };

  const handleResetConversation = () => {
    setMessages([]);
    setInputQuery('');
  };

  if (isEvidenceModalOpen) {
    return null;
  }

  return (
    <>
      {/* ── Floating Trigger Button (Bottom-Right) ───────────────────────────── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 font-sans">
          {/* Hover Tooltip */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 8, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#262626] text-xs font-medium text-white shadow-2xl select-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                <span>Ask Intelligence Assistant</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            id="floating-rag-button"
            type="button"
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Ask Intelligence Assistant"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white hover:bg-zinc-100 text-black shadow-2xl transition-colors group font-sans font-semibold text-xs border border-zinc-300 select-none"
          >
            <Sparkles className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
            <span className="tracking-tight">Ask Intelligence</span>
          </motion.button>
        </div>
      )}

      {/* ── Floating Chatbot Panel (Bottom-Right) ────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="Intelligence Assistant"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className={cn(
              'fixed z-40 bg-[#0e0e0e] border border-[#222222] rounded-[12px] shadow-2xl flex flex-col overflow-hidden font-sans transition-all duration-200',
              // Desktop & Tablet
              isMaximized
                ? 'bottom-4 right-4 w-[840px] max-w-[calc(100vw-2rem)] h-[840px] max-h-[calc(100vh-2rem)]'
                : 'bottom-6 right-6 w-[480px] max-w-[calc(100vw-3rem)] h-[660px] max-h-[calc(100vh-5rem)]',
              // Mobile full screen constraint
              'max-sm:inset-2 max-sm:w-auto max-sm:h-auto max-sm:rounded-[12px]'
            )}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#222222] bg-[#111111] shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-[6px] bg-[#161616] border border-[#262626] text-white">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                      Intelligence Assistant
                    </h3>
                    <span
                      className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border font-mono flex items-center gap-1 transition-colors',
                        headerBadge.className
                      )}
                    >
                      <Cpu className="w-3 h-3" />
                      {headerBadge.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    Grounded in 3,855 verified observations &amp; Analytical Metric Cube
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1.5">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetConversation}
                    title="Start New Conversation"
                    aria-label="Start New Conversation"
                    className="p-2 rounded-[6px] text-zinc-400 hover:text-white hover:bg-[#181818] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  title={isMaximized ? 'Restore Compact Size' : 'Maximize Assistant'}
                  aria-label={isMaximized ? 'Restore Compact Size' : 'Maximize Assistant'}
                  className="p-2 rounded-[6px] text-zinc-400 hover:text-white hover:bg-[#181818] transition-colors"
                >
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close Assistant (Esc)"
                  aria-label="Close Assistant"
                  className="p-2 rounded-[6px] text-zinc-400 hover:text-white hover:bg-[#181818] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Context Scope Indicator with Interactive Filters */}
            <div className="px-4 py-2 border-b border-[#222222] bg-[#090909] text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-2 shrink-0 font-sans">
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                <span className="text-zinc-500 uppercase text-[10px] font-semibold tracking-wider mr-1">Brand:</span>
                {(['All', 'HP', 'Epson', 'Canon', 'Brother'] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setActiveBrand(b)}
                    className={cn(
                      'text-[10px] font-mono px-2 py-0.5 rounded-[4px] border transition-colors',
                      activeBrand === b
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-[#141414] text-zinc-400 border-[#262626] hover:text-white'
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                <span className="text-zinc-500 uppercase text-[10px] font-semibold tracking-wider mr-1">Period:</span>
                {([
                  { id: '2026-06', label: 'JUN' },
                  { id: '2026-07', label: 'JUL' },
                  { id: '2026-08', label: 'AUG' },
                  { id: 'ALL', label: 'ALL 3M' },
                ] as const).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMonth(m.id as AnalyticalMonth)}
                    className={cn(
                      'text-[10px] font-mono px-2 py-0.5 rounded-[4px] border transition-colors',
                      activeMonth === m.id
                        ? 'bg-sky-500 text-white border-sky-400 font-bold'
                        : 'bg-[#141414] text-zinc-400 border-[#262626] hover:text-white'
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
              {/* First Open / Welcome Empty State */}
              {messages.length === 0 && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-[8px] bg-[#111111] border border-[#222222] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <ShieldCheck className="w-4 h-4 text-zinc-300" />
                      <span>Ask about the competitive landscape</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                      Ask questions across pricing, share of voice, promotions, ad creatives, and competitor moves in Thailand. All answers are grounded in verified observations with zero synthetic hallucinations.
                    </p>
                  </div>

                  {/* Suggested Query Chips */}
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase font-semibold text-zinc-500 block tracking-wider font-mono">
                      Suggested Strategic Queries:
                    </span>
                    <div className="space-y-1.5">
                      {SUGGESTED_QUERIES.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => void handleSendQuery(q)}
                          className="w-full text-left p-3 rounded-[6px] bg-[#111111] border border-[#222222] hover:border-[#333333] text-zinc-300 hover:text-white text-xs transition-colors flex items-center justify-between gap-3 group"
                        >
                          <span className="truncate">{q}</span>
                          <Zap className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white shrink-0 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Conversation History */}
              {messages.map((msg) => {
                if (msg.sender === 'user') {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end font-sans"
                    >
                      <div className="max-w-[85%] p-3.5 rounded-[10px] bg-[#1e1e1e] text-white space-y-1">
                        <div className="text-xs leading-relaxed font-medium">{msg.queryText}</div>
                        <span className="text-[10px] text-zinc-400 block text-right font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                    </motion.div>
                  );
                }

                if (msg.error) {
                  return (
                    <div key={msg.id} className="p-3.5 rounded-[8px] bg-[#141414] border border-[#262626] text-xs text-zinc-300 space-y-1">
                      <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-zinc-400" />
                        <span>Intelligence Query Interrupted</span>
                      </div>
                      <p className="text-xs text-zinc-400">{msg.error}</p>
                    </div>
                  );
                }

                const ans = msg.answer;
                if (!ans) return null;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 font-sans"
                  >
                    {/* 1. Grounded Answer Card */}
                    <div className="p-4 rounded-[8px] bg-[#111111] border border-[#222222] space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-[#222222] font-sans">
                        <span className="font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5 font-mono text-[11px]">
                          <FileText className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Grounded Answer</span>
                          {ans.generation && (
                            <span
                              className={cn(
                                'text-[9px] font-mono px-1.5 py-0.5 rounded tracking-normal normal-case font-normal border ml-1',
                                ans.generation.provider === 'mistral'
                                  ? ans.generation.status === 'fallback_model_generated'
                                    ? 'bg-amber-950/50 text-amber-300 border-amber-800/50'
                                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              )}
                            >
                              {ans.generation.provider === 'mistral'
                                ? `${ans.generation.model || 'Mistral'}${ans.generation.latency_ms ? ` • ${ans.generation.latency_ms}ms` : ''}`
                                : 'Analytical Cube Baseline'}
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <button
                            type="button"
                            onClick={() => void handleCopyAnswer(ans.answer || '', msg.id)}
                            className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-[#1f1f1f]"
                            title="Copy Grounded Answer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <span className="text-zinc-700">•</span>
                          <span>Confidence: {(ans.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-100 leading-relaxed whitespace-pre-line font-normal">
                        {ans.answer || 'No narrative text returned for this slice.'}
                      </div>
                    </div>

                    {/* 2. Strategic Implication for HP */}
                    {ans.implication_for_hp && (
                      <div className="p-3.5 rounded-[8px] bg-[#141414] border border-[#262626] space-y-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 block flex items-center gap-1.5 font-mono">
                          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Strategic Implication for HP</span>
                        </span>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {ans.implication_for_hp}
                        </p>
                      </div>
                    )}

                    {/* 3. Supporting Analytical Metrics */}
                    {ans.supporting_metrics && ans.supporting_metrics.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] uppercase font-semibold text-zinc-400 block tracking-wider font-mono">
                          Supporting Analytical Metrics ({ans.supporting_metrics.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ans.supporting_metrics.map((m, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-[6px] bg-[#111111] border border-[#222222] space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-zinc-400 truncate max-w-[130px] font-medium">
                                  {m.metric_name}
                                </span>
                                <BrandPill brand={m.brand} size="sm" />
                              </div>
                              <div className="flex items-center justify-between text-xs pt-0.5">
                                <span className="font-bold text-white font-mono tabular-nums">
                                  {m.value !== null
                                    ? m.unit === 'THB'
                                      ? formatTHB(m.value)
                                      : m.unit === '%'
                                      ? `${m.value}%`
                                      : m.value.toLocaleString()
                                    : 'NO DATA'}
                                </span>
                                <DataStateBadge state={m.data_state} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Supporting Evidence Records */}
                    {ans.supporting_evidence && ans.supporting_evidence.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] uppercase font-semibold text-zinc-400 block tracking-wider font-mono">
                          Supporting Evidence Records ({ans.supporting_evidence.length}):
                        </span>
                        <div className="space-y-2">
                          {ans.supporting_evidence.slice(0, 3).map((ev, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-[6px] bg-[#111111] border border-[#222222] space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <BrandPill brand={ev.brand} size="sm" />
                                  <span className="text-zinc-400 font-medium">{ev.platform}</span>
                                </div>
                                <span className="text-zinc-500 font-mono text-[11px]">{ev.date}</span>
                              </div>
                              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 font-normal">
                                {ev.snippet}
                              </p>
                              <div className="flex items-center justify-between pt-1.5 border-t border-[#1c1c1c] text-[11px]">
                                <span className="text-zinc-500 font-mono truncate max-w-[140px]">
                                  {ev.evidence_id}
                                </span>
                                {onOpenEvidence && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onOpenEvidence(
                                        'TOTAL_VISIBILITY_TOUCHPOINTS',
                                        'Supporting Evidence',
                                        ev.brand
                                      )
                                    }
                                    className="text-zinc-300 hover:text-white flex items-center gap-1 font-medium"
                                  >
                                    <span>Inspect Evidence</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. Sources & Citations */}
                    {ans.sources && ans.sources.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] uppercase font-semibold text-zinc-400 block tracking-wider font-mono">
                          Verified Sources ({ans.sources.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {ans.sources.map((src, idx) => (
                            <a
                              key={idx}
                              href={getVerifiedWorkingSourceUrl(src)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-[4px] bg-[#111111] border border-[#222222] hover:border-[#333333] text-zinc-300 hover:text-white text-[11px] inline-flex items-center gap-1.5 transition-colors font-medium"
                            >
                              <span className="truncate max-w-[170px]">{src.title}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="p-4 rounded-[8px] bg-[#111111] border border-[#222222] flex items-center gap-3 text-xs text-zinc-300 font-sans">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Synthesizing evidence and computing cube metrics…</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3.5 border-t border-[#222222] bg-[#111111] shrink-0 font-sans">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSendQuery(inputQuery);
                }}
                className="space-y-2.5"
              >
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyDown={handleKeyDownInput}
                    disabled={isLoading}
                    rows={2}
                    placeholder="Ask a grounded question (Enter to submit, Shift+Enter for newline)..."
                    className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-white rounded-[6px] px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors resize-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Enter to submit • Shift + Enter for newline</span>
                  <button
                    type="submit"
                    disabled={isLoading || !inputQuery.trim()}
                    className="px-4 py-1.5 rounded-[4px] bg-white hover:bg-zinc-200 disabled:opacity-40 text-black font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {isLoading ? (
                      <span className="animate-spin w-3 h-3 border border-black border-t-transparent rounded-full" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
