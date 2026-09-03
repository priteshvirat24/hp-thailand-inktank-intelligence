/**
 * Reusable Collapsible Methodology & Business Invariant Disclosure Component (Luxury Enterprise Aesthetic)
 * Framer Motion smooth accordion physics, rounded-xl styling, and high-contrast grey/white rules.
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface MethodologyRule {
  label: string;
  rule: string;
}

export interface MethodologyDisclosureProps {
  title: string;
  description: string;
  formula?: string;
  rules?: MethodologyRule[];
  variant?: 'default' | 'warning' | 'audit';
  defaultExpanded?: boolean;
  className?: string;
}

export const MethodologyDisclosure: React.FC<MethodologyDisclosureProps> = ({
  title,
  description,
  formula,
  rules,
  variant = 'default',
  defaultExpanded = false,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const variantBorder = {
    default: 'border-zinc-800/80 bg-zinc-950/70',
    warning: 'border-zinc-700/80 bg-zinc-950/90',
    audit: 'border-zinc-800/80 bg-[#070709]',
  }[variant];

  return (
    <div className={cn('rounded-xl border transition-all duration-200 font-sans shadow-sm overflow-hidden', variantBorder, className)}>
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="w-full p-4 flex items-center justify-between gap-3 text-left focus:outline-none select-none hover:bg-zinc-900/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 shrink-0">
            {variant === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-zinc-300" />
            ) : (
              <FileText className="w-4 h-4 text-zinc-400" />
            )}
          </div>
          <div>
            <span className="font-semibold uppercase tracking-wider text-zinc-200 text-xs block font-mono">
              {title}
            </span>
            {!isExpanded && (
              <p className="text-xs text-zinc-500 font-sans mt-0.5 line-clamp-1 font-normal">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-sans font-medium text-zinc-400 hidden sm:inline">
            {isExpanded ? 'Hide Methodology' : 'View Methodology'}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-zinc-850/80 space-y-3.5 text-xs text-zinc-400">
              <p className="leading-relaxed text-zinc-300 font-normal">{description}</p>

              {formula && (
                <div className="p-3 rounded-xl bg-black/80 border border-zinc-800/80 font-mono text-xs space-y-1">
                  <span className="text-zinc-500 uppercase block text-[10px] font-semibold tracking-wider">Calculation Formula</span>
                  <code className="text-white font-bold block">{formula}</code>
                </div>
              )}

              {rules && rules.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block font-mono">
                    Data Invariants &amp; Integrity Rules:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-sans text-xs">
                    {rules.map((r, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block text-xs font-medium uppercase font-mono tracking-tight">{r.label}</strong>
                          <span className="text-zinc-400 font-sans text-xs leading-relaxed block mt-0.5 font-normal">
                            {r.rule}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
