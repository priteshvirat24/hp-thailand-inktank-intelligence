/**
 * Section 4: Social Media Activity — Luxury Enterprise Edition with Framer Motion
 * Displays official publishing volume, audience engagement, SOV, and platform coverage.
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
  CartesianGrid,
} from 'recharts';
import { MessageSquare, ArrowUpRight } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { motion, type Variants } from 'framer-motion';

interface SocialActivitySectionProps {
  selectedMonth: AnalyticalMonth;
  selectedBrand?: TargetBrand | 'All';
  postComparisons: BrandComparisonRecord[];
  engagementComparisons: BrandComparisonRecord[];
  socialSovComparisons: BrandComparisonRecord[];
  onOpenEvidence: (metricId: string, metricName: string, brand: TargetBrand | 'All') => void;
}

const MONTH_LABELS: Record<AnalyticalMonth, { label: string; range: string }> = {
  '2026-06': { label: 'June 2026', range: '28 May – 30 Jun 2026' },
  '2026-07': { label: 'July 2026', range: '1 Jul – 31 Jul 2026' },
  '2026-08': { label: 'August 2026', range: '1 Aug – 28 Aug 2026' },
  'ALL': { label: 'All 3 Months', range: '28 May – 28 Aug 2026 (90 Days)' },
};

const SOCIAL_PLATFORMS = [
  'Facebook (Official Thailand Pages)',
  'Instagram (@hpthailand, @epsonthailand, etc.)',
  'YouTube (Official Brand Channels)',
  'TikTok Thailand',
  'LinkedIn Thailand',
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

export const SocialActivitySection: React.FC<SocialActivitySectionProps> = ({
  selectedMonth,
  selectedBrand = 'All',
  postComparisons,
  engagementComparisons,
  socialSovComparisons,
  onOpenEvidence,
}) => {
  const totalPosts = postComparisons.reduce((acc, b) => acc + (b.value ?? 0), 0);
  const monthInfo = MONTH_LABELS[selectedMonth];

  if (totalPosts === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Brand Social Media Activity"
          subtitle={`Official brand publishing volume and audience engagement across Thai channels — ${monthInfo.label}.`}
          period={monthInfo.label}
          sources={SOCIAL_PLATFORMS}
          totalEvidence={0}
        />
        <EmptyState
          title="NO SOCIAL MEDIA OBSERVATIONS FOR THIS PERIOD"
          message={`No official brand posts captured from Facebook, Instagram, YouTube, TikTok, or LinkedIn for ${monthInfo.label} (${monthInfo.range}).`}
          actionText="Open Crawler Operations"
        />
      </div>
    );
  }

  const postData = TARGET_BRANDS.map((brand) => ({
    brand,
    value: postComparisons.find((c) => c.brand === brand)?.value ?? 0,
    fill: brand === selectedBrand ? '#38bdf8' : MONOCHROME_BRAND_SHADES[brand],
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
        title="Brand Social Media Activity"
        subtitle={`Official brand social publishing volume and audience engagement across Thai channels — ${monthInfo.label}.`}
        period={monthInfo.label}
        sources={SOCIAL_PLATFORMS}
        totalEvidence={totalPosts}
      />

      {/* 4-Brand Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {TARGET_BRANDS.map((brand) => {
          const postComp = postComparisons.find((c) => c.brand === brand);
          const engComp = engagementComparisons.find((c) => c.brand === brand);
          const sovComp = socialSovComparisons.find((c) => c.brand === brand);
          const isHp = brand === 'HP';

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
                  <DataStateBadge state={postComp?.data_state ?? 'MISSING'} />
                  <span className="text-sm font-bold text-white font-mono tabular-nums">
                    {postComp?.value !== null && postComp?.value !== undefined
                      ? postComp.value.toLocaleString()
                      : '—'}
                    <span className="text-xs font-normal text-zinc-500 ml-1 font-sans">posts</span>
                  </span>
                </div>
              </div>

              <dl className="space-y-2.5 text-xs font-sans">
                <div className="flex justify-between items-center">
                  <dt className="text-zinc-400 flex items-center gap-2 font-normal">
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Total Engagement:</span>
                    <InfoTooltip
                      title="Audience Engagement"
                      content="Total observed likes, comments, shares, and video views across brand posts published in this window."
                    />
                  </dt>
                  <dd className={engComp?.value !== null && engComp?.value !== undefined ? 'font-semibold text-white font-mono tabular-nums' : 'text-zinc-600 italic font-mono'}>
                    {engComp?.value !== null && engComp?.value !== undefined
                      ? formatNumber(engComp.value)
                      : 'NO DATA'}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-zinc-400 flex items-center gap-2 font-normal">
                    <span>Social SOV:</span>
                    <InfoTooltip
                      title="Social Share of Voice"
                      content="Brand publishing volume divided by total 4-brand publishing volume."
                    />
                  </dt>
                  <dd className={sovComp?.value !== null && sovComp?.value !== undefined ? 'font-semibold text-white font-mono tabular-nums' : 'text-zinc-600 italic font-mono'}>
                    {sovComp?.value !== null && sovComp?.value !== undefined
                      ? `${sovComp.value.toFixed(1)}%`
                      : 'NO DATA'}
                  </dd>
                </div>
              </dl>

              {postComp && postComp.observation_count > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenEvidence('SOCIAL_POSTS_COUNT', 'Total Social Posts', brand)}
                  className="w-full flex items-center justify-center gap-1.5 pt-3 border-t border-zinc-850 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  <span>Trace Social Evidence ({postComp.observation_count})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </Card>
          );
        })}
      </motion.div>

      {/* Posts Bar Chart */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 space-y-4 rounded-xl bg-[#0c0c0e]/90 border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Brand Publishing Volume — {monthInfo.label}
                </h3>
                <InfoTooltip
                  title="Publishing Volume"
                  content="Count of verified organic communications published on official Thai brand profiles during the window."
                  notMeaning="This does not measure paid influencer posts or third-party user-generated mentions."
                />
              </div>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Verified organic communications published on official Thai brand profiles
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              PUBLISHED POSTS
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={postData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#222228" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="brand" stroke="#71717a" fontSize={11} tickLine={false} fontFamily="system-ui, sans-serif" />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} fontFamily="monospace" />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [v.toLocaleString(), 'Posts']} />
                <Bar dataKey="value" name="Posts" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {postData.map((d) => (
                    <Cell key={d.brand} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Collapsible Methodology Disclosure */}
      <motion.div variants={itemVariants}>
        <MethodologyDisclosure
          title="Social Media Ingestion & Scope Policy"
          description="Data is ingested exclusively from verified official Thai brand accounts. Posts are tagged with canonical SKU mentions where model names appear in captions, descriptions, or on-screen graphics."
          rules={[
            {
              label: 'Official Profiles Only',
              rule: 'Ingestion is restricted to verified manufacturer handles (e.g. HP Thailand, Epson Thailand).',
            },
            {
              label: 'Product Categorization',
              rule: 'Posts are parsed for Ink Tank printer keywords; generic corporate or PC posts are excluded.',
            },
          ]}
        />
      </motion.div>
    </motion.div>
  );
};
