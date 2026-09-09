/**
 * Main Dashboard Client Container — Pixel-Accurate Enterprise Edition
 *
 * Client-side orchestrator that:
 * 1. Holds global filter state (month, brand)
 * 2. Fetches all API data on mount and filter change
 * 3. Renders Header + Navigation
 * 4. Mounts the Global Floating Intelligence Assistant (bottom-right)
 * 5. Manages the Evidence Modal & Ingestion Operations lifecycle
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Navigation, DashboardSection } from '@/components/layout/Navigation';
import { EvidenceModal } from '@/components/ui/EvidenceModal';
import { IngestionStatusModal } from '@/components/ui/IngestionStatusModal';
import { RagAssistant } from '@/components/rag/RagAssistant';
import { ExecutiveOverview } from '@/components/sections/ExecutiveOverview';
import { OnlineVisibilitySection } from '@/components/sections/OnlineVisibilitySection';
import { AdvertisingSection } from '@/components/sections/AdvertisingSection';
import { SocialActivitySection } from '@/components/sections/SocialActivitySection';
import { EcommercePricingSection } from '@/components/sections/EcommercePricingSection';
import { SkuExplorerSection } from '@/components/sections/SkuExplorerSection';
import { ConsumerSentimentSection } from '@/components/sections/ConsumerSentimentSection';
import { InsightsRecommendationsSection } from '@/components/sections/InsightsRecommendationsSection';
import { EvidenceLakeSection } from '@/components/sections/EvidenceLakeSection';
import { WebIntelligenceSection } from '@/components/sections/WebIntelligenceSection';
import { Card } from '@/components/ui/Card';
import { MetricCardSkeleton, ChartSkeleton } from '@/components/ui/SkeletonLoader';

import {
  fetchSummary,
  fetchBrands,
  fetchSkus,
  fetchEvidence,
  fetchInsights,
  fetchIngestionHealth,
  IngestionHealthResponse,
} from '@/lib/apiClient';
import { Insight } from '@/services/insights/insightTypes';

import {
  ExecutiveOverviewData,
  BrandComparisonRecord,
  SkuComparisonRecord,
  AnalyticalMonth,
  MetricId,
} from '@/types/analytics';
import { TargetBrand } from '@/types/brands';
import { RawEvidenceRecord } from '@/types/evidence';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Evidence Modal State ─────────────────────────────────────────────────────

interface EvidenceModalState {
  isOpen: boolean;
  metricId: string;
  metricName: string;
  metricValue: string | number | null;
  brand: TargetBrand | 'All';
  month: AnalyticalMonth | 'All';
  skuId?: string;
  evidenceRecords: RawEvidenceRecord[];
  methodologyNote?: string;
}

const DEFAULT_MODAL: EvidenceModalState = {
  isOpen: false,
  metricId: '',
  metricName: '',
  metricValue: null,
  brand: 'All',
  month: 'All',
  evidenceRecords: [],
};

// ─── Dashboard State ──────────────────────────────────────────────────────────

interface DashboardData {
  summary: ExecutiveOverviewData | null;
  touchpoints: BrandComparisonRecord[];
  paidSov: BrandComparisonRecord[];
  socialSov: BrandComparisonRecord[];
  ecomSov: BrandComparisonRecord[];
  ads: BrandComparisonRecord[];
  videoAds: BrandComparisonRecord[];
  staticAds: BrandComparisonRecord[];
  carouselAds: BrandComparisonRecord[];
  posts: BrandComparisonRecord[];
  engagement: BrandComparisonRecord[];
  listings: BrandComparisonRecord[];
  skus: SkuComparisonRecord[];
  insights: Insight[];
  allEvidence: RawEvidenceRecord[];
}

const EMPTY_DATA: DashboardData = {
  summary: null,
  touchpoints: [],
  paidSov: [],
  socialSov: [],
  ecomSov: [],
  ads: [],
  videoAds: [],
  staticAds: [],
  carouselAds: [],
  posts: [],
  engagement: [],
  listings: [],
  skus: [],
  insights: [],
  allEvidence: [],
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<AnalyticalMonth>('2026-08');
  const [selectedBrand, setSelectedBrand] = useState<TargetBrand | 'All'>('All');
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<EvidenceModalState>(DEFAULT_MODAL);
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);
  const [ingestionHealth, setIngestionHealth] = useState<IngestionHealthResponse | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('inktank_theme') as 'dark' | 'light' | null;
    const effectiveTheme = saved || 'light';
    setTheme(effectiveTheme);
    document.documentElement.classList.toggle('light-theme', effectiveTheme === 'light');
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('inktank_theme', next);
      document.documentElement.classList.toggle('light-theme', next === 'light');
      return next;
    });
  }, []);

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchAllData = useCallback(async (month: AnalyticalMonth) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fan out all needed API calls concurrently
      const [
        summary,
        touchpointsRes,
        paidSovRes,
        socialSovRes,
        ecomSovRes,
        adsRes,
        videoRes,
        staticRes,
        carouselRes,
        postsRes,
        engagementRes,
        listingsRes,
        skusRes,
        insightsRes,
        evidenceRes,
      ] = await Promise.all([
        fetchSummary(month).catch(() => null),
        fetchBrands('TOTAL_VISIBILITY_TOUCHPOINTS', month).catch(() => null),
        fetchBrands('PAID_MEDIA_SOV', month).catch(() => null),
        fetchBrands('SOCIAL_SOV', month).catch(() => null),
        fetchBrands('ECOMMERCE_SOV', month).catch(() => null),
        fetchBrands('AD_PRESENCE_COUNT', month).catch(() => null),
        fetchBrands('CREATIVE_FORMAT_VIDEO_COUNT', month).catch(() => null),
        fetchBrands('CREATIVE_FORMAT_STATIC_COUNT', month).catch(() => null),
        fetchBrands('CREATIVE_FORMAT_CAROUSEL_COUNT', month).catch(() => null),
        fetchBrands('SOCIAL_POSTS_COUNT', month).catch(() => null),
        fetchBrands('TOTAL_SOCIAL_ENGAGEMENT', month).catch(() => null),
        fetchBrands('ECOMMERCE_LISTINGS_COUNT', month).catch(() => null),
        fetchSkus(null, month).catch(() => null),
        fetchInsights(month, 'All', 5).catch(() => null),
        fetchEvidence('ALL' as unknown as MetricId, 'All', month).catch(() => null),
      ]);

      setData((prev) => ({
        summary,
        touchpoints: touchpointsRes?.comparison ?? [],
        paidSov: paidSovRes?.comparison ?? [],
        socialSov: socialSovRes?.comparison ?? [],
        ecomSov: ecomSovRes?.comparison ?? [],
        ads: adsRes?.comparison ?? [],
        videoAds: videoRes?.comparison ?? [],
        staticAds: staticRes?.comparison ?? [],
        carouselAds: carouselRes?.comparison ?? [],
        posts: postsRes?.comparison ?? [],
        engagement: engagementRes?.comparison ?? [],
        listings: listingsRes?.comparison ?? [],
        skus: skusRes?.skus ?? [],
        insights: insightsRes?.insights ?? [],
        allEvidence: evidenceRes?.evidence ?? prev.allEvidence,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to synchronize analytical data from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch evidence lake on section activation or month change
  const fetchEvidenceLake = useCallback(async (month: AnalyticalMonth) => {
    try {
      const res = await fetchEvidence('ALL' as unknown as MetricId, 'All', month);
      setData((prev) => ({ ...prev, allEvidence: res.evidence }));
    } catch {
      // Non-fatal
    }
  }, []);

  // Fetch ingestion health status
  const loadIngestionHealth = useCallback(async () => {
    try {
      const health = await fetchIngestionHealth();
      setIngestionHealth(health);
    } catch {
      // Health check can fail if server not reachable
    }
  }, []);

  useEffect(() => {
    void fetchAllData(selectedMonth);
    void loadIngestionHealth();
  }, [selectedMonth, fetchAllData, loadIngestionHealth]);

  useEffect(() => {
    if (
      activeSection === 'evidence' ||
      activeSection === 'sentiment' ||
      activeSection === 'insights' ||
      activeSection === 'signals'
    ) {
      void fetchEvidenceLake(selectedMonth);
    }
  }, [activeSection, selectedMonth, fetchEvidenceLake]);

  // ─── Evidence Modal ─────────────────────────────────────────────────────────

  const openEvidence = useCallback(
    async (
      metricId: string,
      metricName: string,
      brand: TargetBrand | 'All',
      skuId?: string
    ) => {
      setModal({
        isOpen: true,
        metricId,
        metricName,
        metricValue: null,
        brand,
        month: selectedMonth,
        skuId,
        evidenceRecords: [],
      });

      try {
        const res = await fetchEvidence(
          metricId as Parameters<typeof fetchEvidence>[0],
          brand,
          selectedMonth,
          skuId
        );
        setModal((prev) => ({
          ...prev,
          metricValue: res.count,
          evidenceRecords: res.evidence,
        }));
      } catch {
        // Keep modal open with empty evidence
      }
    },
    [selectedMonth]
  );

  const closeEvidence = useCallback(() => {
    setModal(DEFAULT_MODAL);
  }, []);

  // ─── Refresh ────────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    void fetchAllData(selectedMonth);
    void loadIngestionHealth();
  }, [selectedMonth, fetchAllData, loadIngestionHealth]);

  // ─── Render active section ──────────────────────────────────────────────────

  const renderSection = () => {
    if (isLoading) {
      return (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-[#161616] animate-pulse rounded-[4px]" />
              <div className="h-3 w-80 bg-[#121212] animate-pulse rounded-[4px]" />
            </div>
            <div className="h-4 w-28 bg-[#161616] animate-pulse rounded-[4px]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <Card className="p-8 border-[#222222] bg-[#111111] text-center space-y-4 max-w-xl mx-auto my-12 rounded-[10px] font-sans">
          <div className="w-12 h-12 rounded-[8px] bg-[#161616] border border-[#262626] text-zinc-200 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold tracking-tight uppercase text-white font-mono">
              Data Synchronization Interrupted
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Unable to query the Analytical Metric Cube API. Underlying raw evidence records and catalog definitions remain completely intact and unaffected.
            </p>
          </div>

          <div className="p-3 rounded-[6px] bg-black border border-[#222222] text-left font-mono text-[11px] space-y-1">
            <span className="text-zinc-500 uppercase text-[10px] block font-semibold">Error Diagnostic</span>
            <code className="text-zinc-300 block">{error}</code>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              className="px-5 py-2.5 bg-white text-black rounded-[6px] text-xs font-semibold flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Synchronization</span>
            </motion.button>
          </div>
        </Card>
      );
    }

    switch (activeSection) {
      case 'overview':
        return (
          <ExecutiveOverview
            data={data.summary}
            insights={data.insights}
            selectedMonth={selectedMonth}
            selectedBrand={selectedBrand}
            onOpenEvidence={openEvidence}
            onNavigateSection={(sec) => setActiveSection(sec)}
          />
        );
      case 'visibility':
        return (
          <OnlineVisibilitySection
            selectedMonth={selectedMonth}
            selectedBrand={selectedBrand}
            summary={data.summary}
            touchpointComparisons={data.touchpoints}
            paidSovComparisons={data.paidSov}
            socialSovComparisons={data.socialSov}
            ecomSovComparisons={data.ecomSov}
            onOpenEvidence={openEvidence}
          />
        );
      case 'advertising':
        return (
          <AdvertisingSection
            selectedMonth={selectedMonth}
            selectedBrand={selectedBrand}
            adComparisons={data.ads}
            videoComparisons={data.videoAds}
            staticComparisons={data.staticAds}
            carouselComparisons={data.carouselAds}
            onOpenEvidence={openEvidence}
          />
        );
      case 'social':
        return (
          <SocialActivitySection
            selectedMonth={selectedMonth}
            selectedBrand={selectedBrand}
            postComparisons={data.posts}
            engagementComparisons={data.engagement}
            socialSovComparisons={data.socialSov}
            onOpenEvidence={openEvidence}
          />
        );
      case 'ecommerce':
        return (
          <EcommercePricingSection
            selectedMonth={selectedMonth}
            selectedBrand={selectedBrand}
            summary={data.summary}
            skus={data.skus}
            listingComparisons={data.listings}
            ecomSovComparisons={data.ecomSov}
            onOpenEvidence={openEvidence}
          />
        );
      case 'skus':
        return (
          <SkuExplorerSection
            skuMetrics={data.skus}
            selectedBrand={selectedBrand}
            selectedMonth={selectedMonth}
            onOpenEvidence={openEvidence}
          />
        );
      case 'sentiment':
        return (
          <ConsumerSentimentSection
            selectedMonth={selectedMonth}
            selectedBrand={selectedBrand}
            evidenceRecords={data.allEvidence}
            onOpenEvidence={openEvidence}
          />
        );
      case 'insights':
      case 'signals':
        return (
          <InsightsRecommendationsSection
            insights={data.insights}
            selectedMonth={selectedMonth}
            selectedBrand={selectedBrand}
            isLoading={isLoading}
            onOpenEvidence={openEvidence}
          />
        );
      case 'evidence':
        return (
          <EvidenceLakeSection
            evidenceRecords={data.allEvidence}
            selectedBrand={selectedBrand}
            selectedMonth={selectedMonth}
          />
        );
      case 'web':
        return (
          <WebIntelligenceSection
            onEvidenceCreated={() => void fetchAllData(selectedMonth)}
          />
        );
      default:
        return null;
    }
  };

  const evidenceCount = data.summary?.total_evidence_observations ?? 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans relative">
      {/* Sticky Header */}
      <Header
        selectedMonth={selectedMonth}
        onSelectMonth={(m) => {
          setSelectedMonth(m);
          setData(EMPTY_DATA);
        }}
        selectedBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onRefresh={handleRefresh}
        onOpenIngestionStatus={() => {
          void loadIngestionHealth();
          setIsIngestionModalOpen(true);
        }}
        isRefreshing={isLoading}
      />

      {/* Navigation Tabs */}
      <Navigation
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        evidenceCount={evidenceCount}
      />

      {/* Main Content with Animated Section Transitions */}
      <main className="flex-1 px-6 py-6 max-w-screen-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Subtle Bottom-Left Monogram */}
      <div className="fixed bottom-6 left-6 z-30 pointer-events-none hidden md:flex items-center justify-center w-8 h-8 rounded-full border border-zinc-800 bg-[#111111]/80 text-zinc-500 text-xs font-mono select-none">
        N
      </div>

      {/* Global Floating Intelligence Assistant (Bottom-Right) */}
      <RagAssistant
        currentMonth={selectedMonth}
        currentBrand={selectedBrand}
        isEvidenceModalOpen={modal.isOpen || isIngestionModalOpen}
        onOpenEvidence={openEvidence}
      />

      {/* Evidence Audit Modal */}
      <EvidenceModal
        isOpen={modal.isOpen}
        onClose={closeEvidence}
        metricName={modal.metricName}
        metricValue={modal.metricValue}
        brand={modal.brand !== 'All' ? modal.brand : undefined}
        month={modal.month !== 'All' ? modal.month : undefined}
        skuModel={modal.skuId}
        evidenceRecords={modal.evidenceRecords}
      />

      {/* Ingestion Status & Operational Modal */}
      <IngestionStatusModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIsIngestionModalOpen(false)}
        health={ingestionHealth}
        onIngestionCompleted={() => {
          void handleRefresh();
        }}
      />
    </div>
  );
};
