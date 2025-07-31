import { type ClassValue, clsx } from "clsx";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { productCategories, simpleCategories } from "./category";
import siteSettings from "./site-settings.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDA(value: number) {
  return value.toLocaleString("fr-FR") + " DA";
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

/**
 * React hook to get the current site currency from settings.
 */
export function useCurrency() {
  // In a real app, this could be dynamic (e.g., from context or user settings)
  return useMemo(() => siteSettings.currency, []);
}

/**
 * useAnnouncement - returns the current announcement (static for now, dynamic in future)
 */
export function useAnnouncement() {
  // In the future, fetch from API/DB
  return useMemo(
    () => ({
      html: siteSettings.siteAnnouncementHtml,
    }),
    []
  );
}

export function useProductCategories() {
  return useMemo(() => productCategories, []);
}

export function useSimpleCategories() {
  return useMemo(() => simpleCategories, []);
}
