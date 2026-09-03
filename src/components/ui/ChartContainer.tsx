/**
 * Standardized Chart Container Component
 * Wraps Recharts components with a clean monochrome border, title, and metadata.
 */

import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
  footerNote?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  badge,
  children,
  className,
  footerNote,
}) => {
  return (
    <Card className={cn('p-5 space-y-4 bg-[#0a0a0c] border-zinc-850', className)}>
      <div className="flex items-center justify-between gap-2 border-b border-zinc-850 pb-3">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">{title}</h3>
          {subtitle && <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        {badge && (
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-[2px] border border-zinc-900">
            {badge}
          </span>
        )}
      </div>

      <div className="w-full">{children}</div>

      {footerNote && (
        <div className="pt-2 border-t border-zinc-900 text-[10px] font-mono text-zinc-500">
          {footerNote}
        </div>
      )}
    </Card>
  );
};
