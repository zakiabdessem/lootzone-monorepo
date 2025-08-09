"use client";

import { useMemo, useCallback } from "react";
import { api } from "~/trpc/react";
import { toast } from "@/lib/toast";

export type CartItemView = {
  productId: string;
  variantId: string;
  title: string;
  slug: string;
  image: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export function useCart() {
  const utils = api.useUtils();
  const { data, isLoading, isFetching } = api.cart.get.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const addMutation = api.cart.addItem.useMutation({
    onError: () => toast.error("Could not add to cart"),
    onSuccess: async () => {
      await utils.cart.get.invalidate();
      toast.success("Added to cart");
    },
  });

  const updateMutation = api.cart.updateQuantity.useMutation({
    onError: () => toast.error("Could not update quantity"),
    onSuccess: async () => {
      await utils.cart.get.invalidate();
    },
  });

  const removeMutation = api.cart.removeItem.useMutation({
    onError: () => toast.error("Could not remove item"),
    onSuccess: async () => {
      await utils.cart.get.invalidate();
    },
  });

  const clearMutation = api.cart.clear.useMutation({
    onError: () => toast.error("Could not clear cart"),
    onSuccess: async () => {
      await utils.cart.get.invalidate();
    },
  });

  const items: CartItemView[] = useMemo(() => data?.items ?? [], [data]);
  const itemCount = useMemo(() => data?.itemCount ?? 0, [data]);
  const subtotal = useMemo(() => data?.subtotal ?? 0, [data]);
  const subtotalFormatted = useMemo(() => `${(subtotal).toLocaleString("fr-FR")} DA`, [subtotal]);

  const add = useCallback(async (args: { productId: string; variantId: string; quantity?: number }) => {
    await addMutation.mutateAsync({ ...args, quantity: args.quantity ?? 1 });
  }, [addMutation]);

  const updateQuantity = useCallback(async (variantId: string, quantity: number) => {
    await updateMutation.mutateAsync({ variantId, quantity });
  }, [updateMutation]);

  const remove = useCallback(async (variantId: string) => {
    await removeMutation.mutateAsync({ variantId });
  }, [removeMutation]);

  const clear = useCallback(async () => {
    await clearMutation.mutateAsync();
  }, [clearMutation]);

  return {
    items,
    itemCount,
    subtotal,
    subtotalFormatted,
    currency: data?.currency ?? "DZD",
    isLoading: isLoading || isFetching,
    add,
    updateQuantity,
    remove,
    clear,
  };
}