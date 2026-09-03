/**
 * Single source of truth for observation windows and analytical time periods
 */

import { AnalyticalMonth } from '@/types/analytics';

export const DATE_CONFIG = {
  OBSERVATION_START: '2026-05-28',
  OBSERVATION_END: '2026-08-28',
  DURATION_DAYS: 90,
  TIMEZONE: 'Asia/Bangkok',
  ANALYTICAL_MONTHS: ['2026-06', '2026-07', '2026-08'] as const,
  MONTH_LABELS: {
    '2026-06': 'June 2026',
    '2026-07': 'July 2026',
    '2026-08': 'August 2026',
    'ALL': 'All 3 Months (June – August 2026)',
  } as Record<AnalyticalMonth, string>,
} as const;
