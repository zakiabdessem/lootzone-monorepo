import { type ClassValue, clsx } from 'clsx';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { productCategories, simpleCategories } from './category';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDA(value: number) {
  return value.toLocaleString('fr-FR') + ' DA';
}

/**
 * Calculates the discount percentage given original and current price.
 * Returns 0 if no discount or invalid input.
 */
export function getDiscountPercent(original: number, price?: number): number {
  if (price === undefined || price < 0 || original <= 0) return 0;
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

// Site settings hooks have been moved to ~/contexts/SiteSettingsContext
// This provides better caching, SSR support, and prevents API undefined errors
// Import from there: useCurrency, useAnnouncement, useSiteSubAnnouncement, useWhatsAppLink, useTelegramLink

export function useProductCategories() {
  return useMemo(() => productCategories, []);
}

export function useSimpleCategories() {
  return useMemo(() => simpleCategories, []);
}
