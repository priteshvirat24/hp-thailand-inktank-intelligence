/**
 * Dashboard Header — Global Context Bar (Pixel-Accurate Enterprise Edition)
 * Reconstructed based on reference design: HP monogram, title, status badge, Period box, brand filters, and crawler controls.
 */

'use client';

import React from 'react';
import { AnalyticalMonth } from '@/types/analytics';
import { TargetBrand } from '@/types/brands';
import { TARGET_BRANDS } from '@/config/brands';
import { BrandPill } from '@/components/ui/BrandPill';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { Calendar, RefreshCw, Database, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  selectedMonth: AnalyticalMonth;
  onSelectMonth: (month: AnalyticalMonth) => void;
  selectedBrand: TargetBrand | 'All';
  onSelectBrand: (brand: TargetBrand | 'All') => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onRefresh?: () => void;
  onOpenIngestionStatus?: () => void;
  isRefreshing?: boolean;
}

const MONTH_DETAILS: Record<
  AnalyticalMonth,
  { label: string; range: string; note: string }
> = {
  '2026-06': {
    label: 'JUN 2026',
    range: '28 May – 30 Jun 2026',
    note: 'Includes baseline observations from 28 May through 30 June 2026. Late-May data is rolled into June according to the 90-day window specification.',
  },
  '2026-07': {
    label: 'JUL 2026',
    range: '1 Jul – 31 Jul 2026',
    note: 'Full-month observations for July 2026 across Paid Media, Social, and E-Commerce channels.',
  },
  '2026-08': {
    label: 'AUG 2026',
    range: '1 Aug – 28 Aug 2026',
    note: 'Current observation period for August 2026 (1 August through 28 August 2026 window close).',
  },
  'ALL': {
    label: 'ALL 3 MONTHS',
    range: '28 May – 28 Aug 2026',
    note: 'Consolidated 90-day multi-channel competitive intelligence spanning June, July, and August 2026 together.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  selectedMonth,
  onSelectMonth,
  selectedBrand,
  onSelectBrand,
  theme = 'light',
  onToggleTheme,
  onRefresh,
  onOpenIngestionStatus,
  isRefreshing = false,
}) => {
  const currentMonthInfo = MONTH_DETAILS[selectedMonth];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0A0A0A] border-b border-[#222222] px-6 py-3.5">
      <div className="max-w-screen-2xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4 font-sans">
        {/* Left: Product Identity */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-9 h-9 rounded-full border border-zinc-700 bg-[#111111] flex items-center justify-center text-white font-bold text-xs tracking-tight">
            HP
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[13px] font-bold text-white uppercase tracking-wider font-mono">
                HP Ink Tank Competitive Intelligence — Thailand
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#161616] border border-[#2a2a2a] text-emerald-400 font-semibold">
                Enterprise Intelligence
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-normal">
              HP vs Epson, Canon, and Brother | Period: 28 May–28 Aug 2026 (90 Days)
            </p>
          </div>
        </div>

        {/* Right: Context Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Period Box */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#111111] border border-[#222222] text-xs">
            <span className="text-zinc-400">Period:</span>
            <strong className="text-white font-mono font-semibold">{currentMonthInfo.label}</strong>
            <span className="text-zinc-500 font-mono text-[11px] hidden sm:inline">({currentMonthInfo.range})</span>
            <InfoTooltip
              title={`Analytical Window: ${currentMonthInfo.label}`}
              content={currentMonthInfo.note}
              notMeaning="May is not a separate reporting month; late-May data is systematically consolidated into June."
            />
          </div>

          {/* Month Selector Pills */}
          <div className="flex items-center bg-[#111111] p-1 rounded-[6px] border border-[#222222] gap-1">
            <span className="pl-1.5 pr-1 text-zinc-500">
              <Calendar className="w-3.5 h-3.5" />
            </span>
            {(['2026-06', '2026-07', '2026-08', 'ALL'] as const).map((m) => {
              const isSelected = selectedMonth === m;
              return (
                <button
                  key={m}
                  id={`month-btn-${m}`}
                  onClick={() => onSelectMonth(m)}
                  title={MONTH_DETAILS[m].range}
                  aria-pressed={isSelected}
                  className={`px-2.5 py-0.5 text-xs font-mono font-semibold rounded-[4px] transition-colors select-none ${
                    isSelected
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1c1c1c]'
                  }`}
                >
                  {m === 'ALL' ? 'ALL 3M' : MONTH_DETAILS[m].label.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Brand Filter */}
          <div className="flex items-center bg-[#111111] p-1 rounded-[6px] border border-[#222222] gap-1">
            <button
              id="brand-filter-all"
              onClick={() => onSelectBrand('All')}
              aria-pressed={selectedBrand === 'All'}
              className={`px-2.5 py-0.5 text-xs font-sans font-semibold rounded-[4px] transition-all select-none ${
                selectedBrand === 'All'
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white hover:bg-[#1c1c1c]'
              }`}
            >
              ALL
            </button>
            {TARGET_BRANDS.map((brand) => (
              <span
                key={brand}
                onClick={() => onSelectBrand(brand === selectedBrand ? 'All' : brand)}
                className="cursor-pointer"
              >
                <BrandPill
                  brand={brand}
                  size="sm"
                  active={selectedBrand === 'All' || selectedBrand === brand}
                />
              </span>
            ))}
          </div>

          {/* Crawlers Button */}
          {onOpenIngestionStatus && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenIngestionStatus}
              title="Inspect Crawler Operations and Provider Status"
              aria-label="Crawler Operations & Provider Status"
              className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#111111] hover:bg-[#181818] border border-[#222222] text-zinc-200 hover:text-white text-xs font-sans font-medium transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-zinc-400" />
              <span>Crawlers</span>
            </motion.button>
          )}

          {/* Theme Invert Toggle (Dark / Light) */}
          {onToggleTheme && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleTheme}
              id="theme-toggle-btn"
              title={`Switch to ${theme === 'dark' ? 'Light Mode (Inverted Theme)' : 'Dark Mode'}`}
              aria-label="Toggle light/dark theme"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[#111111] hover:bg-[#181818] border border-[#222222] text-zinc-300 hover:text-white text-xs font-mono font-medium transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </motion.button>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Re-query the Analytical Metric Cube and refresh data"
              aria-label="Refresh analytical cache"
              className="p-2 rounded-[6px] bg-[#111111] hover:bg-[#181818] border border-[#222222] text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};
