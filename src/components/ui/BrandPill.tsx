/**
 * Refined Monochrome Brand Pill Component (Grey/White Luxury Aesthetic)
 * Smooth pill typography with interactive framer-motion micro-animations.
 */

'use client';

import React from 'react';
import { TargetBrand } from '@/types/brands';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BrandPillProps {
  brand: TargetBrand;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

const BRAND_DOT_COLORS: Record<TargetBrand, string> = {
  HP: '#ffffff',
  Epson: '#d4d4d8',
  Canon: '#a1a1aa',
  Brother: '#71717a',
};

export const BrandPill: React.FC<BrandPillProps> = ({
  brand,
  size = 'md',
  active = true,
  className,
  onClick,
}) => {
  const isHp = brand === 'HP';

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-xs px-3.5 py-1.5 font-medium',
  };

  const Component = onClick ? motion.button : motion.span;

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.04, y: -1 } : undefined}
      whileTap={onClick ? { scale: 0.96 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-sans border transition-colors duration-150 select-none shadow-sm',
        sizeStyles[size],
        active
          ? isHp
            ? 'bg-zinc-800 text-white border-zinc-500/80 font-semibold shadow-zinc-950/40'
            : 'bg-zinc-900/90 text-zinc-200 border-zinc-700/60 font-medium hover:border-zinc-500'
          : 'bg-zinc-950/40 text-zinc-600 border-zinc-900/80 opacity-40 hover:opacity-75',
        onClick ? 'cursor-pointer' : '',
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-150',
          active && isHp ? 'scale-110 ring-2 ring-white/20' : ''
        )}
        style={{ backgroundColor: active ? BRAND_DOT_COLORS[brand] : '#52525b' }}
      />
      <span className="tracking-tight">{brand}</span>
    </Component>
  );
};
