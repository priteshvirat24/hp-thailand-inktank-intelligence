import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatTHB(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '฿--';
  }
  return `฿${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatPercent(value: number | null | undefined, includeSign = false): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--%';
  }
  const prefix = includeSign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  return value.toLocaleString('en-US');
}
