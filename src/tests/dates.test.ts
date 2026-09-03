import { describe, it, expect } from 'vitest';
import {
  convertBuddhistYearToGregorian,
  validateIsoDate,
  isWithinObservationWindow,
  assignAnalyticalMonth,
} from '@/lib/dates';
import { DATE_CONFIG } from '@/config/dates';

describe('Date Utilities & Buddhist Era Normalization', () => {
  it('converts Buddhist Era ISO dates (2569 -> 2026)', () => {
    expect(convertBuddhistYearToGregorian('2569-08-28')).toBe('2026-08-28');
    expect(convertBuddhistYearToGregorian('2569-06-15')).toBe('2026-06-15');
    expect(convertBuddhistYearToGregorian('2026-08-28')).toBe('2026-08-28'); // Unchanged Gregorian
  });

  it('converts Thai DD/MM/BE_YEAR format (28/08/2569 -> 2026-08-28)', () => {
    expect(convertBuddhistYearToGregorian('28/08/2569')).toBe('2026-08-28');
    expect(convertBuddhistYearToGregorian('15/06/2569')).toBe('2026-06-15');
    expect(convertBuddhistYearToGregorian('01/07/2026')).toBe('2026-07-01');
  });

  it('validates ISO YYYY-MM-DD date formats and detects invalid dates', () => {
    expect(validateIsoDate('2026-08-28')).toBe(true);
    expect(validateIsoDate('2026-06-01')).toBe(true);
    expect(validateIsoDate('2026-02-31')).toBe(false); // Invalid calendar date
    expect(validateIsoDate('invalid-date')).toBe(false);
    expect(validateIsoDate('')).toBe(false);
  });

  it('correctly checks observation window (2026-05-28 through 2026-08-28)', () => {
    // Within window
    expect(isWithinObservationWindow('2026-05-28')).toBe(true);
    expect(isWithinObservationWindow('2026-06-15')).toBe(true);
    expect(isWithinObservationWindow('2026-07-20')).toBe(true);
    expect(isWithinObservationWindow('2026-08-28')).toBe(true);

    // Buddhist Era input within window
    expect(isWithinObservationWindow('2569-08-28')).toBe(true);

    // Outside window
    expect(isWithinObservationWindow('2026-05-27')).toBe(false); // 1 day before
    expect(isWithinObservationWindow('2026-08-29')).toBe(false); // 1 day after
    expect(isWithinObservationWindow('2025-08-28')).toBe(false);
  });

  it('assigns observation dates to primary analytical months', () => {
    // Late May baseline rolls into June 2026
    expect(assignAnalyticalMonth('2026-05-28')).toBe('2026-06');
    expect(assignAnalyticalMonth('2026-05-31')).toBe('2026-06');
    expect(assignAnalyticalMonth('2026-06-15')).toBe('2026-06');

    // July 2026
    expect(assignAnalyticalMonth('2026-07-01')).toBe('2026-07');
    expect(assignAnalyticalMonth('2026-07-31')).toBe('2026-07');

    // August 2026
    expect(assignAnalyticalMonth('2026-08-01')).toBe('2026-08');
    expect(assignAnalyticalMonth('2026-08-28')).toBe('2026-08');

    // Outside window returns null
    expect(assignAnalyticalMonth('2026-05-20')).toBeNull();
    expect(assignAnalyticalMonth('2026-09-01')).toBeNull();
  });

  it('matches authoritative DATE_CONFIG constants', () => {
    expect(DATE_CONFIG.OBSERVATION_START).toBe('2026-05-28');
    expect(DATE_CONFIG.OBSERVATION_END).toBe('2026-08-28');
    expect(DATE_CONFIG.ANALYTICAL_MONTHS).toEqual(['2026-06', '2026-07', '2026-08']);
  });
});
