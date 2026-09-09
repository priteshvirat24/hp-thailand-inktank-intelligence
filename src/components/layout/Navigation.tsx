/**
 * Dashboard Navigation — Strategic Workspace Tabs (Pixel-Accurate Enterprise Edition)
 * Compact horizontal tab bar matching the reference design with monochrome icons and white active underline.
 */

'use client';

import React from 'react';
import {
  LayoutDashboard,
  Clock,
  Megaphone,
  Users,
  ShoppingCart,
  Layers,
  ShieldCheck,
  Globe,
  MessageSquare,
  Target,
} from 'lucide-react';
import { motion } from 'framer-motion';

export type DashboardSection =
  | 'overview'
  | 'visibility'
  | 'advertising'
  | 'ecommerce'
  | 'skus'
  | 'sentiment'
  | 'insights'
  | 'signals'
  | 'evidence'
  | 'social'
  | 'web';

interface NavItem {
  id: DashboardSection;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',     label: '1. Executive Summary',   icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  { id: 'visibility',   label: '2. Visibility & SOV',    icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 'advertising',  label: '3. Creative & Messaging',icon: <Megaphone className="w-3.5 h-3.5" /> },
  { id: 'ecommerce',    label: '4. Promotions & Pricing',icon: <ShoppingCart className="w-3.5 h-3.5" /> },
  { id: 'skus',         label: '5. Product / SKU Push',  icon: <Layers className="w-3.5 h-3.5" />, badge: 65 },
  { id: 'sentiment',    label: '6. Consumer Sentiment',  icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { id: 'insights',     label: '7. Insights & Recommendations', icon: <Target className="w-3.5 h-3.5" /> },
  { id: 'evidence',     label: '8. Evidence & Sources',  icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { id: 'social',       label: 'Social Channels',        icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'web',          label: 'Web Intelligence',       icon: <Globe className="w-3.5 h-3.5" />, badge: 'LIVE' },
];

interface NavigationProps {
  activeSection: DashboardSection;
  onSelectSection: (section: DashboardSection) => void;
  evidenceCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  onSelectSection,
  evidenceCount,
}) => {
  return (
    <nav
      aria-label="Dashboard analytical workspaces"
      className="w-full bg-[#0A0A0A] border-b border-[#222222] px-6 py-0 sticky top-[65px] z-20"
    >
      <div className="max-w-screen-2xl mx-auto flex items-center gap-1 overflow-x-auto no-scrollbar font-sans">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          const effectiveBadge =
            item.id === 'evidence' && evidenceCount !== undefined && evidenceCount > 0
              ? evidenceCount
              : item.badge;

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onSelectSection(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center gap-2 px-3.5 py-3 text-xs font-medium whitespace-nowrap transition-colors select-none ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141414]'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-zinc-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>

              {effectiveBadge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-[3px] leading-tight transition-colors ${
                    isActive
                      ? 'bg-[#222222] text-white font-bold border border-[#333333]'
                      : 'bg-[#161616] text-zinc-500 border border-[#222222]'
                  }`}
                >
                  {effectiveBadge}
                </span>
              )}

              {/* White Bottom Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNavTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
