/**
 * Reusable Information & Interpretation Tooltip Component
 * Provides concise contextual definitions, formulas, and "What this does NOT mean" disclaimers.
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

interface Coords {
  top: number;
  left: number;
  placement: 'top' | 'bottom';
  arrowLeft: number;
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
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const calculatePosition = useCallback((): Coords | null => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 290;
    const estimatedHeight = 160;

    // Check if there's enough space above the trigger
    const fitsAbove = rect.top >= estimatedHeight + 16;
    const placement: 'top' | 'bottom' =
      side === 'bottom' || !fitsAbove ? 'bottom' : 'top';

    const idealLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const clampedLeft = Math.max(12, Math.min(windowWidth - tooltipWidth - 12, idealLeft));

    const top = placement === 'top' ? rect.top - 8 : rect.bottom + 8;
    const triggerCenter = rect.left + rect.width / 2;
    const arrowLeft = Math.max(16, Math.min(tooltipWidth - 16, triggerCenter - clampedLeft - 4));

    return {
      top,
      left: clampedLeft,
      placement,
      arrowLeft,
    };
  }, [side]);

  const openTooltip = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    const nextCoords = calculatePosition();
    if (nextCoords) {
      setCoords(nextCoords);
      setIsOpen(true);
    }
  };

  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  };

  // Close on outside click or escape key
  useEffect(() => {
    if (!isOpen) return;

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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      const updated = calculatePosition();
      if (updated) {
        setCoords(updated);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, calculatePosition]);

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (isOpen) {
            setIsOpen(false);
          } else {
            openTooltip();
          }
        }}
        onMouseEnter={openTooltip}
        onMouseLeave={scheduleClose}
        aria-label={title ? `Information about ${title}` : 'Metric explanation'}
        className={cn(
          'p-0.5 text-zinc-500 hover:text-zinc-200 transition-colors focus:outline-none focus:text-white rounded-[2px]',
          className
        )}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {mounted &&
        isOpen &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            role="tooltip"
            onMouseEnter={() => {
              if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
                closeTimerRef.current = null;
              }
            }}
            onMouseLeave={scheduleClose}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.placement === 'top' ? 'translateY(-100%)' : 'none',
              zIndex: 99999,
            }}
            className={cn(
              'w-[290px] p-3.5 bg-[#0f0f13] border border-zinc-700/90 rounded-[6px] shadow-2xl shadow-black/90 text-left font-sans animate-in fade-in duration-100 pointer-events-auto select-none backdrop-blur-md',
              'text-zinc-200'
            )}
          >
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-2 h-2 bg-[#0f0f13] border-zinc-700 rotate-45 pointer-events-none',
                coords.placement === 'top'
                  ? 'bottom-[-5px] border-b border-r'
                  : 'top-[-5px] border-t border-l'
              )}
              style={{ left: `${coords.arrowLeft}px` }}
            />

            {title && (
              <div className="flex items-center gap-1.5 pb-1.5 mb-1.5 border-b border-zinc-800">
                <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white">
                  {title}
                </span>
              </div>
            )}

            <p className="text-xs text-zinc-200 leading-relaxed font-normal">{content}</p>

            {notMeaning && (
              <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-start gap-1.5 text-[11px] text-zinc-400">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400/90 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-300 font-mono text-[10px] uppercase block">
                    What this does NOT mean:
                  </strong>
                  <span className="text-zinc-400 leading-tight block mt-0.5">{notMeaning}</span>
                </div>
              </div>
            )}

            {sourceNote && (
              <div className="mt-2 pt-1.5 border-t border-zinc-800 text-[10px] font-mono text-zinc-500">
                <span>Source: </span>
                <span className="text-zinc-400">{sourceNote}</span>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
