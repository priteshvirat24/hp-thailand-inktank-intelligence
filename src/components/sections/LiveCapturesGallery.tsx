/**
 * Live Scrapling Browser Captures Gallery
 * Fetches the screenshot manifest from /api/screenshots and displays
 * all real browser-captured screenshots grouped by channel.
 * Used as a sticky panel inside Section 8 (Evidence & Source Intelligence Lake).
 */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { BrandPill } from '@/components/ui/BrandPill';
import { TargetBrand } from '@/types/brands';
import { Camera, RefreshCw, ExternalLink, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface ScreenshotEntry {
  id: string;
  brand: string;
  channel: string;
  platform: string;
  screenshot_url: string;
  source_url: string;
  status: 'captured' | 'already_captured' | 'failed';
  file_size_kb?: number;
  captured_at: string;
}

const CHANNEL_ORDER = ['E-Commerce', 'Social', 'Review', 'Paid Media'];
const CHANNEL_COLORS: Record<string, string> = {
  'E-Commerce': 'text-blue-400 bg-blue-950/60 border-blue-800/60',
  'Social':     'text-violet-400 bg-violet-950/60 border-violet-800/60',
  'Review':     'text-amber-400 bg-amber-950/60 border-amber-800/60',
  'Paid Media': 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
};

export const LiveCapturesGallery: React.FC = () => {
  const [screenshots, setScreenshots] = useState<ScreenshotEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [brandFilter, setBrandFilter] = useState<string>('All');
  const [zoom, setZoom] = useState<ScreenshotEntry | null>(null);

  const fetchManifest = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/screenshots');
      if (res.ok) {
        const data = await res.json();
        setScreenshots(data.screenshots ?? []);
        setLastRefresh(new Date());
      }
    } catch {
      // silence — manifest may not yet exist mid-scrape
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchManifest(); }, [fetchManifest]);

  const filtered = screenshots.filter(s => {
    const matchChannel = channelFilter === 'All' || s.channel === channelFilter;
    const matchBrand   = brandFilter === 'All' || s.brand === brandFilter;
    return matchChannel && matchBrand;
  });

  const grouped = CHANNEL_ORDER.reduce<Record<string, ScreenshotEntry[]>>((acc, ch) => {
    const items = filtered.filter(s => s.channel === ch);
    if (items.length) acc[ch] = items;
    return acc;
  }, {});

  const channels = CHANNEL_ORDER.filter(ch => screenshots.some(s => s.channel === ch));
  const brands   = Array.from(new Set(screenshots.map(s => s.brand)));

  return (
    <>
      {/* Zoom Modal */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setZoom(null)}
          >
            <motion.div
              className="relative max-w-5xl w-full bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-2">
                  <BrandPill brand={zoom.brand as TargetBrand} size="sm" />
                  <span className="text-white font-mono text-xs font-bold">{zoom.platform}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${CHANNEL_COLORS[zoom.channel] ?? 'text-zinc-400 bg-zinc-900 border-zinc-700'}`}>
                    {zoom.channel}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a href={zoom.source_url} target="_blank" rel="noopener noreferrer"
                     className="text-sky-400 text-xs font-mono hover:text-sky-300 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Open Source
                  </a>
                  <a href={zoom.screenshot_url} target="_blank" rel="noopener noreferrer"
                     className="text-zinc-400 text-xs font-mono hover:text-zinc-300 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Full Image
                  </a>
                  <button onClick={() => setZoom(null)} className="text-zinc-500 hover:text-zinc-200 text-xs font-mono">✕ Close</button>
                </div>
              </div>
              <div className="overflow-auto max-h-[80vh]">
                <img src={zoom.screenshot_url} alt={`${zoom.brand} ${zoom.platform}`} className="w-full" />
              </div>
              <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Scrapling Headless Chromium — Real Browser Capture
                </span>
                <span>{zoom.captured_at.split('T')[0]}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="p-5 bg-[#0b0b0e] border-zinc-800 rounded-xl space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <Camera className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Live Scrapling Browser Captures
              </h3>
              <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                Real browser screenshots via local /Scrapling (headless Chromium) — all channels
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
              {screenshots.length} CAPTURES
            </span>
            <button
              onClick={fetchManifest}
              disabled={loading}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-40"
              title="Refresh manifest"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {['All', ...channels].map(ch => (
              <button key={ch} onClick={() => setChannelFilter(ch)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                  channelFilter === ch
                    ? 'bg-white text-black border-white'
                    : 'text-zinc-400 border-zinc-700 hover:border-zinc-500'
                }`}>
                {ch}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['All', ...brands].map(br => (
              <button key={br} onClick={() => setBrandFilter(br)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                  brandFilter === br
                    ? 'bg-zinc-100 text-black border-zinc-100'
                    : 'text-zinc-500 border-zinc-800 hover:border-zinc-600'
                }`}>
                {br}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading && screenshots.length === 0 ? (
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono py-4">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Loading screenshot manifest...
          </div>
        ) : screenshots.length === 0 ? (
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono py-4">
            <AlertCircle className="w-3.5 h-3.5" />
            Scrapling capture in progress — manifest not yet available. Refresh in a moment.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([channel, items]) => (
              <div key={channel}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${CHANNEL_COLORS[channel] ?? 'text-zinc-400 bg-zinc-900 border-zinc-700'}`}>
                    {channel.toUpperCase()}
                  </span>
                  <span className="text-zinc-600 text-[10px] font-mono">{items.length} captures</span>
                </div>
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                  initial="hidden" animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                >
                  {items.map(s => (
                    <motion.div key={s.id} variants={itemVariants}
                      className="group bg-black/50 border border-zinc-800/90 rounded-lg overflow-hidden flex flex-col cursor-pointer hover:border-zinc-600 transition-all"
                      onClick={() => setZoom(s)}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden bg-zinc-950">
                        <img
                          src={s.screenshot_url}
                          alt={`${s.brand} ${s.platform}`}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTgxODFiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZpbGw9IiM1MjUyNWIiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXB0dXJpbmcuLi48L3RleHQ+PC9zdmc+';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-2 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <BrandPill brand={s.brand as TargetBrand} size="sm" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-sans leading-tight truncate">{s.platform}</p>
                        <div className="flex items-center justify-between">
                          {s.file_size_kb ? (
                            <span className="text-[9px] text-zinc-600 font-mono">{s.file_size_kb}KB</span>
                          ) : <span />}
                          <span className="flex items-center gap-0.5 text-[9px] text-emerald-500 font-mono">
                            <CheckCircle className="w-2.5 h-2.5" /> live
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        )}

        {lastRefresh && (
          <p className="text-[10px] text-zinc-600 font-mono border-t border-zinc-800/60 pt-2">
            Manifest last refreshed: {lastRefresh.toLocaleTimeString()} · Scrapling path: /Users/priteshhome/InkTank-analysis /Scrapling
          </p>
        )}
      </Card>
    </>
  );
};
