"use client";
import { useMemo } from "react";
import { api } from "~/trpc/react";
import type { Cart, CartItemInput } from "~/types/order";

export function useCart(cartId: string) {
  const utils = api.useUtils();
  const { data, isLoading, refetch } = api.cart.getActive.useQuery({ cartId });

  const addItem = api.cart.addItem.useMutation({
    onSuccess: () => utils.cart.getActive.invalidate({ cartId }),
  });
  const updateItemQuantity = api.cart.updateItemQuantity.useMutation({
    onSuccess: () => utils.cart.getActive.invalidate({ cartId }),
  });
  const removeItem = api.cart.removeItem.useMutation({
    onSuccess: () => utils.cart.getActive.invalidate({ cartId }),
  });
  const clear = api.cart.clear.useMutation({
    onSuccess: () => utils.cart.getActive.invalidate({ cartId }),
  });

  return {
    cart: data as Cart | undefined,
    isLoading,
    refetch,
    addItem: (item: CartItemInput) => addItem.mutateAsync({ cartId, item }),
    updateItemQuantity: (itemId: string, quantity: number) =>
      updateItemQuantity.mutateAsync({ cartId, itemId, quantity }),
    removeItem: (itemId: string) => removeItem.mutateAsync({ cartId, itemId }),
    clear: () => clear.mutateAsync({ cartId }),
  };
}