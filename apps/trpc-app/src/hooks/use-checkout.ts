"use client";
import { api } from "~/trpc/react";
import type { CreateOrderFromCartInput, Order } from "~/types/order";

export function useCheckout(cartId: string) {
  const utils = api.useUtils();
  const placeOrder = api.checkout.placeOrderFromCart.useMutation({
    onSuccess: () => utils.cart.getActive.invalidate({ cartId }),
  });

  return {
    placeOrderFromCart: (payload: Omit<CreateOrderFromCartInput, "cartId">) =>
      placeOrder.mutateAsync({ cartId, ...payload }) as Promise<Order>,
    isPlacing: placeOrder.isPending,
  };
}