/**
 * Section 3: Paid Advertising & Creatives — Luxury Enterprise Edition with Framer Motion
 * Displays unique ad counts and creative format composition per brand.
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { BrandPill } from '@/components/ui/BrandPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataStateBadge } from '@/components/ui/DataStateBadge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { MethodologyDisclosure } from '@/components/ui/MethodologyDisclosure';
import { TARGET_BRANDS } from '@/config/brands';
import { AnalyticalMonth, BrandComparisonRecord } from '@/types/analytics';
import { TargetBrand } from '@/types/brands';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Video, Image as ImageIcon, Layers, ArrowUpRight, Eye, Camera } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

interface AdvertisingSectionProps {
  selectedMonth: AnalyticalMonth;
  selectedBrand?: TargetBrand | 'All';
  adComparisons: BrandComparisonRecord[];
  videoComparisons: BrandComparisonRecord[];
  staticComparisons: BrandComparisonRecord[];
  carouselComparisons: BrandComparisonRecord[];
  onOpenEvidence: (metricId: string, metricName: string, brand: TargetBrand | 'All') => void;
}

const MONTH_LABELS: Record<AnalyticalMonth, { label: string; range: string }> = {
  '2026-06': { label: 'June 2026', range: '28 May – 30 Jun 2026' },
  '2026-07': { label: 'July 2026', range: '1 Jul – 31 Jul 2026' },
  '2026-08': { label: 'August 2026', range: '1 Aug – 28 Aug 2026' },
  'ALL': { label: 'All 3 Months', range: '28 May – 28 Aug 2026 (90 Days)' },
};

const AD_SOURCES = [
  'Meta Ad Library Thailand (Facebook & Instagram)',
  'Google Ads Transparency Center (Search & YouTube)',
] as const;

const MONOCHROME_BRAND_SHADES: Record<TargetBrand, string> = {
  HP: '#ffffff',
  Epson: '#d4d4d8',
  Canon: '#a1a1aa',
  Brother: '#71717a',
};

const TOOLTIP_STYLE = {
  cursor: { fill: 'transparent' },
  contentStyle: {
    backgroundColor: '#111113',
    border: '1px solid #27272a',
    borderRadius: '8px',
    fontSize: '11px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#ffffff',
    padding: '8px 12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
  itemStyle: { color: '#ffffff', padding: '2px 0' },
  labelStyle: { color: '#a1a1aa', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' as const, fontSize: '10px' },
};

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

export const AdvertisingSection: React.FC<AdvertisingSectionProps> = ({
  selectedMonth,
  selectedBrand = 'All',
  adComparisons,
  videoComparisons,
  staticComparisons,
  carouselComparisons,
  onOpenEvidence,
}) => {
  const totalAds = adComparisons.reduce((acc, b) => acc + (b.value ?? 0), 0);
  const monthInfo = MONTH_LABELS[selectedMonth];

  if (totalAds === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Paid Advertising & Creatives Intelligence"
          subtitle={`Observable ad campaigns captured from Meta Ad Library Thailand and Google Ads Transparency Center — ${monthInfo.label}.`}
          period={monthInfo.label}
          sources={AD_SOURCES}
          totalEvidence={0}
        />
        <EmptyState
          title="NO PAID ADVERTISING OBSERVATIONS FOR THIS PERIOD"
          message={`No active ad creatives captured from Meta Ad Library Thailand or Google Ads Transparency Center for ${monthInfo.label} (${monthInfo.range}).`}
          actionText="Open Crawler Operations"
        />
      </div>
    );
  }

  const formatData = TARGET_BRANDS.map((brand) => ({
    brand,
    'Video Ads': videoComparisons.find((c) => c.brand === brand)?.value ?? 0,
    'Static Images': staticComparisons.find((c) => c.brand === brand)?.value ?? 0,
    'Carousel Units': carouselComparisons.find((c) => c.brand === brand)?.value ?? 0,
  }));

  const touchpointData = TARGET_BRANDS.map((brand) => ({
    brand,
    value: adComparisons.find((c) => c.brand === brand)?.value ?? 0,
    fill: MONOCHROME_BRAND_SHADES[brand],
  }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7 font-sans"
    >
      {/* Header */}
      <SectionHeader
        title="3. Creative & Messaging Intelligence"
        subtitle={`Observable ad campaigns captured from Meta Ad Library Thailand and Google Ads Transparency Center — ${monthInfo.label}.`}
        period={monthInfo.label}
        sources={AD_SOURCES}
        totalEvidence={totalAds}
      />

      {/* 4-Brand KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {TARGET_BRANDS.map((brand) => {
          const adComp = adComparisons.find((c) => c.brand === brand);
          const videoComp = videoComparisons.find((c) => c.brand === brand);
          const staticComp = staticComparisons.find((c) => c.brand === brand);
          const carouselComp = carouselComparisons.find((c) => c.brand === brand);
          const isHp = brand === 'HP';
          const adCount = adComp?.value ?? null;

          return (
            <Card
              key={brand}
              className={`p-5 space-y-4 rounded-xl ${
                isHp
                  ? 'bg-zinc-900/90 border-zinc-700 shadow-md shadow-black/40'
                  : 'bg-[#0c0c0e]/90 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <BrandPill brand={brand} size="md" />
                <div className="flex items-center gap-2">
                  <DataStateBadge state={adComp?.data_state ?? 'MISSING'} />
                  <span className="text-sm font-bold text-white font-mono tabular-nums">
                    {adCount !== null ? adCount.toLocaleString() : '—'}
                    <span className="text-xs font-normal text-zinc-500 ml-1">ads</span>
                  </span>
                </div>
              </div>

              <dl className="space-y-2.5 text-xs font-sans">
                <CreativeRow
                  icon={<Video className="w-3.5 h-3.5 text-zinc-400" />}
                  label="Video"
                  value={videoComp?.value}
                  tooltip="Ads featuring motion video assets targeting Thailand audiences."
                />
                <CreativeRow
                  icon={<ImageIcon className="w-3.5 h-3.5 text-zinc-400" />}
                  label="Static Display"
                  value={staticComp?.value}
                  tooltip="Single-image banners or graphic product displays."
                />
                <CreativeRow
                  icon={<Layers className="w-3.5 h-3.5 text-zinc-400" />}
                  label="Carousel"
                  value={carouselComp?.value}
                  tooltip="Multi-card interactive swipeable product cards."
                />
              </dl>

              {adComp && adComp.observation_count > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenEvidence('AD_PRESENCE_COUNT', 'Unique Active Ads', brand)}
                  className="w-full flex items-center justify-center gap-1.5 pt-3 border-t border-zinc-800/80 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  <span>Trace Ad Evidence ({adComp.observation_count})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </Card>
          );
        })}
      </motion.div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Total Ads Bar */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-4 rounded-xl bg-[#0c0c0e]/90 border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Active Commercial Ads by Brand — {monthInfo.label}
                  </h3>
                  <InfoTooltip
                    title="Unique Active Commercial Ads"
                    content="Count of deduplicated active promotional ad creatives observed in Thailand during the window."
                    notMeaning="This does not measure total impressions, reach, or budget spend."
                  />
                </div>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Total unique commercial creatives in market across Meta Ad Library and Google Ads
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                UNIQUE CREATIVES
              </span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={touchpointData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#222228" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="brand" stroke="#71717a" fontSize={11} tickLine={false} fontFamily="system-ui, sans-serif" />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} fontFamily="monospace" />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [v.toLocaleString(), 'Active Ads']} />
                  <Bar dataKey="value" name="Active Ads" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {touchpointData.map((d) => (
                      <Cell key={d.brand} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Creative Formats Stacked Bar */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-4 rounded-xl bg-[#0c0c0e]/90 border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Creative Format Composition — {monthInfo.label}
                  </h3>
                  <InfoTooltip
                    title="Creative Format Breakdown"
                    content="Categorization of observed ads by visual asset type (Video, Static Display, Carousel)."
                  />
                </div>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Breakdown of brand creative strategy across Video, Static Display, and Carousel
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                FORMAT
              </span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#222228" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="brand" stroke="#71717a" fontSize={11} tickLine={false} fontFamily="system-ui, sans-serif" />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} fontFamily="monospace" />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend
                    wrapperStyle={{
                      fontSize: '11px',
                      fontFamily: 'system-ui, sans-serif',
                      paddingTop: '16px',
                      color: '#a1a1aa',
                    }}
                  />
                  <Bar dataKey="Video Ads" stackId="a" fill="#ffffff" radius={[0, 0, 0, 0]} maxBarSize={48} />
                  <Bar dataKey="Static Images" stackId="a" fill="#a1a1aa" maxBarSize={48} />
                  <Bar dataKey="Carousel Units" stackId="a" fill="#52525b" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Verified Scrapling Browser Ad Captures Gallery ────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="p-5 bg-[#0f0f12] border-zinc-800 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Verified Browser Scraped Creative Captures (Scrapling Headless Chromium)
              </h3>
              <InfoTooltip
                title="Live Browser Captures"
                content="Real browser screenshots captured from Meta Ad Library Thailand using Scrapling's DynamicFetcher with headless Chromium. Demonstrates actual live market ad placements and messaging."
              />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full font-semibold">
              REAL LIVE BROWSER CAPTURES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                brand: 'HP' as const,
                sku: 'HP Smart Tank 580',
                platform: 'Meta Ad Library',
                file: '/screenshots/ads/scrapling_meta_hp.png',
                targetUrl: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=HP%20Smart%20Tank&search_type=keyword_unordered&media_type=all',
                hook: 'Onsite 2-Year Service & Free Delivery Flight',
              },
              {
                brand: 'Epson' as const,
                sku: 'EcoTank L3250',
                platform: 'Meta Ad Library',
                file: '/screenshots/ads/scrapling_meta_epson.png',
                targetUrl: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=Epson%20EcoTank&search_type=keyword_unordered&media_type=all',
                hook: 'Power Buy 9.9 Power Deals & Heat-Free Ad Set',
              },
              {
                brand: 'Canon' as const,
                sku: 'PIXMA MegaTank G-Series',
                platform: 'Meta Ad Library',
                file: '/screenshots/ads/scrapling_meta_canon.png',
                targetUrl: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=Canon%20PIXMA%20G&search_type=keyword_unordered&media_type=all',
                hook: 'Office Depot & I DID Solution Retail Flights',
              },
              {
                brand: 'Brother' as const,
                sku: 'Ink Tank DCP-T Series',
                platform: 'Meta Ad Library',
                file: '/screenshots/ads/scrapling_meta_brother.png',
                targetUrl: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=TH&q=Brother%20DCP-T&search_type=keyword_unordered&media_type=all',
                hook: 'IT CITY Hot Deals & Official Brother Promo',
              },
            ].map((item) => {
              const brandAdCount = adComparisons.find((c) => c.brand === item.brand)?.value;
              const isSelected = selectedBrand === 'All' || selectedBrand === item.brand;
              return (
                <div
                  key={item.brand}
                  className={`border rounded-lg overflow-hidden flex flex-col transition-all group ${
                    isSelected
                      ? 'bg-black/80 border-zinc-700 shadow-md'
                      : 'bg-black/30 border-zinc-900 opacity-50'
                  }`}
                >
                  <div className="p-3 border-b border-zinc-800/70 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BrandPill brand={item.brand} size="sm" />
                      <span className="text-xs font-mono font-semibold text-zinc-200 truncate">
                        {item.sku}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {brandAdCount !== null && brandAdCount !== undefined ? `${brandAdCount} Ads` : 'Observed'}
                    </span>
                  </div>

                <a
                  href={item.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-video w-full overflow-hidden bg-zinc-950 block group/img"
                  title="Click to view full resolution screenshot"
                >
                  <img
                    src={item.file}
                    alt={`${item.brand} Live Ad Screenshot`}
                    className="w-full h-full object-cover object-top group-hover/img:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] font-mono text-white flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                      <Eye className="w-3 h-3 text-sky-400" /> Click for Full Resolution
                    </span>
                  </div>
                </a>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2 text-xs">
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                    {item.hook}
                  </p>
                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500">
                      {item.platform}
                    </span>
                    <a
                      href={item.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Verify ↗</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </Card>
      </motion.div>

      {/* Collapsible Methodology Disclosure */}
      <motion.div variants={itemVariants}>
        <MethodologyDisclosure
          title="Advertising Ingestion & Deduplication Methodology"
          description="Ad creatives are ingested from the public Meta Ad Library API and Google Ads Transparency Center targeting Thailand. Ads are deduplicated by creative hash so identical ads running concurrently across multiple ad sets are counted as a single unique creative presence."
          rules={[
            {
              label: 'Geographic Filter',
              rule: 'Only campaigns explicitly targeting Thailand users or containing Thai language assets are included.',
            },
            {
              label: 'Category Scoping',
              rule: 'Ads for non-ink-tank printers (e.g. laser, large format) or non-printing products are filtered out.',
            },
          ]}
        />
      </motion.div>
    </motion.div>
  );
};

const CreativeRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: number | null;
  tooltip?: string;
}> = ({ icon, label, value, tooltip }) => (
  <div className="flex items-center justify-between">
    <dt className="text-zinc-400 flex items-center gap-2 font-normal font-sans">
      {icon}
      <span>{label}:</span>
      {tooltip && <InfoTooltip content={tooltip} />}
    </dt>
    <dd className={value !== null && value !== undefined ? 'font-semibold text-white font-mono tabular-nums' : 'text-zinc-600 italic font-mono'}>
      {value !== null && value !== undefined ? value.toLocaleString() : 'NO DATA'}
    </dd>
  </div>
);
