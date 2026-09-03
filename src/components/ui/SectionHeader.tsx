/**
 * Enhanced Reusable Section Header Component (Luxury Enterprise Aesthetic)
 * Sleek typography, framer-motion entrance, rounded pills, and source badges.
 */

'use client';

import React from 'react';
import { SourceBadgeList, SourceItem } from './SourceBadgeList';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  period?: string;
  icon?: React.ReactNode;
  badge?: string;
  sources?: readonly string[] | readonly SourceItem[];
  totalEvidence?: number;
  filteredEvidence?: number;
  children?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  period,
  icon,
  badge,
  sources,
  totalEvidence,
  filteredEvidence,
  children,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('space-y-3 pb-4 border-b border-zinc-800/70 font-sans', className)}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            {icon && <span className="text-zinc-400">{icon}</span>}
            <h2 className="text-sm font-semibold tracking-tight text-white uppercase font-mono">
              {title}
            </h2>
            {period && (
              <span className="px-3 py-0.5 rounded-full bg-zinc-800/90 border border-zinc-700/80 text-[11px] font-sans text-zinc-200 font-medium shadow-sm">
                {period}
              </span>
            )}
            {badge && (
              <span className="px-3 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-sans text-zinc-400 font-medium">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-zinc-400 font-normal leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {totalEvidence !== undefined && (
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-sans">
            <span className="px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
              {filteredEvidence !== undefined && filteredEvidence !== totalEvidence ? (
                <>
                  <strong className="text-white font-semibold tabular-nums">{filteredEvidence.toLocaleString()}</strong> /{' '}
                  {totalEvidence.toLocaleString()} Verified Records
                </>
              ) : (
                <>
                  <strong className="text-white font-semibold tabular-nums">{totalEvidence.toLocaleString()}</strong> Verified Observations
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {sources && sources.length > 0 && (
        <SourceBadgeList sources={sources} label="Verified Sources:" className="pt-0.5" />
      )}

      {children}
    </motion.div>
  );
};
