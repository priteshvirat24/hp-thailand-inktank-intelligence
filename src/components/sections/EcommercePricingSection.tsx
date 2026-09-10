/**
 * Section 5: E-Commerce Presence, Pricing & Promos — Luxury Enterprise Edition with Framer Motion
 *
 * CRITICAL INVARIANT: Cumulative marketplace sold counters MUST be labeled
 * "Observable Cumulative Sales Traction Index" — never "monthly sales" or "units sold".
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { BrandPill } from '@/components/ui/BrandPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataStateBadge } from '@/components/ui/DataStateBadge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { MethodologyDisclosure } from '@/components/ui/MethodologyDisclosure';
import { TARGET_BRANDS } from '@/config/brands';
import { AnalyticalMonth, BrandComparisonRecord, SkuComparisonRecord, ExecutiveOverviewData } from '@/types/analytics';
import { TargetBrand } from '@/types/brands';
import { ArrowUpRight, Search } from 'lucide-react';
import { formatTHB, formatPercent } from '@/lib/utils';
import { motion, type Variants } from 'framer-motion';

interface EcommercePricingSectionProps {
  selectedMonth: AnalyticalMonth;
  selectedBrand?: TargetBrand | 'All';
  summary?: ExecutiveOverviewData | null;
  skus: SkuComparisonRecord[];
  listingComparisons: BrandComparisonRecord[];
  ecomSovComparisons: BrandComparisonRecord[];
  onOpenEvidence: (metricId: string, metricName: string, brand: TargetBrand | 'All', skuId?: string) => void;
}

const MONTH_LABELS: Record<AnalyticalMonth, { label: string; range: string }> = {
  '2026-06': { label: 'June 2026', range: '28 May – 30 Jun 2026' },
  '2026-07': { label: 'July 2026', range: '1 Jul – 31 Jul 2026' },
  '2026-08': { label: 'August 2026', range: '1 Aug – 28 Aug 2026' },
  'ALL': { label: 'All 3 Months', range: '28 May – 28 Aug 2026 (90 Days)' },
};

const ECOM_PLATFORMS = [
  'Shopee Mall (Official Stores & Verified Listings)',
  'JIB Thailand (jib.co.th)',
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

export const EcommercePricingSection: React.FC<EcommercePricingSectionProps> = ({
  selectedMonth,
  selectedBrand = 'All',
  summary,
  skus,
  listingComparisons,
  ecomSovComparisons,
  onOpenEvidence,
}) => {
  const hasData = skus.some((s) => s.avg_price_thb !== null || s.sales_traction_index !== null);
  const monthInfo = MONTH_LABELS[selectedMonth];

  const [brandFilter, setBrandFilter] = useState<TargetBrand | 'All'>(selectedBrand);
  const [showAllSkus, setShowAllSkus] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync with global brand filter
  React.useEffect(() => {
    setBrandFilter(selectedBrand);
  }, [selectedBrand]);

  const filteredSkus = useMemo(() => {
    return skus.filter((s) => {
      if (brandFilter !== 'All' && s.brand !== brandFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!s.model_name.toLowerCase().includes(q) && !s.sku_id.toLowerCase().includes(q)) return false;
      }
      return s.avg_price_thb !== null || s.sales_traction_index !== null;
    });
  }, [skus, brandFilter, searchQuery]);

  const displayedSkus = useMemo(() => {
    return showAllSkus ? filteredSkus : filteredSkus.slice(0, 15);
  }, [filteredSkus, showAllSkus]);

  if (!hasData) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="E-Commerce Presence, Pricing & Promos"
          subtitle={`Observed pricing dynamics and promotional activity across Thai marketplaces — ${monthInfo.label}.`}
          period={monthInfo.label}
          sources={ECOM_PLATFORMS}
          totalEvidence={0}
        />
        <EmptyState
          title="NO E-COMMERCE OBSERVATIONS FOR THIS PERIOD"
          message={`No marketplace listings or pricing records ingested for ${monthInfo.label} (${monthInfo.range}). Run the Shopee and JIB adapters to populate pricing intelligence.`}
          actionText="Open Crawler Operations"
        />
      </div>
    );
  }

  // Consume brand-level metrics directly from the authoritative Analytical Metric Cube
  const brandAggregates = TARGET_BRANDS.map((brand) => {
    const brandSummary = summary?.brands?.[brand];
    const brandSkus = skus.filter((s) => s.brand === brand && s.avg_price_thb !== null);

    // Observation-weighted average price calculation to eliminate unweighted average-of-averages
    const totalPricedObs = brandSkus.reduce((acc, s) => acc + s.observation_count, 0);
    const weightedPriceSum = brandSkus.reduce((acc, s) => acc + (s.avg_price_thb ?? 0) * s.observation_count, 0);
    const avgPriceFallback = totalPricedObs > 0 ? Math.round(weightedPriceSum / totalPricedObs) : null;
    const avgPrice = brandSummary?.avg_price_thb ?? avgPriceFallback;

    // Filter strictly to listings with active discounts (discount > 0) to avoid discount deflation
    const discountedSkus = brandSkus.filter((s) => typeof s.avg_discount_pct === 'number' && s.avg_discount_pct > 0);
    const totalDiscountObs = discountedSkus.reduce((acc, s) => acc + s.observation_count, 0);
    const weightedDiscountSum = discountedSkus.reduce(
      (acc, s) => acc + (s.avg_discount_pct ?? 0) * s.observation_count,
      0
    );
    const avgDiscountFallback = totalDiscountObs > 0 ? Number((weightedDiscountSum / totalDiscountObs).toFixed(1)) : null;
    const avgDiscount = brandSummary?.avg_discount_pct ?? avgDiscountFallback;

    const hasAnyTraction = brandSkus.some((s) => typeof s.sales_traction_index === 'number');
    const totalTraction = hasAnyTraction
      ? brandSkus.reduce((a, b) => a + (b.sales_traction_index ?? 0), 0)
      : null;
    const listComp = listingComparisons.find((c) => c.brand === brand);
    const sovComp = ecomSovComparisons.find((c) => c.brand === brand);

    return { brand, avgPrice, avgDiscount, totalTraction, activeSkus: brandSkus.length, listComp, sovComp };
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7 font-sans"
    >
      {/* Header */}
      <SectionHeader
        title="4. Promotions & Pricing Intelligence"
        subtitle={`Observed pricing dynamics, discount depth, and promotional mechanics across Thai e-commerce platforms — ${monthInfo.label}.`}
        period={monthInfo.label}
        sources={ECOM_PLATFORMS}
        totalEvidence={summary?.channel_observations?.ecommerce ?? skus.reduce((a, b) => a + b.observation_count, 0)}
      />

      {/* Critical Traction Invariant Disclosure Banner */}
      <motion.div variants={itemVariants}>
        <MethodologyDisclosure
          variant="warning"
          defaultExpanded={true}
          title="Critical Invariant: Observable Cumulative Sales Traction Index"
          description="Marketplace 'sold' badges (e.g. '1.2k sold') are lifetime cumulative counters displayed by platforms. They are represented here strictly as the Observable Cumulative Sales Traction Index. Do not interpret as monthly sales, monthly revenue, unit sell-through, or market share."
          formula="Cumulative Traction Index = Σ (Marketplace displayed lifetime sales badges for verified canonical listings)"
          rules={[
            {
              label: 'Lifetime Counters',
              rule: 'Marketplaces do not publish monthly sales increments via public product cards.',
            },
            {
              label: 'Directional Benchmark',
              rule: 'Used only as a directional indicator of product velocity relative to competitor models.',
            },
          ]}
        />
      </motion.div>

      {/* 4-Brand Pricing Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {brandAggregates.map(({ brand, avgPrice, avgDiscount, totalTraction, activeSkus, listComp, sovComp }) => {
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
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 font-sans">
                <BrandPill brand={brand} size="md" />
                <span className="text-xs text-zinc-400 font-mono tabular-nums">{activeSkus} SKUs Observed</span>
              </div>

              <dl className="space-y-2.5 text-xs font-sans">
                <div className="flex justify-between items-center">
                  <dt className="text-zinc-400 flex items-center gap-1.5 font-normal">
                    <span>Category Avg Price:</span>
                    <InfoTooltip
                      title="Average Observed Selling Price"
                      content="Mean observed selling price in Thai Baht (THB) across all active marketplace listings for this brand."
                    />
                  </dt>
                  <dd className={avgPrice !== null ? 'font-bold text-white font-mono tabular-nums' : 'text-zinc-600 italic font-mono'}>
                    {avgPrice !== null ? formatTHB(avgPrice) : 'NO DATA'}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-zinc-400 flex items-center gap-1.5 font-normal">
                    <span>Avg Discount Depth:</span>
                    <InfoTooltip
                      title="Average Discount Depth (%)"
                      content="Mean percentage discount observed off manufacturer launch RRP on marketplace listings."
                    />
                  </dt>
                  <dd className={avgDiscount !== null ? 'font-semibold text-zinc-200 font-mono tabular-nums' : 'text-zinc-600 italic font-mono'}>
                    {avgDiscount !== null ? formatPercent(avgDiscount) : 'NO DATA'}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-zinc-400 flex items-center gap-1.5 font-normal">
                    <span>E-Comm Shelf SOV:</span>
                    <InfoTooltip
                      title="E-Commerce Share of Voice"
                      content="Brand active listings divided by total 4-brand active listings."
                    />
                  </dt>
                  <dd className={sovComp?.value !== null && sovComp?.value !== undefined ? 'font-semibold text-white font-mono tabular-nums' : 'text-zinc-600 italic font-mono'}>
                    {sovComp?.value !== null && sovComp?.value !== undefined
                      ? `${sovComp.value.toFixed(1)}%`
                      : 'NO DATA'}
                  </dd>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-zinc-800/80">
                  <dt className="text-zinc-400 text-xs font-medium flex items-center gap-1.5">
                    <span>Cumul. Traction Index:</span>
                    <InfoTooltip
                      title="Observable Cumulative Sales Traction Index"
                      content="Derived from marketplace cumulative sold counters. This is a directional observable traction signal, not monthly sales volume."
                      notMeaning="Monthly sales, monthly revenue, or POS sell-through."
                    />
                  </dt>
                  <dd className={totalTraction !== null && totalTraction > 0 ? 'font-bold text-white font-mono tabular-nums' : 'text-zinc-600 italic font-mono'}>
                    {totalTraction !== null && totalTraction > 0 ? totalTraction.toLocaleString() : 'NO DATA'}
                  </dd>
                </div>
              </dl>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <DataStateBadge state={listComp?.data_state ?? 'MISSING'} />
                {listComp && listComp.observation_count > 0 && (
                  <button
                    type="button"
                    onClick={() => onOpenEvidence('ECOMMERCE_LISTINGS_COUNT', 'Active Marketplace Listings', brand)}
                    className="text-xs font-sans font-medium text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                    title={`Trace all ${listComp.observation_count} listings for ${brand}`}
                  >
                    <span>Trace Listings ({listComp.observation_count})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </motion.div>

      {/* SKU-Level Pricing Matrix Table */}
      {skus.some((s) => s.avg_price_thb !== null || s.sales_traction_index !== null) && (
        <motion.div variants={itemVariants}>
          <Card className="p-0 overflow-hidden bg-[#0c0c0e]/90 border-zinc-800 rounded-xl shadow-md">
            <div className="px-6 py-4 border-b border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  SKU-Level Pricing &amp; Market Position Matrix — {monthInfo.label}
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Observed price points and promotional discounts across all {displayedSkus.length} of {filteredSkus.length} active market models in Thailand
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAllSkus(!showAllSkus)}
                  className={`text-[11px] font-mono px-3 py-1 rounded-full border transition-colors ${
                    showAllSkus
                      ? 'bg-zinc-100 text-black border-zinc-100 font-semibold'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  {showAllSkus ? `Showing All (${filteredSkus.length} SKUs)` : `Top 15 Models (Show All ${filteredSkus.length})`}
                </button>
                <span className="text-[11px] font-mono text-zinc-400 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                  Prices in THB (฿)
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="px-6 py-3 bg-zinc-950/60 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-zinc-500 uppercase mr-1">Brand:</span>
                {(['All', ...TARGET_BRANDS] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBrandFilter(b)}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-colors ${
                      brandFilter === b
                        ? 'bg-white text-black border-white font-semibold'
                        : 'text-zinc-400 border-zinc-800 hover:border-zinc-600 bg-zinc-900/60'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px] flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter models or SKU ID..."
                  className="w-full sm:w-56 bg-zinc-900/90 border border-zinc-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-sans"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans border-collapse">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[11px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">Model</th>
                    <th className="px-5 py-3 text-left font-semibold">Brand</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      <span className="inline-flex items-center gap-1.5 justify-end">
                        Observed Avg Price
                        <InfoTooltip content="Average selling price observed across marketplace product cards." />
                      </span>
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      <span className="inline-flex items-center gap-1.5 justify-end">
                        Avg Discount
                        <InfoTooltip content="Observed discount depth relative to launch RRP." />
                      </span>
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      <span className="inline-flex items-center gap-1.5 justify-end">
                        Promo Share
                        <InfoTooltip content="Share of listings with active promotional tags or vouchers." />
                      </span>
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      <span className="inline-flex items-center gap-1.5 justify-end">
                        Cumul. Traction Index
                        <InfoTooltip
                          title="Observable Cumulative Sales Traction Index"
                          content="Lifetime cumulative sales badge counter. Not monthly sales."
                        />
                      </span>
                    </th>
                    <th className="px-5 py-3 text-right font-semibold w-16">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {displayedSkus.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-zinc-500 text-xs font-mono">
                        No SKUs matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    displayedSkus.map((sku) => {
                      const isHp = sku.brand === 'HP';
                      return (
                        <tr
                          key={sku.sku_id}
                          className={`transition-colors ${
                            isHp ? 'bg-white/[0.02] hover:bg-white/[0.05]' : 'hover:bg-zinc-900/50'
                          }`}
                        >
                          <td className="px-5 py-3 font-semibold text-white">
                            <div>
                              <span>{sku.model_name}</span>
                              <span className="text-[10px] text-zinc-500 font-mono block">{sku.sku_id}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <BrandPill brand={sku.brand} size="sm" />
                          </td>
                          <td className="px-5 py-3 text-right font-mono tabular-nums">
                            {sku.avg_price_thb !== null ? (
                              <span className="text-white font-bold">{formatTHB(sku.avg_price_thb)}</span>
                            ) : (
                              <span className="text-zinc-600 italic">NO DATA</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right font-mono tabular-nums">
                            {sku.avg_discount_pct !== null ? (
                              <span className="text-zinc-200 font-medium">{formatPercent(sku.avg_discount_pct)}</span>
                            ) : (
                              <span className="text-zinc-600 italic">NO DATA</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right font-mono tabular-nums">
                            {sku.promo_penetration_pct !== null ? (
                              <span className="text-zinc-400">{formatPercent(sku.promo_penetration_pct)}</span>
                            ) : (
                              <span className="text-zinc-600 italic">NO DATA</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right font-mono tabular-nums">
                            {sku.sales_traction_index !== null ? (
                              <span className="text-white font-bold">{sku.sales_traction_index.toLocaleString()}</span>
                            ) : (
                              <span className="text-zinc-600 italic">NO DATA</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            {sku.observation_count > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  onOpenEvidence('AVG_SELLING_PRICE_THB', 'Average Selling Price (THB)', sku.brand, sku.sku_id)
                                }
                                className="text-zinc-400 hover:text-white inline-flex items-center gap-1 text-xs font-medium transition-colors"
                                title={`Trace pricing evidence for ${sku.model_name}`}
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Collapsible Methodology Disclosure */}
      <motion.div variants={itemVariants}>
        <MethodologyDisclosure
          title="E-Commerce Pricing Extraction & Promotion Rules"
          description="Prices are extracted from official brand mall stores and certified electronics retailers in Thailand. Vouchers, bundled freebies, and delivery fee adjustments are separated into promotional tags rather than altering the core selling price."
          rules={[
            {
              label: 'Launch RRP Benchmark',
              rule: 'Discounts are calculated strictly relative to manufacturer suggested launch RRP in Thailand.',
            },
            {
              label: 'Marketplace Deduplication',
              rule: 'Multiple listings for the identical SKU from the same merchant within 24h are deduplicated.',
            },
          ]}
        />
      </motion.div>
    </motion.div>
  );
};
