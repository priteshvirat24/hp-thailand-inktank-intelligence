/**
 * Section 2: Online Visibility & Share of Voice — Luxury Enterprise Edition with Framer Motion
 * Uses: BrandComparisonRecord[] for touchpoints and SOV
 * Charts: Recharts BarChart with monochrome precision and contextual interpretations
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
import { AnalyticalMonth, BrandComparisonRecord, ExecutiveOverviewData } from '@/types/analytics';
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
import { ArrowUpRight } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

interface OnlineVisibilitySectionProps {
  selectedMonth: AnalyticalMonth;
  selectedBrand?: TargetBrand | 'All';
  summary?: ExecutiveOverviewData | null;
  touchpointComparisons: BrandComparisonRecord[];
  paidSovComparisons: BrandComparisonRecord[];
  socialSovComparisons: BrandComparisonRecord[];
  ecomSovComparisons: BrandComparisonRecord[];
  onOpenEvidence: (metricId: string, metricName: string, brand: TargetBrand | 'All') => void;
}

const MONTH_LABELS: Record<AnalyticalMonth, { label: string; range: string }> = {
  '2026-06': { label: 'June 2026', range: '28 May – 30 Jun 2026' },
  '2026-07': { label: 'July 2026', range: '1 Jul – 31 Jul 2026' },
  '2026-08': { label: 'August 2026', range: '1 Aug – 28 Aug 2026' },
  'ALL': { label: 'All 3 Months', range: '28 May – 28 Aug 2026 (90 Days)' },
};

const VISIBILITY_SOURCES = [
  'Meta Ad Library',
  'Shopee Official Stores',
  'JIB Thailand',
  'Pantip.com Community',
  'Facebook Official',
  'YouTube Official (HP, Canon, Brother)',
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

export const OnlineVisibilitySection: React.FC<OnlineVisibilitySectionProps> = ({
  selectedMonth,
  selectedBrand = 'All',
  summary,
  touchpointComparisons,
  paidSovComparisons,
  socialSovComparisons,
  ecomSovComparisons,
  onOpenEvidence,
}) => {
  const hasData = touchpointComparisons.some((b) => b.value !== null && b.value > 0);
  const monthInfo = MONTH_LABELS[selectedMonth];
  const totalObs = summary?.total_evidence_observations ?? touchpointComparisons.reduce((acc, b) => acc + (b.value ?? 0), 0);

  if (!hasData) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="2. Competitive Visibility & Share of Voice (SOV)"
          subtitle={`Compares observed online visibility across HP, Epson, Canon, and Brother within ${monthInfo.label}.`}
          period={monthInfo.label}
          sources={VISIBILITY_SOURCES}
          totalEvidence={0}
        />
        <EmptyState
          title="NO VISIBILITY OBSERVATIONS FOR THIS PERIOD"
          message={`No active commercial ads, brand social posts, or marketplace listings have been ingested for ${monthInfo.label}.`}
          actionText="Open Crawler Operations"
        />
      </div>
    );
  }

  const touchpointData = TARGET_BRANDS.map((brand) => ({
    brand,
    value: touchpointComparisons.find((c) => c.brand === brand)?.value ?? 0,
    fill: brand === selectedBrand ? '#38bdf8' : MONOCHROME_BRAND_SHADES[brand],
  }));

  const sovData = TARGET_BRANDS.map((brand) => ({
    brand,
    'Paid Media': paidSovComparisons.find((c) => c.brand === brand)?.value ?? 0,
    'Social Channels': socialSovComparisons.find((c) => c.brand === brand)?.value ?? 0,
    'E-Commerce': ecomSovComparisons.find((c) => c.brand === brand)?.value ?? 0,
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
        title="2. Competitive Visibility & Share of Voice (SOV)"
        subtitle={`Compares observed online visibility across HP, Epson, Canon, and Brother within ${monthInfo.label}.`}
        period={monthInfo.label}
        sources={VISIBILITY_SOURCES}
        totalEvidence={totalObs}
      />

      {/* Touchpoints Chart & Brand Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Total Touchpoints Bar Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="p-6 space-y-4 rounded-xl bg-[#0c0c0e]/90 border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Total Online Visibility Touchpoints — {monthInfo.label}
                  </h3>
                  <InfoTooltip
                    title="Online Visibility Touchpoints"
                    content="The aggregate count of unique observable presence events (active ads, published social posts, and marketplace product listings)."
                    notMeaning="This does not represent consumer web traffic, impressions, or sales."
                  />
                </div>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Combined volume across Paid Advertising, Official Social Channels, and Marketplace Listings
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                OBSERVED VOLUME
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={touchpointData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#222228" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="brand" stroke="#71717a" fontSize={11} tickLine={false} fontFamily="system-ui, sans-serif" />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} fontFamily="monospace" />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [v.toLocaleString(), 'Touchpoints']} />
                  <Bar dataKey="value" name="Touchpoints" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {touchpointData.map((d) => (
                      <Cell key={d.brand} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Brand Breakdown Summary Table */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 space-y-4 rounded-xl bg-[#0c0c0e]/90 border-zinc-800 flex flex-col justify-between h-full">
            <div>
              <div className="border-b border-zinc-800/80 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Brand Observations
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    Touchpoint volume and evidence lineage
                  </p>
                </div>
                <InfoTooltip
                  title="Evidence Traceability"
                  content="Click the arrow icon next to any brand row to view the full audit trail of underlying crawled URLs and raw records in the Evidence Modal."
                />
              </div>

              <div className="space-y-2.5">
                {TARGET_BRANDS.map((brand) => {
                  const comp = touchpointComparisons.find((c) => c.brand === brand);
                  return (
                    <div
                      key={brand}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 gap-3 font-sans transition-all hover:border-zinc-700"
                    >
                      <BrandPill brand={brand} size="sm" />
                      <div className="flex items-center gap-3 ml-auto">
                        <DataStateBadge state={comp?.data_state ?? 'MISSING'} />
                        <span className="text-xs font-bold text-white font-mono tabular-nums">
                          {comp?.value !== null && comp?.value !== undefined
                            ? comp.value.toLocaleString()
                            : '—'}
                        </span>
                        {comp && comp.observation_count > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenEvidence('TOTAL_VISIBILITY_TOUCHPOINTS', 'Total Online Visibility Touchpoints', brand)
                            }
                            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 font-medium"
                            title={`Trace all ${comp.observation_count} evidence records for ${brand}`}
                          >
                            <span className="hidden sm:inline text-[11px]">Trace</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 text-[11px] font-sans text-zinc-500 text-right">
              Sum of 4 brands forms the 100% denominator for SOV calculations
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Channel SOV Grouped Bar Chart */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 space-y-4 rounded-xl bg-[#0c0c0e]/90 border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Channel SOV Comparison — {monthInfo.label}
                </h3>
                <InfoTooltip
                  title="Channel Share of Voice (SOV)"
                  content="Brand activity divided by total 4-brand category activity in that specific channel. Paid SOV is based on active ad creative counts; Social SOV is based on post publishing counts; E-Commerce SOV is based on marketplace listings."
                  notMeaning="This is not retail sales market share, advertising expenditure share, or web traffic share."
                />
              </div>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Cross-channel distribution across Paid Advertising, Social Media, and E-Commerce Shelves
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              PERCENTAGE %
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sovData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#222228" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="brand" stroke="#71717a" fontSize={11} tickLine={false} fontFamily="system-ui, sans-serif" />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} unit="%" fontFamily="monospace" />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v.toFixed(1)}%`]} />
                <Legend
                  wrapperStyle={{
                    fontSize: '11px',
                    fontFamily: 'system-ui, sans-serif',
                    paddingTop: '16px',
                    color: '#a1a1aa',
                  }}
                />
                <Bar dataKey="Paid Media" fill="#ffffff" radius={[3, 3, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Social Channels" fill="#a1a1aa" radius={[3, 3, 0, 0]} maxBarSize={32} />
                <Bar dataKey="E-Commerce" fill="#52525b" radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Collapsible Methodology Disclosure */}
      <motion.div variants={itemVariants}>
        <MethodologyDisclosure
          title="Share of Voice (SOV) Formulation & Caveats"
          description="SOV = (Brand observations in channel / Total observations across the 4-brand set in channel) × 100. Computed server-side by the Analytical Metric Cube. If the channel denominator is zero, the API returns null and the UI displays Insufficient Evidence — never 0%."
          formula="Channel SOV (%) = (Brand Observations / Σ Four-Brand Channel Observations) × 100"
          rules={[
            {
              label: 'Denominator Completeness',
              rule: 'If total channel observations across all 4 brands are 0, SOV is null (INSUFFICIENT EVIDENCE).',
            },
            {
              label: 'No Synthetic Zeroes',
              rule: 'A 0% SOV requires verified competitor observations with 0 observations for the focal brand.',
            },
            {
              label: 'Channel Independence',
              rule: 'Paid SOV, Social SOV, and E-Commerce SOV are calculated independently from distinct source ecosystems.',
            },
          ]}
        />
      </motion.div>
    </motion.div>
  );
};
