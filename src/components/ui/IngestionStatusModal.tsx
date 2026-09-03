/**
 * Ingestion Status & Operational Modal — Luxury Enterprise Edition with Framer Motion
 * Displays provider health, crawl scope, credential isolation, and targeted crawler execution.
 */

'use client';

import React, { useState } from 'react';
import { IngestionHealthResponse, triggerIngestion } from '@/lib/apiClient';
import { TargetBrand } from '@/types/brands';
import { TARGET_BRANDS } from '@/config/brands';
import { BrandPill } from './BrandPill';
import { InfoTooltip } from './InfoTooltip';
import {
  X,
  Database,
  Play,
  Activity,
  CheckCircle2,
  Clock,
  Shield,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IngestionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: IngestionHealthResponse | null;
  onIngestionCompleted?: () => void;
}

export const IngestionStatusModal: React.FC<IngestionStatusModalProps> = ({
  isOpen,
  onClose,
  health,
  onIngestionCompleted,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<TargetBrand | 'All'>('HP');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlResult, setCrawlResult] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState('');

  const handleRunCrawl = async () => {
    setIsCrawling(true);
    setCrawlResult(null);

    try {
      const options =
        selectedBrand === 'All'
          ? { all: true, passphrase }
          : { brand: selectedBrand, passphrase };

      const res = await triggerIngestion(options);
      setCrawlResult(
        `Ingestion Completed (${res.status}): ${res.records_accepted || res.accepted || 0} observations accepted, ${res.duplicates || 0} duplicates deduplicated.`
      );
      if (onIngestionCompleted) {
        onIngestionCompleted();
      }
    } catch (err) {
      setCrawlResult(err instanceof Error ? err.message : 'Crawler execution failed.');
    } finally {
      setIsCrawling(false);
    }
  };

  const apifyStatus = health?.providers.apify.status || 'NOT_CONFIGURED';
  const brightDataStatus = health?.providers.brightdata.status || 'NOT_CONFIGURED';
  const totalEvidence = health?.evidence_lake.total_records || 0;
  const lastIngestion = health?.last_ingestion;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="relative w-full max-w-2xl bg-[#0c0c0e]/95 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white shadow-inner">
                  <Database className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                      Crawler Operations &amp; Provider Health
                    </h2>
                    <InfoTooltip
                      title="Crawler Architecture"
                      content="Automated ingestion runners query public search, ad libraries, and e-commerce stores via configured API providers. Live data availability depends on provider connectivity."
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    Targeted seed ingestion, upstream provider health, and evidence synchronization
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-sans text-xs">
              {/* Security & Credential Isolation Notice */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                <Lock className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                <div className="space-y-1 text-zinc-400 text-xs leading-relaxed">
                  <strong className="text-white font-semibold block">
                    Server-Side Security &amp; Credential Isolation
                  </strong>
                  <p>
                    API tokens for Apify and Bright Data reside strictly in <code className="text-white font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-[11px]">.env.local</code> on the server. No credentials or secret keys are ever transmitted to the browser client.
                  </p>
                </div>
              </div>

              {/* Provider Health Cards */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2 font-mono">
                  <Activity className="w-4 h-4 text-zinc-400" />
                  <span>Upstream Provider Status</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Apify */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Apify Provider</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-200 font-bold">
                        {apifyStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                      Meta Ad Library, Google Ads, YouTube, Facebook, Instagram, TikTok Shop
                    </p>
                  </div>

                  {/* Bright Data */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Bright Data</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-200 font-bold">
                        {brightDataStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                      Shopee Mall, LazMall, JIB Thailand Web Unlocker sessions
                    </p>
                  </div>
                </div>
              </div>

              {/* Evidence Lake Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80 text-xs">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold tracking-wider font-mono">Total Verified Observations</span>
                  <span className="text-lg font-bold text-white font-mono mt-1 block tabular-nums">
                    {totalEvidence.toLocaleString()} records
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold tracking-wider font-mono">Last Synchronization Run</span>
                  <span className="text-zinc-300 font-mono text-xs mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    {lastIngestion?.completed_at ? lastIngestion.completed_at.replace('T', ' ').substring(0, 19) : 'None'}
                  </span>
                </div>
              </div>

              {/* Targeted Ingestion Control */}
              <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-700/80 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Play className="w-4 h-4 text-zinc-300" />
                  <span>Trigger Targeted Seed Ingestion</span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  Executes the 33 official seed targets specified in <code className="text-white bg-zinc-900 px-1.5 py-0.5 rounded font-mono">src/config/seeds.ts</code>. Arbitrary full-web scraping is strictly prohibited.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBrand('All')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedBrand === 'All'
                        ? 'bg-white text-zinc-950 font-semibold shadow-md'
                        : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
                    }`}
                  >
                    All Brands (33 Seeds)
                  </button>
                  {TARGET_BRANDS.map((brand) => (
                    <BrandPill
                      key={brand}
                      brand={brand}
                      size="sm"
                      active={selectedBrand === brand}
                      onClick={() => setSelectedBrand(brand)}
                    />
                  ))}
                </div>

                {/* Optional Passphrase */}
                <div className="flex items-center gap-2.5 pt-1">
                  <Shield className="w-4 h-4 text-zinc-500 shrink-0" />
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Access Passphrase (if configured in .env.local)"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                  <span className="text-xs text-zinc-400">
                    Target: <strong className="text-white font-semibold">{selectedBrand}</strong>
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={handleRunCrawl}
                    disabled={isCrawling}
                    className="px-5 py-2 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-white/5"
                  >
                    {isCrawling ? (
                      <>
                        <span className="animate-spin w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full" />
                        <span>Executing Ingestion…</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Execute Targeted Ingestion</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {crawlResult && (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-700/80 text-xs text-zinc-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-mono text-xs">{crawlResult}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-850 bg-zinc-950/80 flex items-center justify-between text-xs font-sans text-zinc-500">
              <span>SERVER-ISOLATED ARCHITECTURE • ZERO CLIENT KEY EXPOSURE</span>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors border border-zinc-700"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
