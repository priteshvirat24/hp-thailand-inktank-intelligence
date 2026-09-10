/**
 * Section 1: Executive Overview — Pixel-Accurate Enterprise Competitive Intelligence
 * Technical Implementation Brief Section 12.1 (Priority 1 — Highest: Executive Summary / Key Insights)
 * 
 * Includes:
 * - Header with period badge & Observations status card
 * - Verified Sources pill list
 * - 4 Dynamic Key Insight takeaway cards answering "What Matters?"
 * - 7-KPI horizontal strip with vertical dividers & data states
 * - 3-Column main content grid:
 *     1. Competitive Posture Matrix
 *     2. Top Promoted SKUs (by Visibility)
 *     3. Data Coverage Status (Real observation counts per channel)
 * - Data Integrity footer banner
 */

'use client';

import React from 'react';
import { ExecutiveOverviewData, AnalyticalMonth } from '@/types/analytics';
import { TargetBrand } from '@/types/brands';
import { TARGET_BRANDS } from '@/config/brands';
import { DashboardSection } from '@/components/layout/Navigation';
import {
  Megaphone,
  Clock,
  Users,
  ShoppingCart,
  Tag,
  Percent,
  Star,
  ShieldCheck,
  Box,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatTHB, formatPercent } from '@/lib/utils';
import { motion, type Variants } from 'framer-motion';
import { ExecutiveVisualAnalytics } from './ExecutiveVisualAnalytics';

interface ExecutiveOverviewProps {
  data: ExecutiveOverviewData | null;
  insights?: readonly import('@/services/insights/insightTypes').Insight[];
  selectedMonth: AnalyticalMonth;
  selectedBrand?: TargetBrand | 'All';
  isLoading?: boolean;
  onOpenEvidence?: (metricId: string, metricName: string, brand: TargetBrand | 'All') => void;
  onNavigateSection?: (section: DashboardSection) => void;
}

const MONTH_LABELS: Record<AnalyticalMonth, { label: string; full: string }> = {
  '2026-06': { label: 'JUNE 2026', full: 'June 2026' },
  '2026-07': { label: 'JULY 2026', full: 'July 2026' },
  '2026-08': { label: 'AUGUST 2026', full: 'August 2026' },
  'ALL': { label: 'ALL 3 MONTHS', full: 'All 3 Months (28 May – 28 Aug 2026)' },
};

const VERIFIED_SOURCES = [
  'Meta Ad Library',
  'Shopee Official Stores',
  'JIB Thailand',
  'Pantip.com Community',
  'Facebook Official',
  'YouTube Official (HP, Canon, Brother, Epson)',
] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  data,
  insights,
  selectedMonth,
  selectedBrand = 'All',
  isLoading = false,
  onOpenEvidence,
  onNavigateSection,
}) => {
  const monthInfo = MONTH_LABELS[selectedMonth];

  if (!data) {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
          <div className="space-y-1.5">
            <div className="h-4 w-48 bg-[#161616] animate-pulse rounded-[4px]" />
            <div className="h-3 w-80 bg-[#121212] animate-pulse rounded-[4px]" />
          </div>
          <div className="h-4 w-28 bg-[#161616] animate-pulse rounded-[4px]" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#111111] border border-[#222222] rounded-[8px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const focusBrand: TargetBrand = selectedBrand !== 'All' ? selectedBrand : 'HP';
  const activeBrandData = data?.brands?.[focusBrand];
  const totalObs = data?.total_evidence_observations ?? 0;

  // Real observation counts from backend
  const paidObs = data?.channel_observations?.paid_media ?? 0;
  const socialObs = data?.channel_observations?.social ?? 0;
  const ecomObs = data?.channel_observations?.ecommerce ?? 0;
  const reviewObs = data?.channel_observations?.consumer_review ?? 0;
  const displayRating = selectedBrand === 'All'
    ? data?.avg_consumer_rating
    : (activeBrandData?.avg_consumer_rating ?? data?.avg_consumer_rating);

  // Dynamic calculations for Key Insights

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 font-sans"
    >
      {/* ── Top Header & Status ──────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-sm md:text-[15px] font-bold tracking-wider uppercase text-white font-mono">
              1. Executive Summary — What Matters?
            </h2>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-[4px] bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-300 font-semibold">
              {monthInfo.label}
            </span>
            {selectedBrand !== 'All' && (
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-[4px] bg-sky-950 border border-sky-800 text-sky-300 font-semibold">
                FOCUS: {selectedBrand}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-normal">
            Key competitive insights, market share of voice, pricing dynamics, and multi-channel performance across HP, Epson, Canon, and Brother for {monthInfo.full}.
          </p>
        </div>

        {/* Verified Observations Status Card */}
        <div className="px-4 py-2.5 rounded-[8px] bg-[#111111] border border-[#222222] text-xs font-sans shrink-0 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${totalObs > 0 ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]' : 'bg-zinc-600'}`} />
            <span className="font-semibold text-white font-mono tabular-nums">{totalObs.toLocaleString()} Verified Observations</span>
          </div>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 text-[11px]">{data?.total_lake_observations ? `${data.total_lake_observations.toLocaleString()} Total Lake Records` : '90-Day Lake'}</span>
        </div>
      </motion.div>

      {/* ── Verified Sources Pills ───────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-zinc-400 font-mono text-[11px] font-semibold tracking-wider uppercase mr-1">
          VERIFIED SOURCES:
        </span>
        {VERIFIED_SOURCES.map((src) => (
          <span
            key={src}
            className="px-2.5 py-1 rounded-[4px] bg-[#111111] border border-[#222222] text-zinc-300 hover:text-white hover:border-[#333333] transition-colors text-[11px] font-sans"
          >
            {src}
          </span>
        ))}
      </motion.div>

      {/* ── Priority 1: Dynamic Key Insights Cards ("What Matters?") ──────── */}
      <motion.div variants={itemVariants} className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            Executive Takeaways — Strategic Findings ({monthInfo.label})
          </h3>
          <button
            type="button"
            onClick={() => onNavigateSection?.('insights')}
            className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 uppercase transition-colors"
          >
            <span>Full Insights &amp; Recommendations</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {insights && insights.length > 0 ? (
            insights.slice(0, 4).map((insight) => {
              const isMultiCut = insight.confidence === 'MULTI-CUT';
              const isCorroborated = insight.confidence === 'CORROBORATED';
              const primaryMetric = insight.supportingMetrics[0];

              return (
                <div
                  key={insight.id}
                  className="p-4 rounded-xl bg-[#121214] border border-[#222226] space-y-2.5 relative overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/80 uppercase font-semibold text-[10px]">
                          {insight.category}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                            insight.priority === 'HIGH'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {insight.priority}
                        </span>
                      </div>
                      <span className="text-zinc-400 text-[10px] font-mono uppercase">
                        {isMultiCut ? '3+ Cuts' : isCorroborated ? '2 Cuts' : '1 Cut'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                      {insight.title}
                    </h4>

                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3">
                      {insight.finding}
                    </p>

                    <div className="pt-1.5 p-2 rounded bg-[#0e1610] border border-emerald-900/40 text-[10px] text-emerald-300/90 font-mono">
                      <span className="text-zinc-500 uppercase tracking-wider block text-[9px] font-semibold mb-0.5">
                        HP Recommendation
                      </span>
                      <p className="line-clamp-2">{insight.recommendation}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1e1e22] text-[10px] font-mono">
                    {primaryMetric ? (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenEvidence?.(
                            primaryMetric.metric_id,
                            primaryMetric.metric_name,
                            insight.affectedBrands[0] || 'HP'
                          )
                        }
                        className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        <span>Inspect Evidence</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigateSection?.('insights')}
                        className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        <span>Evidence Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onNavigateSection?.('insights')}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      View Lineage →
                    </button>
                  </div>
                </div>
              );
            })
          ) : isLoading ? (
            <>
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="p-4 rounded-xl bg-[#121214]/60 border border-[#222226] space-y-3 animate-pulse h-44 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-zinc-800 rounded" />
                    <div className="h-5 w-3/4 bg-zinc-800 rounded" />
                    <div className="h-10 w-full bg-zinc-900 rounded" />
                  </div>
                  <div className="h-3 w-32 bg-zinc-800 rounded" />
                </div>
              ))}
            </>
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-4 p-8 rounded-xl bg-[#121214]/80 border border-[#222226] text-center space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block font-bold">
                NO AUTHORITATIVE INSIGHTS GENERATED FOR THIS SELECTION
              </span>
              <p className="text-xs text-zinc-500 font-sans max-w-lg mx-auto">
                No verified strategic signals met the high-significance corroboration threshold for {monthInfo.full} ({selectedBrand}). Expand filters or run web crawlers to capture additional evidence.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Horizontal KPI Strip (7 Columns with Vertical Dividers) ──────────── */}
      <motion.div
        variants={itemVariants}
        className="rounded-[10px] bg-[#111111] border border-[#222222] overflow-hidden grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-[#222222]"
      >
        {/* 1. Total Visibility Touchpoints */}
        <KpiItem
          icon={<Megaphone className="w-4 h-4" />}
          label1="TOTAL VISIBILITY"
          label2="TOUCHPOINTS"
          value={activeBrandData?.total_visibility_touchpoints}
          isObserved={totalObs > 0 && activeBrandData?.total_visibility_touchpoints !== null}
          comparison={`Brand: ${focusBrand}`}
          onClick={() => onOpenEvidence?.('TOTAL_VISIBILITY_TOUCHPOINTS', 'Total Online Visibility Touchpoints', focusBrand)}
        />

        {/* 2. Paid Media SOV */}
        <KpiItem
          icon={<Clock className="w-4 h-4" />}
          label1="PAID MEDIA"
          label2="SOV"
          value={activeBrandData?.paid_sov_pct !== null && activeBrandData?.paid_sov_pct !== undefined ? `${activeBrandData.paid_sov_pct.toFixed(1)}%` : null}
          isObserved={totalObs > 0 && activeBrandData?.paid_sov_pct !== null}
          comparison={`Brand: ${focusBrand}`}
          onClick={() => onOpenEvidence?.('PAID_MEDIA_SOV', 'Paid Media Share of Voice %', focusBrand)}
        />

        {/* 3. Social SOV */}
        <KpiItem
          icon={<Users className="w-4 h-4" />}
          label1="SOCIAL SOV"
          value={activeBrandData?.social_sov_pct !== null && activeBrandData?.social_sov_pct !== undefined ? `${activeBrandData.social_sov_pct.toFixed(1)}%` : null}
          isObserved={totalObs > 0 && activeBrandData?.social_sov_pct !== null}
          comparison={`Brand: ${focusBrand}`}
          onClick={() => onOpenEvidence?.('SOCIAL_SOV', 'Social Share of Voice %', focusBrand)}
        />

        {/* 4. E-Commerce SOV */}
        <KpiItem
          icon={<ShoppingCart className="w-4 h-4" />}
          label1="E-COMMERCE SOV"
          value={activeBrandData?.ecom_sov_pct !== null && activeBrandData?.ecom_sov_pct !== undefined ? `${activeBrandData.ecom_sov_pct.toFixed(1)}%` : null}
          isObserved={totalObs > 0 && activeBrandData?.ecom_sov_pct !== null}
          comparison={`Brand: ${focusBrand}`}
          onClick={() => onOpenEvidence?.('ECOMMERCE_SOV', 'E-Commerce Share of Voice %', focusBrand)}
        />

        {/* 5. Avg Selling Price */}
        <KpiItem
          icon={<Tag className="w-4 h-4" />}
          label1="AVG SELLING"
          label2="PRICE"
          unitPrefix="THB"
          value={activeBrandData?.avg_price_thb !== null && activeBrandData?.avg_price_thb !== undefined ? formatTHB(activeBrandData.avg_price_thb) : null}
          isObserved={totalObs > 0 && activeBrandData?.avg_price_thb !== null}
          comparison={`Brand: ${focusBrand}`}
          onClick={() => onOpenEvidence?.('AVG_SELLING_PRICE_THB', 'Average Selling Price', focusBrand)}
        />

        {/* 6. Avg Discount */}
        <KpiItem
          icon={<Percent className="w-4 h-4" />}
          label1="AVG DISCOUNT"
          value={activeBrandData?.avg_discount_pct !== null && activeBrandData?.avg_discount_pct !== undefined ? formatPercent(activeBrandData.avg_discount_pct) : null}
          isObserved={totalObs > 0 && activeBrandData?.avg_discount_pct !== null}
          comparison={`Brand: ${focusBrand}`}
        />

        {/* 7. Avg Consumer Rating */}
        <KpiItem
          icon={<Star className="w-4 h-4" />}
          label1="AVG CONSUMER"
          label2="RATING"
          value={displayRating !== null && displayRating !== undefined ? `${displayRating.toFixed(1)}` : null}
          suffix="/ 5"
          isObserved={displayRating !== null && displayRating !== undefined}
          comparison={reviewObs > 0 ? `${reviewObs} Reviews` : 'No reviews'}
        />
      </motion.div>

      {/* ── Visual Analytics: Competitor War Room & Shelf Share Trend ──────── */}
      <motion.div variants={itemVariants}>
        <ExecutiveVisualAnalytics
          data={data}
          selectedMonth={selectedMonth}
          selectedBrand={selectedBrand}
          isLoading={isLoading}
          onOpenEvidence={onOpenEvidence}
        />
      </motion.div>

      {/* ── 3-Column Main Content Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Competitive Posture Matrix */}
        <motion.div
          variants={itemVariants}
          className="rounded-[10px] bg-[#111111] border border-[#222222] p-5 flex flex-col justify-between"
        >
          <div>
            <div className="border-b border-[#222222] pb-3 mb-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Competitive Posture Matrix
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                Head-to-head comparison across key metrics for {monthInfo.label}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="text-left text-[10px] uppercase font-mono tracking-wider text-zinc-400 border-b border-[#222222] pb-2">
                    <th className="pb-2.5 font-semibold">Brand</th>
                    <th className="pb-2.5 text-center font-semibold">Visibility</th>
                    <th className="pb-2.5 text-center font-semibold">Paid SOV</th>
                    <th className="pb-2.5 text-center font-semibold">Social SOV</th>
                    <th className="pb-2.5 text-center font-semibold">Ecom SOV</th>
                    <th className="pb-2.5 text-right font-semibold">Avg Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e1e] text-zinc-300">
                  {TARGET_BRANDS.map((brand) => {
                    const b = data?.brands?.[brand];
                    const isFocus = brand === focusBrand;
                    const hasBData = totalObs > 0 && b && b.total_visibility_touchpoints !== null && b.total_visibility_touchpoints > 0;

                    return (
                      <tr key={brand} className={`transition-colors ${isFocus ? 'bg-[#1a1a24] border-l-2 border-sky-400' : 'hover:bg-[#151515]'}`}>
                        <td className="py-3 pl-2 pr-2">
                          <div className="font-semibold text-white">
                            {brand}
                            {brand === 'HP' && <span className="text-[10px] text-zinc-400 block font-normal font-sans">Primary Brand</span>}
                            {isFocus && brand !== 'HP' && <span className="text-[10px] text-sky-400 block font-normal font-sans">Selected Focus</span>}
                          </div>
                        </td>
                        <td className="py-3 text-center font-mono tabular-nums">
                          {hasBData ? b.total_visibility_touchpoints : '—'}
                        </td>
                        <td className="py-3 text-center font-mono tabular-nums">
                          {hasBData && b.paid_sov_pct !== null ? `${b.paid_sov_pct.toFixed(1)}%` : '—'}
                        </td>
                        <td className="py-3 text-center font-mono tabular-nums">
                          {hasBData && b.social_sov_pct !== null ? `${b.social_sov_pct.toFixed(1)}%` : '—'}
                        </td>
                        <td className="py-3 text-center font-mono tabular-nums">
                          {hasBData && b.ecom_sov_pct !== null ? `${b.ecom_sov_pct.toFixed(1)}%` : '—'}
                        </td>
                        <td className="py-3 text-right font-mono tabular-nums pr-2">
                          {hasBData && b.avg_price_thb !== null ? formatTHB(b.avg_price_thb) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => onNavigateSection?.('visibility')}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
            >
              <span>View full visibility comparison</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Column 2: Top Promoted SKUs (by Visibility) */}
        <motion.div
          variants={itemVariants}
          className="rounded-[10px] bg-[#111111] border border-[#222222] p-5 flex flex-col justify-between"
        >
          <div>
            <div className="border-b border-[#222222] pb-3 mb-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Top Promoted SKUs (by Visibility)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                Observed focus model per brand
              </p>
            </div>

            {totalObs === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-[8px] bg-[#161616] border border-[#262626] flex items-center justify-center text-zinc-400">
                  <Box className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    No Verified Data
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    No active observations for this period
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {TARGET_BRANDS.map((brand) => {
                  const b = data?.brands?.[brand];
                  if (!b?.top_promoted_sku) return null;
                  return (
                    <div
                      key={brand}
                      className={`p-3 rounded-[6px] border flex items-center justify-between text-xs font-sans transition-all ${
                        brand === focusBrand ? 'bg-[#181822] border-sky-800/80' : 'bg-[#161616] border-[#262626]'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">{brand} Focus Model</span>
                        <strong className="text-white block font-medium mt-0.5">{b.top_promoted_sku}</strong>
                      </div>
                      <span className="text-zinc-400 font-mono text-xs">{b.total_visibility_touchpoints} pts</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => onNavigateSection?.('skus')}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
            >
              <span>View SKU Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Column 3: Authentic Data Coverage Status */}
        <motion.div
          variants={itemVariants}
          className="rounded-[10px] bg-[#111111] border border-[#222222] p-5 flex flex-col justify-between"
        >
          <div>
            <div className="border-b border-[#222222] pb-3 mb-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Data Coverage Status
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                Verified observations ingested for {monthInfo.label}
              </p>
            </div>

            <div className="space-y-3">
              <CoverageRow
                icon={<Megaphone className="w-4 h-4 text-zinc-400" />}
                category="Paid Media"
                count={paidObs}
                isObserved={paidObs > 0}
              />
              <CoverageRow
                icon={<Users className="w-4 h-4 text-zinc-400" />}
                category="Social Media"
                count={socialObs}
                isObserved={socialObs > 0}
              />
              <CoverageRow
                icon={<ShoppingCart className="w-4 h-4 text-zinc-400" />}
                category="E-Commerce"
                count={ecomObs}
                isObserved={ecomObs > 0}
              />
              <CoverageRow
                icon={<Star className="w-4 h-4 text-zinc-400" />}
                category="Consumer Review"
                count={reviewObs}
                isObserved={reviewObs > 0}
              />
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => onNavigateSection?.('evidence')}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
            >
              <span>Go to Evidence Lake</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Full-Width Data Integrity Footer Banner ──────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="rounded-[8px] bg-[#111111] border border-[#222222] px-4 py-3 flex items-center justify-center gap-2.5 text-xs text-zinc-400 font-sans shadow-sm"
      >
        <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0" />
        <span>
          Strict Data Integrity Invariant: Zero synthetic or fabricated metrics. All values are derived strictly from verified observations.
        </span>
      </motion.div>
    </motion.div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiItemProps {
  icon: React.ReactNode;
  label1: string;
  label2?: string;
  unitPrefix?: string;
  value?: string | number | null;
  suffix?: string;
  isObserved: boolean;
  comparison: string;
  onClick?: () => void;
}

const KpiItem: React.FC<KpiItemProps> = ({
  icon,
  label1,
  label2,
  unitPrefix,
  value,
  suffix,
  isObserved,
  comparison,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 flex flex-col justify-between transition-colors ${
        onClick ? 'cursor-pointer hover:bg-[#161616]' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[10px] font-mono tracking-wider font-semibold uppercase leading-tight">
            {label1}
            {label2 && <span className="block">{label2}</span>}
          </span>
          <span className="text-zinc-500">{icon}</span>
        </div>

        <div className="my-1">
          {isObserved && value !== null && value !== undefined ? (
            <div className="text-lg lg:text-xl font-bold font-mono text-white tabular-nums tracking-tight">
              {unitPrefix && <span className="text-xs text-zinc-400 mr-1 font-sans">{unitPrefix}</span>}
              {value}
              {suffix && <span className="text-xs text-zinc-400 ml-1 font-sans">{suffix}</span>}
            </div>
          ) : (
            <div className="text-sm font-mono text-zinc-600 italic">
              —
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-[#1e1e1e] flex items-center justify-between text-[10px] font-mono">
        <span className="text-zinc-500 truncate">{comparison}</span>
        {isObserved ? (
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]" title="Verified Observation" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" title="Unobserved" />
        )}
      </div>
    </div>
  );
};

interface CoverageRowProps {
  icon: React.ReactNode;
  category: string;
  count: number;
  isObserved: boolean;
}

const CoverageRow: React.FC<CoverageRowProps> = ({ icon, category, count, isObserved }) => {
  return (
    <div className="flex items-center justify-between text-xs font-sans p-2 rounded-[6px] bg-[#161616] border border-[#222222]">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-zinc-300 font-medium">{category}</span>
      </div>
      <div className="flex items-center gap-2 font-mono">
        <span className={`text-xs ${isObserved ? 'text-white font-bold' : 'text-zinc-600'}`}>
          {isObserved ? `${count.toLocaleString()} obs` : 'No verified obs'}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isObserved ? 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]' : 'bg-zinc-700'
          }`}
        />
      </div>
    </div>
  );
};
