/**
 * Reusable Monochrome Data State Badge with Contextual Interpretation (Luxury Aesthetic)
 * Clearly distinguishes OBSERVED, NO DATA (MISSING), INSUFFICIENT EVIDENCE, and NOT APPLICABLE.
 */

import React from 'react';
import { DataState } from '@/types/analytics';
import { InfoTooltip } from './InfoTooltip';
import { cn } from '@/lib/utils';

interface DataStateBadgeProps {
  state: DataState;
  showTooltip?: boolean;
  className?: string;
}

const STATE_CONFIG: Record<
  DataState,
  {
    label: string;
    description: string;
    badgeStyle: string;
    dotStyle: string;
  }
> = {
  OBSERVED: {
    label: 'OBSERVED',
    description:
      'Metric calculated directly from verified observations ingested into the Evidence Store.',
    badgeStyle: 'bg-zinc-900/90 text-zinc-200 border-zinc-700/80 font-semibold shadow-sm',
    dotStyle: 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]',
  },
  MISSING: {
    label: 'NO DATA',
    description:
      'No verified observation exists for this metric in the selected analytical period or scope. Missing evidence remains null and is never replaced with zero.',
    badgeStyle: 'bg-zinc-950/80 text-zinc-500 border-zinc-800/80 font-normal',
    dotStyle: 'bg-zinc-700',
  },
  INSUFFICIENT_EVIDENCE: {
    label: 'INSUFFICIENT EVIDENCE',
    description:
      'Available evidence is insufficient to calculate this metric reliably (e.g. category comparison total denominator is zero).',
    badgeStyle: 'bg-zinc-950/80 text-zinc-400 border-zinc-800/80 font-normal',
    dotStyle: 'bg-zinc-500',
  },
  NOT_APPLICABLE: {
    label: 'NOT APPLICABLE',
    description: 'This metric is not applicable to this brand, channel, or product configuration.',
    badgeStyle: 'bg-zinc-950/40 text-zinc-600 border-zinc-900/80 font-normal',
    dotStyle: 'bg-zinc-800',
  },
};

export const DataStateBadge: React.FC<DataStateBadgeProps> = ({
  state,
  showTooltip = false,
  className,
}) => {
  const config = STATE_CONFIG[state] || STATE_CONFIG.MISSING;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans border select-none transition-colors duration-150',
        config.badgeStyle,
        className
      )}
      title={config.description}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotStyle)} />
      <span className="tracking-tight">{config.label}</span>
      {showTooltip && (
        <InfoTooltip
          title={`Data State: ${config.label}`}
          content={config.description}
          className="ml-0.5"
        />
      )}
    </span>
  );
};
