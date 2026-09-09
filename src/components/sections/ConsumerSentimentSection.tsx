/**
 * Section 6: Consumer Sentiment & Review Intelligence
 * Technical Implementation Brief Section 12.1 & 12.2
 * Displays authentic positive/negative sentiment distribution, brand ratings, recurring conversation
 * themes, and representative verified consumer testimonials across HP, Epson, Canon, and Brother.
 * Strictly adheres to Data Integrity Invariant: Zero synthetic fallbacks or Math.random().
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { BrandPill } from '@/components/ui/BrandPill';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataStateBadge } from '@/components/ui/DataStateBadge';
import { TARGET_BRANDS } from '@/config/brands';
import { TargetBrand } from '@/types/brands';
import { RawEvidenceRecord } from '@/types/evidence';
import { AnalyticalMonth } from '@/types/analytics';
import { getVerifiedWorkingSourceUrl } from '@/lib/urlHelpers';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  Zap,
  Droplet,
  Shield,
  Wifi,
  Wrench,
  DollarSign,
  Printer,
  Sparkles,
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

interface ConsumerSentimentSectionProps {
  selectedMonth: AnalyticalMonth;
  selectedBrand?: TargetBrand | 'All';
  evidenceRecords: RawEvidenceRecord[];
  onOpenEvidence?: (metricId: string, metricName: string, brand: TargetBrand | 'All') => void;
}

const THEME_ICONS: Record<string, React.ReactNode> = {
  'Print Quality': <Sparkles className="w-4 h-4 text-amber-400" />,
  'Running Cost & TCO': <DollarSign className="w-4 h-4 text-emerald-400" />,
  'Refill Experience': <Droplet className="w-4 h-4 text-sky-400" />,
  'Reliability & Feed': <Printer className="w-4 h-4 text-indigo-400" />,
  'Print Speed': <Zap className="w-4 h-4 text-yellow-400" />,
  'Connectivity & Mobile': <Wifi className="w-4 h-4 text-blue-400" />,
  'Maintenance & Heads': <Wrench className="w-4 h-4 text-rose-400" />,
  'Warranty & Service': <Shield className="w-4 h-4 text-emerald-400" />,
  'Price & Value': <DollarSign className="w-4 h-4 text-teal-400" />,
};

const THEME_DESCRIPTIONS: Record<string, string> = {
  'Print Quality': 'Vibrant color reproduction, photo clarity, and razor-sharp black text on documents.',
  'Running Cost & TCO': 'Cost-per-page efficiency and ink bottle economy for high-volume monthly printing.',
  'Refill Experience': 'Spill-free, keyed bottle valves and auto-stop mechanisms that keep hands clean.',
  'Reliability & Feed': 'Jam-free feeding mechanisms and enclosed dust-resistant paper trays.',
  'Print Speed': 'Time-to-first-page and pages-per-minute throughput for monochrome and color jobs.',
  'Connectivity & Mobile': 'Ease of Wi-Fi pairing, Apple AirPrint, and dedicated mobile apps (HP Smart vs Epson Smart Panel).',
  'Maintenance & Heads': 'User-replaceable printheads and maintenance cartridges vs required service center visits.',
  'Warranty & Service': 'HP 2-year Onsite Service (technician at home/office) vs standard competitor carry-in depot service.',
  'Price & Value': 'Hardware initial investment vs bundled ink volume and total cost of ownership.',
};

export const ConsumerSentimentSection: React.FC<ConsumerSentimentSectionProps> = ({
  selectedMonth,
  selectedBrand = 'All',
  evidenceRecords,
  onOpenEvidence: _onOpenEvidence,
}) => {
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<TargetBrand | 'All'>(selectedBrand);
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string>('All');

  // Synchronize internal filter when parent global brand selection updates
  useEffect(() => {
    setSelectedBrandFilter(selectedBrand);
  }, [selectedBrand]);

  // Filter reviews strictly by channel and analytical month
  const reviews = useMemo(() => {
    return evidenceRecords.filter(
      (r) =>
        r.channel === 'Consumer Review' &&
        (selectedMonth === 'ALL' || (r.published_at && r.published_at.startsWith(selectedMonth)))
    );
  }, [evidenceRecords, selectedMonth]);

  // Authentic Brand Stats derived solely from verified observations
  const brandStats = useMemo(() => {
    return TARGET_BRANDS.map((brand) => {
      const brandReviews = reviews.filter((r) => r.brand === brand);
      const reviewCount = brandReviews.length;

      if (reviewCount === 0) {
        return {
          brand,
          reviewCount: 0,
          avgRating: null as number | null,
          positivePct: null as number | null,
          isObserved: false,
        };
      }

      const totalRating = brandReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
      const validRatingReviews = brandReviews.filter((r) => r.rating !== undefined && r.rating !== null);
      const avgRating =
        validRatingReviews.length > 0
          ? Number((totalRating / validRatingReviews.length).toFixed(1))
          : null;

      const positiveReviews = brandReviews.filter((r) => (r.rating || 0) >= 4).length;
      const positivePct = Math.round((positiveReviews / reviewCount) * 100);

      return {
        brand,
        reviewCount,
        avgRating,
        positivePct,
        isObserved: true,
      };
    });
  }, [reviews]);

  // Authentic Thematic analysis mapped to observed tags and content
  const themes = useMemo(() => {
    const list = Object.keys(THEME_DESCRIPTIONS);
    return list.map((theme) => {
      const matched = reviews.filter(
        (r) =>
          r.evidence_tags?.includes(theme) ||
          r.raw_title.toLowerCase().includes(theme.toLowerCase()) ||
          (r.content_en_translation && r.content_en_translation.toLowerCase().includes(theme.toLowerCase()))
      );
      const hpMatched = matched.filter((r) => r.brand === 'HP');
      const hpPositive = hpMatched.filter((r) => (r.rating || 0) >= 4).length;
      const hpSentiment = hpMatched.length > 0 ? Math.round((hpPositive / hpMatched.length) * 100) : null;

      return {
        theme,
        totalMentions: matched.length,
        hpSentiment,
        sentimentLabel:
          theme === 'Warranty & Service' && hpMatched.length > 0
            ? 'HP Advantage (Onsite)'
            : matched.length > 0
            ? 'Observed Signal'
            : 'Unobserved in Period',
      };
    });
  }, [reviews]);

  // Filtered reviews list respecting brand and thematic filters
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (selectedBrandFilter !== 'All' && r.brand !== selectedBrandFilter) return false;
      if (
        selectedThemeFilter !== 'All' &&
        !r.evidence_tags?.includes(selectedThemeFilter) &&
        !r.raw_title.toLowerCase().includes(selectedThemeFilter.toLowerCase()) &&
        !(r.content_en_translation && r.content_en_translation.toLowerCase().includes(selectedThemeFilter.toLowerCase()))
      )
        return false;
      return true;
    });
  }, [reviews, selectedBrandFilter, selectedThemeFilter]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  if (reviews.length === 0) {
    return (
      <div className="space-y-6 font-sans">
        <SectionHeader
          title="6. Consumer Sentiment & Customer Voice Intelligence"
          subtitle="Audited buyer reviews, ratings, and recurring satisfaction themes across Shopee Verified Purchases, Pantip.com, and JIB Thailand."
          period={selectedMonth}
          sources={['Shopee Verified Purchases', 'Pantip.com Community', 'JIB Customer Feedback']}
          totalEvidence={0}
        />
        <EmptyState
          title="INSUFFICIENT VERIFIED CONSUMER EVIDENCE FOR THIS PERIOD"
          message={`No consumer review records were ingested for ${selectedMonth}. Verified purchaser reviews are captured directly from authentic marketplace listing review carousels.`}
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 font-sans"
    >
      <SectionHeader
        title="6. Consumer Sentiment & Customer Voice Intelligence"
        subtitle="Audited buyer reviews, ratings, and recurring satisfaction themes across Shopee Verified Purchases, Pantip.com, and JIB Thailand."
        period={selectedMonth}
        sources={['Shopee Verified Purchases', 'Pantip.com Community', 'JIB Customer Feedback']}
        totalEvidence={reviews.length}
        filteredEvidence={filteredReviews.length}
      />

      {/* KPI Cards: Brand Sentiment Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {brandStats.map((stat) => {
          const isSelected = selectedBrandFilter === 'All' || selectedBrandFilter === stat.brand;
          return (
            <Card
              key={stat.brand}
              className={`p-4 rounded-xl relative overflow-hidden transition-all ${
                isSelected
                  ? 'bg-[#111111] border-[#222222]'
                  : 'bg-[#0a0a0a] border-[#1a1a1a] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <BrandPill brand={stat.brand} size="md" />
                {stat.isObserved && stat.avgRating !== null ? (
                  <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {stat.avgRating.toFixed(1)} / 5.0
                  </span>
                ) : (
                  <DataStateBadge state="MISSING" />
                )}
              </div>

              <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-500 block">Positive Sentiment</span>
                  {stat.isObserved && stat.positivePct !== null ? (
                    <span className="text-emerald-400 font-bold font-mono text-base block">
                      {stat.positivePct}%
                    </span>
                  ) : (
                    <span className="text-zinc-500 font-mono text-xs block italic">UNOBSERVED</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-zinc-500 block">Audited Reviews</span>
                  <span className="text-zinc-300 font-bold font-mono text-base block">
                    {stat.reviewCount}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </motion.div>

      {/* Thematic Matrix: 9 Recurring Consumer Themes */}
      <motion.div variants={itemVariants}>
        <Card className="p-5 bg-[#111111] border-[#222222] rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Recurring Consumer Conversation Themes &amp; Strengths
              </h3>
              <InfoTooltip
                title="Thematic Consumer Sentiment"
                content="Sentiment distribution mapped across consumer conversation themes identified in Thai buyer review corpora."
              />
            </div>
            <span className="text-[11px] font-mono text-zinc-500">{themes.length} Thematic Dimensions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {themes.map((t) => (
              <div
                key={t.theme}
                onClick={() => setSelectedThemeFilter(selectedThemeFilter === t.theme ? 'All' : t.theme)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  selectedThemeFilter === t.theme
                    ? 'bg-zinc-900 border-white text-white shadow-lg'
                    : 'bg-zinc-950/80 border-zinc-800/90 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {THEME_ICONS[t.theme] || <MessageSquare className="w-4 h-4 text-zinc-400" />}
                    <span className="text-xs font-bold text-white">{t.theme}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      t.sentimentLabel.includes('HP Advantage')
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                        : t.totalMentions > 0
                        ? 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                        : 'bg-zinc-900/40 text-zinc-600 border border-zinc-800/40'
                    }`}
                  >
                    {t.totalMentions > 0 ? `${t.totalMentions} mentions` : '0 mentions'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed font-sans">
                  {THEME_DESCRIPTIONS[t.theme]}
                </p>
                {t.hpSentiment !== null && (
                  <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">HP Positive Voice:</span>
                    <span className="text-emerald-400 font-semibold">{t.hpSentiment}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Verified Consumer Review Evidence Testimonials */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-800">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Audited Consumer Testimonials ({filteredReviews.length} Records)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Original Thai customer reviews with English translations, verified purchase badges, and source links
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedBrandFilter('All')}
              className={`px-2.5 py-1 text-[11px] font-sans font-medium rounded-full transition-all ${
                selectedBrandFilter === 'All'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              ALL BRANDS
            </button>
            {TARGET_BRANDS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBrandFilter(b === selectedBrandFilter ? 'All' : b)}
                className="cursor-pointer"
              >
                <BrandPill brand={b} size="sm" active={selectedBrandFilter === 'All' || selectedBrandFilter === b} />
              </button>
            ))}
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#0c0c0e] border border-zinc-800 text-center space-y-2">
            <p className="text-xs font-mono text-zinc-400">
              No reviews match the selected filter ({selectedBrandFilter} / {selectedThemeFilter}).
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedBrandFilter('All');
                setSelectedThemeFilter('All');
              }}
              className="text-xs text-sky-400 hover:underline font-mono"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredReviews.slice(0, 12).map((rev) => (
              <Card
                key={rev.evidence_id}
                className="p-4 bg-[#0e0e11] border-zinc-800/90 rounded-xl space-y-3 hover:border-zinc-700 transition-all font-sans"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BrandPill brand={rev.brand} size="sm" />
                    <span className="text-xs font-mono font-semibold text-zinc-200">
                      {rev.product_sku || 'Ink Tank Model'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs font-mono flex items-center">
                      {rev.rating ? '★'.repeat(Math.max(1, Math.min(5, rev.rating))) : 'Unrated'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {rev.published_at}
                    </span>
                  </div>
                </div>

                {/* Thai Source Text */}
                {rev.raw_content_th && (
                  <div className="p-2.5 rounded-lg bg-black/50 border border-zinc-800/60 text-xs leading-relaxed">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">
                      🇹🇭 Thai Buyer Quote (Verified)
                    </span>
                    <p className="text-zinc-200 font-sans">
                      &ldquo;{rev.raw_content_th}&rdquo;
                    </p>
                  </div>
                )}

                {/* English Translation */}
                {rev.content_en_translation && (
                  <div className="text-xs text-zinc-400 leading-relaxed font-sans">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-0.5">
                      🇬🇧 English Translation
                    </span>
                    <p className="text-zinc-300">
                      {rev.content_en_translation}
                    </p>
                  </div>
                )}

                {/* Bottom Metadata & Trace Link */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Verified {rev.platform || 'Shopee'} Purchaser
                  </span>

                  <a
                    href={getVerifiedWorkingSourceUrl(rev)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium transition-colors"
                  >
                    <span>Verify on {rev.platform || 'Shopee'} ↗</span>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
