/**
 * Section 9: Web Intelligence & Internet Evidence Acquisition Layer (Luxury Enterprise Edition with Framer Motion)
 * Interactive domain discovery, crawlability diagnostics, and web evidence ingestion.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { BrandPill } from '@/components/ui/BrandPill';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  fetchWebDiagnostics,
  startWebCrawl,
  fetchWebCrawlHistory,
  WebDiagnosticsData,
  WebCrawlResponse,
} from '@/lib/apiClient';
import { TargetBrand } from '@/types/brands';
import { TARGET_BRANDS } from '@/config/brands';
import {
  Search,
  Play,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Info,
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

interface WebIntelligenceSectionProps {
  onEvidenceCreated?: () => void;
}

const PRESET_DEMO_URLS = [
  {
    label: 'HP Official (Direct HTTP / Static)',
    url: 'https://www.hp.com/th-th/printers/smart-tank-580.html',
    type: 'OFFICIAL_BRAND',
  },
  {
    label: 'Shopee Mall (Marketplace / Proxy Required)',
    url: 'https://shopee.co.th/hp_official_store/smart_tank_580',
    type: 'MARKETPLACE',
  },
  {
    label: 'JIB Thailand (Retailer / Render Required)',
    url: 'https://www.jib.co.th/web/product/readProduct/55490/HP-SMART-TANK-580',
    type: 'RETAILER',
  },
  {
    label: 'Search Query (Discovery Mode)',
    url: 'HP Smart Tank 580 Thailand price',
    type: 'SEARCH_QUERY',
  },
] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export const WebIntelligenceSection: React.FC<WebIntelligenceSectionProps> = ({
  onEvidenceCreated,
}) => {
  const [targetInput, setTargetInput] = useState('https://www.hp.com/th-th/printers/smart-tank-580.html');
  const [selectedBrand, setSelectedBrand] = useState<TargetBrand | 'All'>('HP');
  const [strategy, setStrategy] = useState<string>('AUTO');
  const [maxPages, setMaxPages] = useState<number>(5);

  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnostics, setDiagnostics] = useState<WebDiagnosticsData | null>(null);
  const [diagError, setDiagError] = useState<string | null>(null);

  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlResult, setCrawlResult] = useState<WebCrawlResponse | null>(null);
  const [crawlError, setCrawlError] = useState<string | null>(null);

  const [history, setHistory] = useState<Record<string, unknown>[]>([]);

  const loadHistory = async () => {
    try {
      const res = await fetchWebCrawlHistory(6);
      setHistory(res.sessions);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const handleRunDiagnostics = async () => {
    const url = targetInput.trim();
    if (!url || !url.startsWith('http')) {
      setDiagError('Please enter a valid HTTP/HTTPS URL to diagnose domain crawlability.');
      return;
    }

    setIsDiagnosing(true);
    setDiagError(null);
    setDiagnostics(null);

    try {
      const data = await fetchWebDiagnostics(url);
      setDiagnostics(data);
    } catch (err) {
      setDiagError(err instanceof Error ? err.message : 'Diagnostics probe failed.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleLaunchCrawl = async () => {
    const input = targetInput.trim();
    if (!input) return;

    setIsCrawling(true);
    setCrawlError(null);
    setCrawlResult(null);

    try {
      const isUrl = input.startsWith('http://') || input.startsWith('https://');
      const payload = isUrl
        ? {
            seedUrls: [input],
            brand: selectedBrand === 'All' ? undefined : selectedBrand,
            maxPages,
            strategy,
          }
        : {
            query: input,
            brand: selectedBrand === 'All' ? undefined : selectedBrand,
            maxPages,
            strategy,
          };

      const result = await startWebCrawl(payload);
      setCrawlResult(result);
      void loadHistory();
      if (onEvidenceCreated && result.summary.evidence_created > 0) {
        onEvidenceCreated();
      }
    } catch (err) {
      setCrawlError(err instanceof Error ? err.message : 'Crawl execution failed.');
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7 font-sans"
    >
      {/* Section Header */}
      <SectionHeader
        title="Internet Evidence Acquisition & Discovery"
        subtitle="SSRF-protected HTTP crawling, robots.txt compliance, and automated proxy escalation."
        badge="DISCOVERY CONSOLE"
      />

      {/* Target Input & Action Console Card */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 space-y-5 bg-[#0c0c0e]/90 border-zinc-800 rounded-xl shadow-md">
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-400" />
              <span>Target Web URL or Discovery Query</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="https://example.com/product/hp-smart-tank-580 or query..."
                  className="w-full bg-zinc-950/80 border border-zinc-700/80 focus:border-white rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors font-sans"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleRunDiagnostics}
                  disabled={isDiagnosing || !targetInput.trim()}
                  className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-zinc-750 shrink-0 w-1/2 sm:w-auto"
                >
                  {isDiagnosing ? (
                    <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Activity className="w-4 h-4 text-zinc-400" />
                  )}
                  <span>Diagnose</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleLaunchCrawl}
                  disabled={isCrawling || !targetInput.trim()}
                  className="px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shrink-0 w-1/2 sm:w-auto"
                >
                  {isCrawling ? (
                    <>
                      <span className="animate-spin w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full" />
                      <span>Acquiring…</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Acquire Evidence</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Configuration Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase text-zinc-400 font-semibold mr-1">Brand Filter:</span>
              <button
                type="button"
                onClick={() => setSelectedBrand('All')}
                className={`px-3 py-1 rounded-full text-xs font-sans font-medium transition-all ${
                  selectedBrand === 'All'
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
                }`}
              >
                ALL
              </button>
              {TARGET_BRANDS.map((b) => (
                <span key={b} onClick={() => setSelectedBrand(selectedBrand === b ? 'All' : b)} className="cursor-pointer">
                  <BrandPill
                    brand={b}
                    size="sm"
                    active={selectedBrand === 'All' || selectedBrand === b}
                  />
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Strategy:</span>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-sans"
                >
                  <option value="AUTO">AUTO (Escalating)</option>
                  <option value="DIRECT_HTTP">DIRECT_HTTP</option>
                  <option value="BRIGHTDATA_UNLOCKER">BRIGHTDATA_UNLOCKER</option>
                  <option value="BRIGHTDATA_BROWSER">BRIGHTDATA_BROWSER</option>
                  <option value="APIFY_HTTP">APIFY_HTTP</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Max Pages:</span>
                <select
                  value={maxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value, 10))}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-sans"
                >
                  <option value={1}>1 Page</option>
                  <option value={5}>5 Pages</option>
                  <option value={10}>10 Pages</option>
                  <option value={20}>20 Pages</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preset Demonstration Targets */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <span className="text-xs uppercase font-semibold text-zinc-400 block font-mono">Demonstration Seed Targets:</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_DEMO_URLS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTargetInput(p.url)}
                  className="px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs transition-colors text-left flex items-center gap-2 font-sans shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Diagnostics View Panel */}
      {diagError && (
        <Card className="p-4 border-zinc-700 bg-zinc-950 text-zinc-200 text-xs flex items-center gap-2.5 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-zinc-300 shrink-0" />
          <span>{diagError}</span>
        </Card>
      )}

      {diagnostics && (
        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-4 border-zinc-700/80 bg-[#0c0c0e]/90 rounded-xl shadow-md">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 font-mono">
                <Activity className="w-4 h-4 text-zinc-300" />
                <span>Domain Crawlability Assessment: {diagnostics.domain}</span>
              </h3>
              <span className="text-xs text-zinc-400 font-mono">{diagnostics.diagnosed_at}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Crawlability</span>
                <span className="text-xs font-bold text-white mt-1 block">
                  {diagnostics.crawlability_status}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Robots Policy</span>
                <span className="text-xs font-bold text-white mt-1 block">
                  {diagnostics.robots_status}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">HTTP Status</span>
                <span className="text-xs font-bold text-zinc-200 mt-1 block font-mono tabular-nums">
                  {diagnostics.http_status ? `HTTP ${diagnostics.http_status}` : 'BLOCKED / UNREACHABLE'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Recommended Strategy</span>
                <span className="text-xs font-bold text-white truncate mt-1 block">
                  {diagnostics.recommended_strategy}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <div className="font-sans leading-relaxed">
                <strong className="text-white font-mono uppercase text-xs mr-1.5">Routing Rationale:</strong>
                <span className="text-zinc-400">{diagnostics.recommendation_reason}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Crawl Result View Panel */}
      {crawlError && (
        <Card className="p-4 border-zinc-700 bg-zinc-950 text-zinc-200 text-xs flex items-center gap-2.5 rounded-xl">
          <XCircle className="w-4 h-4 text-zinc-300 shrink-0" />
          <span>{crawlError}</span>
        </Card>
      )}

      {crawlResult && (
        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-4 border-zinc-700 bg-[#0c0c0e]/90 rounded-xl shadow-md font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase font-mono">Crawl Executed: {crawlResult.crawlId}</h3>
                  <span className="text-xs text-zinc-400">Status: {crawlResult.status}</span>
                </div>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-200 font-semibold self-start sm:self-auto">
                INTEGRATED INTO EVIDENCE LAKE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">URLs Discovered</span>
                <span className="text-base font-bold text-zinc-200 font-mono tabular-nums">{crawlResult.summary.discovered_urls}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">URLs Acquired</span>
                <span className="text-base font-bold text-white font-mono tabular-nums">{crawlResult.summary.acquired_urls}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Evidence Created</span>
                <span className="text-base font-bold text-white font-mono tabular-nums">+{crawlResult.summary.evidence_created}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Contamination Filtered</span>
                <span className="text-base font-bold text-zinc-400 font-mono tabular-nums">{crawlResult.summary.evidence_rejected}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recent Crawl Sessions Table */}
      <motion.div variants={itemVariants} className="space-y-3 font-sans">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2 font-mono">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span>Recent Web Crawl Sessions ({history.length})</span>
        </h3>

        {history.length === 0 ? (
          <Card className="p-8 text-center text-xs text-zinc-400 bg-[#0c0c0e]/90 border-zinc-800 rounded-xl font-sans">
            No internet crawl sessions executed yet. Enter a URL above and launch an acquisition.
          </Card>
        ) : (
          <Card className="overflow-hidden bg-[#0c0c0e]/90 border-zinc-800 rounded-xl shadow-md p-0 font-sans">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[11px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Crawl ID</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Started</th>
                    <th className="px-5 py-3 font-semibold">Target</th>
                    <th className="px-5 py-3 font-semibold text-right">Acquired</th>
                    <th className="px-5 py-3 font-semibold text-right">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {history.map((s, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white font-mono">{String(s.crawl_id)}</td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-900 border border-zinc-700 text-zinc-200">
                          {String(s.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-400 text-xs font-mono">{String(s.started_at).split('T')[0]}</td>
                      <td className="px-5 py-3 text-zinc-300 truncate max-w-[220px]">
                        {Array.isArray(s.requested_targets) ? s.requested_targets[0] : 'Search Query'}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-zinc-300 font-mono">
                        {Array.isArray(s.acquired_urls) ? s.acquired_urls.length : 0}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-bold text-white font-mono">
                        +{Number(s.evidence_created || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
};
