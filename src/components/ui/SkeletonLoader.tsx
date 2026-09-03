/**
 * Skeleton Loader Component
 * Renders layout-stable monochromatic placeholder states during data fetching.
 */

import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse bg-zinc-900/80 rounded-[2px]', className)} />
);

export const MetricCardSkeleton: React.FC = () => (
  <Card className="p-4 space-y-3 bg-[#0a0a0c] border-zinc-850">
    <div className="flex justify-between items-start">
      <div className="space-y-1.5 w-2/3">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
    <div className="py-2">
      <Skeleton className="h-7 w-1/2" />
    </div>
    <div className="pt-2.5 border-t border-zinc-850 flex justify-between items-center">
      <Skeleton className="h-3.5 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  </Card>
);

export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-60' }) => (
  <Card className="p-5 space-y-4 bg-[#0a0a0c] border-zinc-850">
    <div className="flex justify-between items-center pb-2.5 border-b border-zinc-850">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-16" />
    </div>
    <div className={cn('w-full flex items-end gap-3 pt-4', height)}>
      <Skeleton className="h-3/4 flex-1" />
      <Skeleton className="h-1/2 flex-1" />
      <Skeleton className="h-full flex-1" />
      <Skeleton className="h-2/3 flex-1" />
    </div>
  </Card>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <Card className="p-0 overflow-hidden bg-[#0a0a0c] border-zinc-850">
    <div className="p-4 border-b border-zinc-850 flex justify-between items-center">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-zinc-900">
          <Skeleton className="h-3.5 w-1/4" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  </Card>
);
