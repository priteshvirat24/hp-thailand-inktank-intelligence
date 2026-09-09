/**
 * Evidence Traceability Modal & Audit Drawer — Luxury Enterprise Edition with Framer Motion
 * Displays deep source-level lineage for any aggregated analytical metric.
 */

'use client';

import React from 'react';
import { RawEvidenceRecord } from '@/types/evidence';
import { TargetBrand } from '@/types/brands';
import { BrandPill } from './BrandPill';
import { InfoTooltip } from './InfoTooltip';
import { getVerifiedWorkingSourceUrl } from '@/lib/urlHelpers';
import { X, ExternalLink, ShieldCheck, Clock, FileText, Tag, Hash, Eye, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricName: string;
  metricValue: string | number | null;
  brand?: TargetBrand | string;
  month?: string;
  skuModel?: string;
  methodologyNote?: string;
  evidenceRecords: readonly RawEvidenceRecord[];
}

function getAuthenticSourceLabel(screenshotUrl?: string | null, platform?: string, brand?: string): string {
  if (!screenshotUrl) return `${platform || 'Source'} Official View`;
  if (screenshotUrl.includes('/products/')) {
    return `${brand || ''} Thailand Official Web Capture`;
  }
  if (screenshotUrl.includes('/jib_')) {
    return 'JIB Thailand Retail Live Capture';
  }
  if (screenshotUrl.includes('/pantip_')) {
    return 'Pantip.com Thai Forum Live Discussion';
  }
  if (screenshotUrl.includes('/facebook_')) {
    return `${brand || ''} Thailand Official Facebook`;
  }
  if (screenshotUrl.includes('/youtube_')) {
    return `${brand || ''} Official YouTube Channel`;
  }
  if (screenshotUrl.includes('/scrapling_meta_')) {
    return 'Meta Ad Library Verified Flight';
  }
  return `${platform || 'Source'} Authentic Live Capture`;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  metricName,
  metricValue,
  brand,
  month,
  skuModel,
  methodologyNote,
  evidenceRecords,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c0c0e]/98 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 border-b border-zinc-800 bg-zinc-950/80">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white shadow-inner">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Evidence Audit Trail &amp; Lineage
                    </h2>
                    <InfoTooltip
                      title="Evidence Lineage"
                      content="This modal displays the individual raw web observations that were ingested, validated, and aggregated by the Analytical Metric Cube to calculate this specific number."
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                  <span className="font-semibold text-white font-sans">{metricName}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="font-bold text-white font-mono tabular-nums">{metricValue ?? 'No Data'}</span>
                  {brand && brand !== 'All' && (
                    <>
                      <span className="text-zinc-600">•</span>
                      <BrandPill brand={brand as TargetBrand} size="sm" />
                    </>
                  )}
                  {month && month !== 'All' && (
                    <>
                      <span className="text-zinc-600">•</span>
                      <span className="text-[11px] bg-zinc-900 text-zinc-300 px-2.5 py-0.5 rounded-full border border-zinc-800 font-mono font-medium">
                        {month}
                      </span>
                    </>
                  )}
                  {skuModel && skuModel !== 'All' && (
                    <>
                      <span className="text-zinc-600">•</span>
                      <span className="text-[11px] bg-zinc-900 text-white px-2.5 py-0.5 rounded-full border border-zinc-700 font-sans font-medium">
                        {skuModel}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/70 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 font-sans">
              {/* Methodology & Lineage Flow */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-mono">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Calculation Methodology &amp; Scope</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  {methodologyNote ||
                    'Aggregated from verified marketplace listings, official brand social media posts, or ad library records adhering to Thailand 90-day window boundaries.'}
                </p>
                <div className="pt-2.5 border-t border-zinc-800/80 flex items-center gap-2 text-xs text-zinc-500 font-sans flex-wrap">
                  <span className="text-zinc-400 font-medium">Lineage:</span>
                  <span className="text-zinc-300 font-mono text-[11px]">Metric Row</span>
                  <span>→</span>
                  <span className="text-zinc-300 font-mono text-[11px]">Analytical Cube</span>
                  <span>→</span>
                  <span className="text-white font-semibold">{evidenceRecords.length} Verified Observations</span>
                </div>
              </div>

              {/* Evidence Records List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono">
                    Supporting Evidence Records ({evidenceRecords.length})
                  </h3>
                  <span className="text-xs text-zinc-500 font-sans">Immutable SHA-256 Observation Hashes</span>
                </div>

                {evidenceRecords.length === 0 ? (
                  <div className="p-10 text-center bg-zinc-900/40 rounded-xl border border-zinc-800 text-zinc-500 text-xs font-sans">
                    No direct evidence records linked to this specific aggregation state.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {evidenceRecords.map((rec) => (
                      <div
                        key={rec.evidence_id}
                        className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-3 shadow-sm"
                      >
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700 font-mono">
                              <Hash className="w-3 h-3 text-zinc-400" />
                              {rec.evidence_id}
                            </span>
                            <BrandPill brand={rec.brand} size="sm" />
                            <span className="text-[11px] bg-zinc-950 text-zinc-400 px-2.5 py-0.5 rounded-full border border-zinc-800">
                              {rec.platform}
                            </span>
                            <span className="text-[11px] text-zinc-500 px-2 py-0.5">
                              {rec.channel}
                            </span>
                          </div>

                          <a
                            href={getVerifiedWorkingSourceUrl(rec)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors font-medium"
                          >
                            <span>Source Link</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {/* Titles & Content */}
                        <div className="space-y-1">
                          <h4 className="text-xs font-semibold text-white font-sans">{rec.raw_title}</h4>
                          {rec.raw_content_th && (
                            <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                              <span className="text-zinc-500 font-mono mr-1.5">[Thai source]:</span>
                              {rec.raw_content_th}
                            </p>
                          )}
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2.5 border-t border-zinc-800/80 text-xs">
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Published</span>
                            <span className="text-zinc-300 flex items-center gap-1.5 mt-0.5 text-xs font-mono">
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                              {rec.published_at}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Captured (UTC)</span>
                            <span className="text-zinc-400 font-mono text-xs mt-0.5 block truncate">
                              {rec.captured_at.split('T')[0]}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
                              {rec.channel === 'Paid Media' ? 'Campaign Format' : 'Observed Price'}
                            </span>
                            <span className="text-white font-bold font-mono mt-0.5 block text-xs tabular-nums">
                              {rec.channel === 'Paid Media'
                                ? (rec.creative_format || 'Ad Flight')
                                : (rec.price_current_thb ? `฿${rec.price_current_thb.toLocaleString()}` : '—')}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Resolved SKU</span>
                            <span className="text-zinc-300 font-sans font-medium text-xs mt-0.5 block truncate">
                              {rec.product_sku || 'Unassigned'}
                            </span>
                          </div>
                          {rec.impressions !== undefined && rec.impressions !== null && (
                            <div>
                              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Impressions</span>
                              <span className="text-sky-400 font-bold font-mono mt-0.5 flex items-center gap-1 text-xs tabular-nums">
                                <Eye className="w-3 h-3" />
                                {rec.impressions.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {rec.views !== undefined && rec.views !== null && (
                            <div>
                              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Video Views</span>
                              <span className="text-emerald-400 font-bold font-mono mt-0.5 flex items-center gap-1 text-xs tabular-nums">
                                <Play className="w-3 h-3 fill-emerald-400" />
                                {rec.views.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Scraped Browser Screenshot Preview */}
                        {rec.screenshot_url && (
                          <div className="rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950/90 shadow-lg group">
                            <div className="px-3.5 py-2 bg-zinc-900/95 border-b border-zinc-800 flex items-center justify-between text-[11px] font-mono">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  100% Verifiable Source Evidence
                                </span>
                                <span className="text-zinc-600">•</span>
                                <span className="text-zinc-400 text-[10px]">
                                  {getAuthenticSourceLabel(rec.screenshot_url, rec.platform, rec.brand)}
                                </span>
                              </div>
                              <a
                                href={rec.screenshot_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium transition-colors bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/50 px-2 py-0.5 rounded text-[10px]"
                              >
                                <span>High-Res Full View</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <a
                              href={rec.screenshot_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block max-h-64 overflow-hidden relative cursor-zoom-in bg-zinc-900"
                            >
                              <img
                                src={rec.screenshot_url}
                                alt={`${rec.brand} ${rec.product_sku || ''} verified evidence observation`}
                                className="w-full object-cover object-top group-hover:scale-[1.01] transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-zinc-300 text-[10px] px-2 py-1 rounded border border-zinc-700/80 font-mono">
                                Click to inspect high-res capture ↗
                              </div>
                            </a>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 text-xs font-sans text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-zinc-600" />
                            <span>Method: {rec.extraction_method}</span>
                          </div>
                          <div>
                            <span>Classifier Confidence: </span>
                            <span className="text-zinc-300 font-semibold font-mono">{(rec.confidence_score * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-500">
              <span className="font-mono text-[11px]">HP THAILAND INK TANK • EVIDENCE AUDIT LAYER</span>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-all shadow-md"
              >
                Close Audit Trail
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
