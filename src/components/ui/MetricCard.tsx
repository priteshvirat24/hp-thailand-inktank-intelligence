/**
 * Metric Card Component — Luxury Enterprise Aesthetic with Framer Motion
 * Formats KPI metrics, units, missing data states, contextual info tooltips, and evidence drilldowns.
 */

'use client';

import React from 'react';
import { DataState, MetricUnit } from '@/types/analytics';
import { DataStateBadge } from './DataStateBadge';
import { InfoTooltip } from './InfoTooltip';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface MetricTooltipConfig {
  title?: string;
  content: string;
  notMeaning?: string;
  sourceNote?: string;
}

interface MetricCardProps {
  title: string;
  value: number | string | null;
  unit?: MetricUnit | string;
  dataState?: DataState;
  subtitle?: string;
  tooltip?: string | MetricTooltipConfig;
  icon?: React.ReactNode;
  evidenceCount?: number;
  focal?: boolean;
  onViewEvidence?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  dataState = 'OBSERVED',
  subtitle,
  tooltip,
  icon,
  evidenceCount = 0,
  focal = false,
  onViewEvidence,
  className,
}) => {
  // Format display value strictly preserving missing-vs-zero
  let formattedValue: React.ReactNode = '—';

  if (value === null || dataState === 'MISSING') {
    formattedValue = (
      <span className="text-zinc-500 text-base font-mono font-normal">
        NO DATA
      </span>
    );
  } else if (dataState === 'INSUFFICIENT_EVIDENCE') {
    formattedValue = (
      <span className="text-zinc-400 text-xs font-mono italic">
        INSUFFICIENT EVIDENCE
      </span>
    );
  } else if (typeof value === 'number') {
    if (unit === 'THB') {
      formattedValue = `฿${value.toLocaleString()}`;
    } else if (unit === 'Percentage') {
      formattedValue = `${value.toFixed(1)}%`;
    } else if (unit === 'Count' || unit === 'Index') {
      formattedValue = value.toLocaleString();
    } else if (unit === 'Score') {
      formattedValue = value.toFixed(1);
    } else {
      formattedValue = value.toLocaleString();
    }
  } else {
    formattedValue = value;
  }

  const tooltipConfig =
    typeof tooltip === 'string'
      ? { content: tooltip, title }
      : tooltip;

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        'relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-150 font-sans shadow-sm',
        focal
          ? 'bg-zinc-900/90 border-zinc-700 shadow-md shadow-black/40'
          : 'bg-[#0c0c0e]/95 border-zinc-800 hover:border-zinc-700/80',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-sans uppercase tracking-wider text-zinc-300 font-semibold block">
              {title}
            </span>
            {tooltipConfig && (
              <InfoTooltip
                title={tooltipConfig.title || title}
                content={tooltipConfig.content}
                notMeaning={tooltipConfig.notMeaning}
                sourceNote={tooltipConfig.sourceNote}
              />
            )}
          </div>
          {subtitle && <p className="text-xs text-zinc-400 font-sans leading-relaxed">{subtitle}</p>}
        </div>
        {icon && <span className="text-zinc-500 p-1 rounded-lg bg-zinc-900/60 shrink-0">{icon}</span>}
      </div>

      {/* Main KPI Value */}
      <div className="my-2.5">
        <div className="text-2xl font-bold font-mono tracking-tight text-white flex items-baseline gap-1.5 tabular-nums">
          {formattedValue}
          {unit && typeof value === 'number' && unit !== 'THB' && unit !== 'Percentage' && (
            <span className="text-xs font-mono text-zinc-400 font-normal uppercase">{unit}</span>
          )}
        </div>
      </div>

      {/* Footer & Lineage Trigger */}
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-zinc-800/80 text-xs">
        <DataStateBadge state={dataState} />
        {evidenceCount > 0 && onViewEvidence && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onViewEvidence}
            className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-zinc-400 hover:text-white transition-colors"
            title="Inspect source observations in Evidence Modal"
          >
            <span>Trace Evidence ({evidenceCount})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
