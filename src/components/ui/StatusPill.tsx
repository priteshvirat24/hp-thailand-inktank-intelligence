import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusPillProps {
  status: 'ONLINE' | 'STANDBY' | 'INITIALIZING' | 'ERROR';
  label?: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, label, className }) => {
  const statusConfig = {
    ONLINE: { text: 'OPERATIONAL', dot: 'bg-white' },
    STANDBY: { text: 'STANDBY', dot: 'bg-zinc-500' },
    INITIALIZING: { text: 'INITIALIZING', dot: 'bg-zinc-400' },
    ERROR: { text: 'SYSTEM ERROR', dot: 'bg-zinc-600' },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-[2px] bg-[#0c0c0e] border border-zinc-800 text-[11px] font-mono font-medium text-zinc-300',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      <span>{label || config.text}</span>
    </div>
  );
};
