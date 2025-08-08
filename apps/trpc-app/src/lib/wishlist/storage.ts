"use client";

/**
 * Session-based wishlist storage for guests (non-authenticated users).
 * Uses sessionStorage so it resets when the browser session ends.
 */
const STORAGE_KEY = "wishlist:session";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function readGuestWishlist(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function writeGuestWishlist(ids: string[]): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {}
}

export function addToGuestWishlist(productId: string): string[] {
  const current = new Set(readGuestWishlist());
  current.add(productId);
  const arr = Array.from(current);
  writeGuestWishlist(arr);
  return arr;
}

export function removeFromGuestWishlist(productId: string): string[] {
  const current = new Set(readGuestWishlist());
  current.delete(productId);
  const arr = Array.from(current);
  writeGuestWishlist(arr);
  return arr;
}

export function isInGuestWishlist(productId: string): boolean {
  const current = new Set(readGuestWishlist());
  return current.has(productId);
}
