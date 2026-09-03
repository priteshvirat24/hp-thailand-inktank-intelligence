/**
 * Standardized Monochrome Empty State Component (Luxury Enterprise Aesthetic)
 * Ambient background lighting, floating framer-motion micro-animations, and high-contrast grey/white styling.
 */

'use client';

import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'NO OBSERVATIONS INGESTED FOR THIS PERIOD',
  message = 'The Evidence Store contains no verified observations for this source and period. Missing data is strictly preserved as unobserved rather than fabricated.',
  actionText,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative flex flex-col items-center justify-center p-14 text-center rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/30 via-[#0c0c0e] to-black shadow-2xl overflow-hidden font-sans my-4"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Floating Animated Icon Container */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-200 mb-5 shadow-xl shadow-black/50"
      >
        <Database className="w-7 h-7 stroke-[1.5]" />
      </motion.div>

      {/* Title & Description */}
      <h3 className="text-sm font-semibold tracking-tight uppercase text-white font-mono mb-2.5">
        {title}
      </h3>
      <p className="text-xs text-zinc-400 max-w-xl mb-7 leading-relaxed font-normal">
        {message}
      </p>

      {/* Strict Data Integrity Invariant Pill */}
      <div className="flex items-center gap-2 text-xs font-sans text-zinc-400 bg-zinc-950/80 px-4 py-2 rounded-full border border-zinc-800 shadow-sm select-none">
        <ShieldCheck className="w-4 h-4 text-zinc-300 shrink-0" />
        <span>Strict Data Integrity Invariant: Zero synthetic or fabricated metrics</span>
      </div>

      {/* Action Button */}
      {actionText && onAction && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAction}
          className="mt-6 px-5 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-lg text-xs shadow-lg shadow-white/5 transition-all"
        >
          {actionText}
        </motion.button>
      )}
    </motion.div>
  );
};
