"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";
import { formatDA } from "@/lib/utils";
import {
  addToGuestCart,
  readGuestCart,
  removeFromGuestCart,
  updateGuestCartQuantity,
} from "@/lib/cart/storage";

// Minimal line item stored in guest cart
export type CartLine = {
  productId: string;
  variantId: string;
  quantity: number;
};

// Enriched item for UI
export type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
  title: string;
  image: string;
  slug: string;
  variantName: string;
  unitPrice: number;
  lineTotal: number;
};

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  // Load from storage on mount
  useEffect(() => {
    setLines(readGuestCart());
  }, []);

  // Fetch minimal product data for items in cart
  const productIds = useMemo(() => Array.from(new Set(lines.map((l) => l.productId))), [lines]);
  const { data: products } = api.product.getByIds.useQuery(
    { ids: productIds },
    { enabled: productIds.length > 0 }
  );

  const items: CartItem[] = useMemo(() => {
    if (!products) return [];
    const productById = new Map(products.map((p) => [p.id, p]));
    return lines.map((l) => {
      const p = productById.get(l.productId);
      const variant = p?.variants.find((v) => v.id === l.variantId) ?? p?.variants[0];
      const unitPrice = variant?.price ?? 0;
      return {
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
        title: p?.title ?? "",
        image: p?.image ?? "",
        slug: p?.slug ?? "",
        variantName: variant?.name ?? "",
        unitPrice,
        lineTotal: unitPrice * l.quantity,
      };
    });
  }, [lines, products]);

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.lineTotal, 0), [items]);

  const add = useCallback((productId: string, variantId: string, quantity = 1) => {
    const next = addToGuestCart({ productId, variantId, quantity });
    setLines(next);
  }, []);

  const remove = useCallback((variantId: string) => {
    const next = removeFromGuestCart(variantId);
    setLines(next);
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    const next = updateGuestCartQuantity(variantId, quantity);
    setLines(next);
  }, []);

  return {
    items,
    itemCount,
    subtotal,
    subtotalFormatted: formatDA(subtotal),
    add,
    remove,
    updateQuantity,
  };
}