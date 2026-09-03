/**
 * Reusable Information & Interpretation Tooltip Component
 * Provides concise contextual definitions, formulas, and "What this does NOT mean" disclaimers.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InfoTooltipProps {
  title?: string;
  content: string;
  notMeaning?: string;
  sourceNote?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  content,
  notMeaning,
  sourceNote,
  side = 'top',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-label={title ? `Information about ${title}` : 'Metric explanation'}
        className={cn(
          'p-0.5 text-zinc-500 hover:text-zinc-200 transition-colors focus:outline-none focus:text-white rounded-[2px]',
          className
        )}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="tooltip"
          className={cn(
            'absolute z-50 w-72 p-3 bg-[#121215] border border-zinc-700 rounded-[2px] shadow-2xl text-left font-sans animate-in fade-in duration-100 pointer-events-auto',
            positionClasses[side]
          )}
        >
          {title && (
            <div className="flex items-center gap-1.5 pb-1.5 mb-1.5 border-b border-zinc-800">
              <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white">
                {title}
              </span>
            </div>
          )}

          <p className="text-xs text-zinc-300 leading-relaxed font-normal">{content}</p>

          {notMeaning && (
            <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-start gap-1.5 text-[11px] text-zinc-400">
              <AlertTriangle className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-300 font-mono text-[10px] uppercase block">
                  What this does NOT mean:
                </strong>
                <span className="text-zinc-400 leading-tight block mt-0.5">{notMeaning}</span>
              </div>
            </div>
          )}

          {sourceNote && (
            <div className="mt-2 pt-1.5 border-t border-zinc-850 text-[10px] font-mono text-zinc-500">
              <span>Source: </span>
              <span className="text-zinc-400">{sourceNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
