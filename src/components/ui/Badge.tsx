import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'active' | 'muted';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  const variantStyles = {
    default: 'bg-zinc-900 text-zinc-300 border-zinc-800',
    outline: 'bg-transparent text-zinc-400 border-zinc-800',
    active: 'bg-white text-black font-semibold border-white',
    muted: 'bg-zinc-950 text-zinc-500 border-zinc-900',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[11px] font-mono border transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
