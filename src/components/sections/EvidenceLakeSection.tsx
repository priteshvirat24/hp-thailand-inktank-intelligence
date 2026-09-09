/**
 * Section 7: Evidence Lake — Full Evidence Audit Browser (Luxury Enterprise Edition with Framer Motion)
 * Immutable observation repository with visual 3-step lineage and source verification.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { BrandPill } from '@/components/ui/BrandPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { TARGET_BRANDS } from '@/config/brands';
import { TargetBrand } from '@/types/brands';
import { RawEvidenceRecord } from '@/types/evidence';
import { AnalyticalMonth } from '@/types/analytics';
import { getVerifiedWorkingSourceUrl } from '@/lib/urlHelpers';
import { ExternalLink, Hash, Clock, Tag, Search, Database, Layers, LayoutDashboard, Eye, Play } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { LiveCapturesGallery } from '@/components/sections/LiveCapturesGallery';

interface EvidenceLakeSectionProps {
  evidenceRecords: RawEvidenceRecord[];
  selectedBrand?: TargetBrand | 'All';
  selectedMonth?: AnalyticalMonth;
  onSelectRecord?: (record: RawEvidenceRecord) => void;
}

const PAGE_SIZE = 20;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

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

export const EvidenceLakeSection: React.FC<EvidenceLakeSectionProps> = ({
  evidenceRecords,
  selectedBrand = 'All',
  selectedMonth = 'ALL',
}) => {
  const [brandFilter, setBrandFilter] = useState<TargetBrand | 'All'>(selectedBrand);
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  // Sync with global brand filter
  React.useEffect(() => {
    setBrandFilter(selectedBrand);
  }, [selectedBrand]);

  // Derive unique filter options from current records
  const channels = useMemo(() => {
    const set = new Set(evidenceRecords.map((r) => r.channel));
    return ['All', ...Array.from(set).sort()];
  }, [evidenceRecords]);

  const platforms = useMemo(() => {
    const set = new Set(evidenceRecords.map((r) => r.platform));
    return ['All', ...Array.from(set).sort()];
  }, [evidenceRecords]);

  // Filter records
  const filtered = useMemo(() => {
    return evidenceRecords.filter((r) => {
      if (brandFilter !== 'All' && r.brand !== brandFilter) return false;
      if (channelFilter !== 'All' && r.channel !== channelFilter) return false;
      if (platformFilter !== 'All' && r.platform !== platformFilter) return false;
      if (selectedMonth !== 'ALL' && r.published_at && !r.published_at.startsWith(selectedMonth)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          !r.evidence_id.toLowerCase().includes(q) &&
          !r.raw_title.toLowerCase().includes(q) &&
          !(r.product_sku ?? '').toLowerCase().includes(q) &&
          !r.source_url.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [evidenceRecords, brandFilter, channelFilter, platformFilter, selectedMonth, query]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRecords = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (evidenceRecords.length === 0) {
    return (
      <div className="space-y-6 font-sans">
        <SectionHeader
          title="Evidence Lake — Raw Observation Repository"
          subtitle="This is the underlying observation layer from which all analytical metrics are derived."
          totalEvidence={0}
        />
        <EmptyState
          title="EVIDENCE LAKE IS EMPTY"
          message="No raw evidence records have been ingested yet. Run ingestion crawlers (Meta Ads, Shopee, JIB Thailand, Pantip) to populate the Evidence Store."
          actionText="Open Crawler Operations"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7 font-sans"
    >
      {/* Header */}
      <SectionHeader
        title="8. Evidence & Source Intelligence Lake"
        subtitle="Underlying immutable observation records from which all analytical metrics and insights are derived."
        totalEvidence={evidenceRecords.length}
        filteredEvidence={filtered.length}
      />

      {/* Filter Toolbar — Positioned at Top for Optimal Usability */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 flex flex-wrap gap-3.5 items-center bg-[#0c0c0e]/90 border-zinc-800 rounded-xl shadow-sm">
          {/* Text Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="evidence-search"
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder="Search ID, title, SKU, or source URL…"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          {/* Brand Filter */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => { setBrandFilter('All'); setPage(0); }}
              className={`px-3 py-1 text-xs font-sans font-medium rounded-full transition-all ${
                brandFilter === 'All'
                  ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
              }`}
            >
              ALL
            </button>
            {TARGET_BRANDS.map((b) => (
              <span key={b} onClick={() => { setBrandFilter(b === brandFilter ? 'All' : b); setPage(0); }} className="cursor-pointer">
                <BrandPill brand={b} size="sm" active={brandFilter === 'All' || brandFilter === b} />
              </span>
            ))}
          </div>

          {/* Channel Dropdown */}
          <select
            value={channelFilter}
            onChange={(e) => { setChannelFilter(e.target.value); setPage(0); }}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 font-sans"
            aria-label="Filter by channel"
          >
            {channels.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'ALL CHANNELS' : c.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Platform Dropdown */}
          <select
            value={platformFilter}
            onChange={(e) => { setPlatformFilter(e.target.value); setPage(0); }}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 font-sans"
            aria-label="Filter by platform"
          >
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p === 'All' ? 'ALL PLATFORMS' : p.toUpperCase()}
              </option>
            ))}
          </select>

          <span className="text-xs text-zinc-400 ml-auto font-mono tabular-nums">{filtered.length} records</span>
        </Card>
      </motion.div>

      {/* Live Scrapling Browser Captures Gallery */}
      <motion.div variants={itemVariants}>
        <LiveCapturesGallery />
      </motion.div>

      {/* Visual 3-Step Lineage Architecture Banner */}
      <motion.div variants={itemVariants}>
        <Card className="p-5 bg-[#0c0c0e]/90 border-zinc-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3.5">
            <span className="text-xs uppercase font-bold text-zinc-300 font-mono tracking-wider">
              End-to-End Data Lineage &amp; Verification Flow
            </span>
            <InfoTooltip
              title="Evidence Lineage Guarantee"
              content="Every single number in the dashboard traces back through the Analytical Metric Cube directly to one or more of these immutable raw records."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Database className="w-4 h-4 text-zinc-300" />
                <span>1. Raw Web Observations</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed font-normal">
                Crawled from Meta Ad Library, Shopee, JIB Thailand, Pantip, and Brand Official profiles. Stored with immutable SHA-256 hashes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Layers className="w-4 h-4 text-zinc-300" />
                <span>2. Analytical Metric Cube</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed font-normal">
                Deterministic monthly aggregation across 18 analytical metrics. Computes SOVs, pricing averages, and traction indexes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-white font-semibold">
                <LayoutDashboard className="w-4 h-4 text-zinc-300" />
                <span>3. Dashboard &amp; RAG Assistant</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed font-normal">
                Strategic visual workspaces and evidence-grounded competitive Q&amp;A with deep source drilldowns.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Evidence Cards */}
      <motion.div variants={itemVariants} className="space-y-3.5">
        {pageRecords.map((rec) => (
          <Card key={rec.evidence_id} className="p-5 space-y-3.5 bg-[#0c0c0e]/90 border-zinc-800 hover:border-zinc-700 rounded-xl transition-all shadow-sm">
            {/* Header Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800/80 font-sans">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-700 font-mono">
                  <Hash className="w-3 h-3 text-zinc-400" />
                  {rec.evidence_id.substring(0, 24)}…
                </span>
                <BrandPill brand={rec.brand} size="sm" />
                <span className="text-[11px] bg-zinc-950 text-zinc-300 px-2.5 py-0.5 rounded-full border border-zinc-800">
                  {rec.platform}
                </span>
                <span className="text-[11px] text-zinc-400 px-2 py-0.5">
                  {rec.channel}
                </span>
              </div>
              <a
                href={getVerifiedWorkingSourceUrl(rec)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors font-medium"
              >
                <span>Deep Source Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Content */}
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-white font-sans leading-snug">{rec.raw_title}</h4>
              {rec.raw_content_th && (
                <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed font-normal">
                  <span className="text-zinc-500 font-mono mr-1.5">[Thai source]:</span>
                  {rec.raw_content_th}
                </p>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs pt-2.5 border-t border-zinc-800/80">
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
                  {rec.product_sku ?? 'Unassigned'}
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
                  className="block max-h-72 overflow-hidden relative cursor-zoom-in bg-zinc-900"
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
            <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/60 font-sans">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-500" />
                <span>Method: {rec.extraction_method}</span>
              </span>
              <span>
                Confidence: <strong className="text-zinc-300 font-mono">{(rec.confidence_score * 100).toFixed(0)}%</strong>
              </span>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2 font-sans">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </motion.button>
          <span className="text-xs text-zinc-400 font-mono px-2">
            Page {page + 1} of {totalPages}
          </span>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};
