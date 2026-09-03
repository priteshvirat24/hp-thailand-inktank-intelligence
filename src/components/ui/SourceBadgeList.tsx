/**
 * Compact Source Transparency Badge List Component (Polished Grey/White Aesthetic)
 * Displays verified source platforms as sleek, restrained pill chips.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface SourceItem {
  name: string;
  type?: 'OFFICIAL' | 'MARKETPLACE' | 'AD_LIBRARY' | 'SOCIAL' | 'RETAILER';
  coverageNote?: string;
}

interface SourceBadgeListProps {
  label?: string;
  sources: readonly string[] | readonly SourceItem[];
  className?: string;
}

export const SourceBadgeList: React.FC<SourceBadgeListProps> = ({
  label = 'Observed Source Channels:',
  sources,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5 text-xs font-sans', className)}>
      {label && (
        <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mr-1 select-none">
          {label}
        </span>
      )}
      {sources.map((item, idx) => {
        const name = typeof item === 'string' ? item : item.name;
        const note = typeof item === 'string' ? undefined : item.coverageNote;

        return (
          <motion.span
            key={idx}
            title={note}
            whileHover={{ scale: 1.05, y: -1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="px-2.5 py-0.5 rounded-full bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-600 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors cursor-default select-none shadow-sm"
          >
            {name}
          </motion.span>
        );
      })}
    </div>
  );
};
