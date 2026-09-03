/**
 * Date normalization, validation, and Buddhist Era conversion utilities
 */

import { DATE_CONFIG } from '@/config/dates';
import { AnalyticalMonth } from '@/types/analytics';

/**
 * Converts a Buddhist Era year (e.g. 2569) or formatted string (e.g. "2569-08-28" or "28/08/2569") to Gregorian
 * Rule: Gregorian Year = Buddhist Era Year - 543
 */
export function convertBuddhistYearToGregorian(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();

  // Pattern 1: ISO formatted BE year (e.g. 2569-08-28)
  const isoBeMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoBeMatch) {
    const year = parseInt(isoBeMatch[1], 10);
    if (year > 2400 && year < 2700) {
      const gregorianYear = year - 543;
      return `${gregorianYear}-${isoBeMatch[2]}-${isoBeMatch[3]}`;
    }
    return trimmed;
  }

  // Pattern 2: Thai DD/MM/BE_YEAR (e.g. 28/08/2569)
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = ddmmyyyyMatch[1].padStart(2, '0');
    const month = ddmmyyyyMatch[2].padStart(2, '0');
    let year = parseInt(ddmmyyyyMatch[3], 10);
    if (year > 2400 && year < 2700) {
      year -= 543;
    }
    return `${year}-${month}-${day}`;
  }

  // Pattern 3: Standalone 4-digit BE year (e.g. 2569)
  const yearOnlyMatch = trimmed.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    const year = parseInt(yearOnlyMatch[1], 10);
    if (year > 2400 && year < 2700) {
      return (year - 543).toString();
    }
  }

  return trimmed;
}

/**
 * Validates whether a date string is a valid ISO YYYY-MM-DD format
 */
export function validateIsoDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const match = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!match) return false;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;

  // Verify that parsed components match to avoid overflow (e.g. 2026-02-31)
  const [y, m, d] = dateStr.split('-').map((num) => parseInt(num, 10));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() + 1 === m &&
    date.getUTCDate() === d
  );
}

/**
 * Checks whether a given ISO date falls strictly within the 90-day observation window:
 * 2026-05-28 through 2026-08-28 inclusive
 */
export function isWithinObservationWindow(dateStr: string): boolean {
  const normalizedDate = convertBuddhistYearToGregorian(dateStr);
  if (!validateIsoDate(normalizedDate)) return false;

  return (
    normalizedDate >= DATE_CONFIG.OBSERVATION_START &&
    normalizedDate <= DATE_CONFIG.OBSERVATION_END
  );
}

/**
 * Assigns an observation date to its respective primary analytical month:
 * - 2026-05-28 to 2026-06-30 -> '2026-06' (late May baseline rolls into June)
 * - 2026-07-01 to 2026-07-31 -> '2026-07'
 * - 2026-08-01 to 2026-08-28 -> '2026-08'
 * Returns null if outside the window.
 */
export function assignAnalyticalMonth(dateStr: string): AnalyticalMonth | null {
  const normalizedDate = convertBuddhistYearToGregorian(dateStr);
  if (!isWithinObservationWindow(normalizedDate)) {
    return null;
  }

  if (normalizedDate <= '2026-06-30') {
    return '2026-06';
  }
  if (normalizedDate <= '2026-07-31') {
    return '2026-07';
  }
  if (normalizedDate <= '2026-08-28') {
    return '2026-08';
  }

  return null;
}
