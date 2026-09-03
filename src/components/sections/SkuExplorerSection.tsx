/**
 * Section 6: SKU Explorer — 28 Canonical Ink Tank Master Registry (Luxury Enterprise Edition with Framer Motion)
 * Full master registry with 6-gate contamination disclosures and SKU mapping rules.
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { BrandPill } from '@/components/ui/BrandPill';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { MethodologyDisclosure } from '@/components/ui/MethodologyDisclosure';
import { ALL_MARKET_SKUS } from '@/config/skus';
import { TARGET_BRANDS } from '@/config/brands';
import { SkuMasterDefinition, TargetBrand } from '@/types/brands';
import { SkuComparisonRecord, AnalyticalMonth } from '@/types/analytics';
import { Search, ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react';
import { formatTHB, formatPercent } from '@/lib/utils';
import { motion, type Variants } from 'framer-motion';

interface SkuExplorerSectionProps {
  skuMetrics: SkuComparisonRecord[];
  selectedBrand?: TargetBrand | 'All';
  selectedMonth?: AnalyticalMonth;
  onOpenEvidence: (metricId: string, metricName: string, brand: TargetBrand | 'All', skuId?: string) => void;
}

type SortField =
  | 'model_name'
  | 'brand'
  | 'launch_rrp_thb'
  | 'avg_price_thb'
  | 'avg_discount_pct'
  | 'sales_traction_index';
type SortDir = 'asc' | 'desc';

type EnrichedSku = SkuMasterDefinition & { metrics?: SkuComparisonRecord };

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

export const SkuExplorerSection: React.FC<SkuExplorerSectionProps> = ({
  skuMetrics,
  selectedBrand = 'All',
  selectedMonth,
  onOpenEvidence,
}) => {
  const [query, setQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<TargetBrand | 'All'>(selectedBrand);
  const [segmentFilter, setSegmentFilter] = useState<'All' | 'SMB' | 'Consumer'>('All');
  const [sortField, setSortField] = useState<SortField>('brand');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Sync with parent selected brand filter
  useEffect(() => {
    setBrandFilter(selectedBrand);
  }, [selectedBrand]);

  // Merge market SKUs with live metric rows
  const enriched: EnrichedSku[] = useMemo(() => {
    return (ALL_MARKET_SKUS as readonly SkuMasterDefinition[]).map((sku) => ({
      ...sku,
      metrics: skuMetrics.find((m) => m.sku_id === sku.sku_id),
    }));
  }, [skuMetrics]);

  // Filter
  const filtered = useMemo(() => {
    return enriched.filter((s) => {
      if (brandFilter !== 'All' && s.brand !== brandFilter) return false;
      if (segmentFilter === 'Consumer' && !s.target_segment.startsWith('Consumer')) return false;
      if (segmentFilter === 'SMB' && !s.target_segment.startsWith('Small')) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          !s.model_name.toLowerCase().includes(q) &&
          !s.sku_id.toLowerCase().includes(q) &&
          !s.family.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [enriched, brandFilter, segmentFilter, query]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: number | string | null | undefined;
      let bVal: number | string | null | undefined;

      switch (sortField) {
        case 'model_name': aVal = a.model_name; bVal = b.model_name; break;
        case 'brand': aVal = a.brand; bVal = b.brand; break;
        case 'launch_rrp_thb': aVal = a.launch_rrp_thb; bVal = b.launch_rrp_thb; break;
        case 'avg_price_thb': aVal = a.metrics?.avg_price_thb ?? -1; bVal = b.metrics?.avg_price_thb ?? -1; break;
        case 'avg_discount_pct': aVal = a.metrics?.avg_discount_pct ?? -1; bVal = b.metrics?.avg_discount_pct ?? -1; break;
        case 'sales_traction_index': aVal = a.metrics?.sales_traction_index ?? -1; bVal = b.metrics?.sales_traction_index ?? -1; break;
        default: aVal = a.brand; bVal = b.brand;
      }

      if (aVal === null || aVal === undefined) aVal = sortDir === 'asc' ? Infinity : -Infinity;
      if (bVal === null || bVal === undefined) bVal = sortDir === 'asc' ? Infinity : -Infinity;

      const cmp =
        typeof aVal === 'string' && typeof bVal === 'string'
          ? aVal.localeCompare(bVal)
          : (aVal as number) - (bVal as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const ColHeader: React.FC<{
    field: SortField;
    label: string;
    align?: 'left' | 'right';
    tooltip?: string;
    className?: string;
  }> = ({ field, label, align = 'left', tooltip, className }) => (
    <th
      className={`px-5 py-3 text-[11px] font-sans font-semibold uppercase tracking-wider text-zinc-400 cursor-pointer hover:text-white select-none transition-colors ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${className ?? ''}`}
      onClick={() => toggleSort(field)}
    >
      <span className={`inline-flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {label}
        {tooltip && <InfoTooltip content={tooltip} />}
        {sortField === field ? (
          sortDir === 'asc' ? (
            <ChevronUp className="w-3.5 h-3.5 text-white" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-white" />
          )
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
        )}
      </span>
    </th>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7 font-sans"
    >
      {/* Header */}
      <SectionHeader
        title="5. Product / SKU Push & Commercial Traction"
        subtitle={`${enriched.length} canonical printer models across HP, Epson, Canon, and Brother in the Thailand market.`}
        period={selectedMonth}
        badge={`${enriched.length} CANONICAL MODELS`}
      />

      {/* Taxonomy & Integrity Scope Disclosure */}
      <motion.div variants={itemVariants}>
        <MethodologyDisclosure
          defaultExpanded={false}
          title="SKU Taxonomy Governance & Contamination Safeguards"
          description={`The ${enriched.length} canonical models constitute the comprehensive competitive universe monitored in Thailand. Crawled products pass through a 4-stage regex normalizer and a 6-gate contamination classifier. Ingested listings for ink bottles, refill tanks, printheads, and photo paper are automatically filtered out to ensure clean hardware pricing.`}
          rules={[
            {
              label: 'No Ambiguous Mapping',
              rule: `Listings that cannot be resolved to one of the ${enriched.length} canonical SKUs remain Unassigned.`,
            },
            {
              label: 'Hardware Isolation',
              rule: 'Standalone consumables (e.g. GT53, GI-71, 003 ink bottles) are quarantined from hardware prices.',
            },
            {
              label: 'Benchmark Equivalents',
              rule: 'Direct competitor equivalents are mapped based on print speed, duty cycle, and connectivity.',
            },
          ]}
        />
      </motion.div>

      {/* Filter Toolbar */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 flex flex-wrap items-center gap-3.5 bg-[#0c0c0e]/90 border-zinc-800 rounded-xl shadow-sm font-sans">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="sku-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search model, SKU ID, or family…"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setBrandFilter('All')}
              className={`px-3 py-1 rounded-full text-xs font-sans font-medium transition-all ${
                brandFilter === 'All'
                  ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
              }`}
            >
              ALL
            </button>
            {TARGET_BRANDS.map((b) => (
              <span key={b} onClick={() => setBrandFilter(b === brandFilter ? 'All' : b)} className="cursor-pointer">
                <BrandPill brand={b} size="sm" active={brandFilter === 'All' || brandFilter === b} />
              </span>
            ))}
          </div>

          {/* Segment Filter */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-full border border-zinc-800 text-xs">
            {(['All', 'Consumer', 'SMB'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSegmentFilter(s)}
                className={`px-3 py-0.5 rounded-full font-sans transition-all ${
                  segmentFilter === s
                    ? 'bg-zinc-800 text-white font-semibold border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {s === 'SMB' ? 'Business' : s}
              </button>
            ))}
          </div>

          <span className="text-xs text-zinc-400 ml-auto font-mono tabular-nums">{sorted.length} / 28 SKUs</span>
        </Card>
      </motion.div>

      {/* Master Registry Table */}
      <motion.div variants={itemVariants}>
        <Card className="p-0 overflow-hidden bg-[#0c0c0e]/90 border-zinc-800 rounded-xl shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans border-collapse">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 sticky top-0 z-10 text-zinc-400">
                <tr>
                  <ColHeader field="model_name" label="Model" />
                  <ColHeader field="brand" label="Brand" />
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider hidden md:table-cell">
                    Segment
                  </th>
                  <ColHeader
                    field="launch_rrp_thb"
                    label="Launch RRP"
                    align="right"
                    tooltip="Manufacturer recommended retail price at Thailand launch."
                  />
                  <ColHeader
                    field="avg_price_thb"
                    label="Obs. Avg Price"
                    align="right"
                    tooltip="Observed average selling price across e-commerce marketplaces."
                  />
                  <ColHeader
                    field="avg_discount_pct"
                    label="Avg Discount"
                    align="right"
                    tooltip="Observed discount depth relative to launch RRP."
                  />
                  <ColHeader
                    field="sales_traction_index"
                    label="Traction Index"
                    align="right"
                    tooltip="Observable Cumulative Sales Traction Index (lifetime marketplace counter)."
                  />
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1.5">
                      Competitor Benchmark
                      <InfoTooltip content="Direct functional equivalents in the 28-SKU taxonomy." />
                    </span>
                  </th>
                  <th className="px-5 py-3 text-right w-14">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {sorted.map((sku) => {
                  const m = sku.metrics;
                  const isHp = sku.brand === 'HP';
                  return (
                    <tr
                      key={sku.sku_id}
                      className={`transition-colors ${
                        isHp ? 'bg-white/[0.02] hover:bg-white/[0.05]' : 'hover:bg-zinc-900/50'
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <span className="font-semibold text-white font-sans text-xs block">{sku.model_name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{sku.sku_id}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <BrandPill brand={sku.brand} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {sku.target_segment.startsWith('Consumer') ? 'Consumer' : 'SMB'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono tabular-nums text-zinc-400">
                        {sku.launch_rrp_thb !== null ? formatTHB(sku.launch_rrp_thb) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono tabular-nums">
                        {m?.avg_price_thb !== null && m?.avg_price_thb !== undefined ? (
                          <span className="font-bold text-white">{formatTHB(m.avg_price_thb)}</span>
                        ) : (
                          <span className="text-zinc-600 italic">NO DATA</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono tabular-nums">
                        {m?.avg_discount_pct !== null && m?.avg_discount_pct !== undefined ? (
                          <span className="font-semibold text-zinc-200">{formatPercent(m.avg_discount_pct)}</span>
                        ) : (
                          <span className="text-zinc-600 italic">NO DATA</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono tabular-nums">
                        {m?.sales_traction_index !== null && m?.sales_traction_index !== undefined ? (
                          <span className="font-bold text-white">{m.sales_traction_index.toLocaleString()}</span>
                        ) : (
                          <span className="text-zinc-600 italic">NO DATA</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {sku.competitor_equivalents?.slice(0, 2).map((eq) => (
                            <span
                              key={eq}
                              className="text-[11px] font-sans font-medium px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 shadow-sm"
                            >
                              {eq}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {m && m.observation_count > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenEvidence('AVG_SELLING_PRICE_THB', 'Average Selling Price (THB)', sku.brand, sku.sku_id)
                            }
                            aria-label={`View evidence for ${sku.model_name}`}
                            className="text-zinc-400 hover:text-white transition-colors"
                            title="Trace to source observations"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sorted.length === 0 && (
              <div className="py-14 text-center text-zinc-500 text-xs font-sans">
                No canonical SKUs match the selected criteria.
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
