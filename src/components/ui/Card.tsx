import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, elevated = false, children, ...props }) => {
  return (
    <div
      className={cn(
        'border border-zinc-800/80 bg-[#0c0c0e]/95 backdrop-blur-sm rounded-xl transition-all duration-200 shadow-sm',
        elevated
          ? 'bg-zinc-900/90 border-zinc-700/80 shadow-md'
          : 'hover:border-zinc-700/80 hover:shadow-md hover:shadow-black/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
