"use client";

// Guest cart storage using sessionStorage. Items keyed by variantId.
// Minimal line item: { productId, variantId, quantity }
const STORAGE_KEY = "cart:session";

type LineItem = { productId: string; variantId: string; quantity: number };

type CartSnapshot = LineItem[];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function readGuestCart(): CartSnapshot {
  if (!isBrowser()) return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) =>
      x && typeof x.productId === "string" && typeof x.variantId === "string" && typeof x.quantity === "number"
    );
  } catch {
    return [];
  }
}

export function writeGuestCart(items: CartSnapshot): void {
  if (!isBrowser()) return;
  try {
    // normalize: merge by variantId, clamp quantity >= 1
    const byVariant = new Map<string, LineItem>();
    for (const it of items) {
      const key = it.variantId;
      const prev = byVariant.get(key);
      const qty = Math.max(1, Math.floor(it.quantity || 1));
      if (prev) byVariant.set(key, { ...prev, quantity: prev.quantity + qty });
      else byVariant.set(key, { productId: it.productId, variantId: it.variantId, quantity: qty });
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(byVariant.values())));
  } catch {}
}

export function addToGuestCart(item: LineItem): CartSnapshot {
  const current = readGuestCart();
  const next = [...current, item];
  writeGuestCart(next);
  return readGuestCart();
}

export function removeFromGuestCart(variantId: string): CartSnapshot {
  const current = readGuestCart();
  const next = current.filter((x) => x.variantId !== variantId);
  writeGuestCart(next);
  return readGuestCart();
}

export function updateGuestCartQuantity(variantId: string, quantity: number): CartSnapshot {
  const current = readGuestCart();
  const next = current.map((x) => (x.variantId === variantId ? { ...x, quantity: Math.max(1, Math.floor(quantity || 1)) } : x));
  writeGuestCart(next);
  return readGuestCart();
}

export function clearGuestCart(): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}