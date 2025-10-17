'use client';

import { useCallback, useMemo } from 'react';
import { api } from '~/trpc/react';
import { useGuestSession } from './useGuestSession';

export type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
  addedAt: string;
};

/**
 * Hook to manage cart for guest users
 * TODO: Add authenticated user support when needed
 */
export function useCart() {
  const guestSession = useGuestSession();

  // For guest users, parse cart items from session
  const guestCartItems = useMemo(() => {
    if (!guestSession.cartItems) return [];
    try {
      return Array.isArray(guestSession.cartItems)
        ? (guestSession.cartItems as CartItem[])
        : [];
    } catch {
      return [];
    }
  }, [guestSession.cartItems]);

  // const utils = api.useUtils(); // This method doesn't exist on tRPC client

  // Mutations for guest cart with cache invalidation
  const addToGuestCart = api.guestSession.addToCart.useMutation({
    onSuccess: () => {
      // Invalidate both cart queries to refresh the data
      void utils.guestSession.getCart.invalidate();
      void utils.guestSession.getWishlist.invalidate();
    },
  });

  const removeFromGuestCart = api.guestSession.removeFromCart.useMutation({
    onSuccess: () => {
      void utils.guestSession.getCart.invalidate();
      void utils.guestSession.getWishlist.invalidate();
    },
  });

  const updateGuestCartQuantity = api.guestSession.updateCartQuantity.useMutation({
    onSuccess: () => {
      void utils.guestSession.getCart.invalidate();
      void utils.guestSession.getWishlist.invalidate();
    },
  });

  const clearGuestCart = api.guestSession.clearCart.useMutation({
    onSuccess: () => {
      void utils.guestSession.getCart.invalidate();
      void utils.guestSession.getWishlist.invalidate();
    },
  });

  // Get cart items with product details
  const { data: cartDetails, isLoading: isLoadingDetails } = api.guestSession.getCart.useQuery(
    undefined,
    { enabled: guestSession.isInitialized }
  );

  /**
   * Add item to cart
   */
  const addToCart = useCallback(
    async (productId: string, variantId: string, quantity: number = 1) => {
      try {
        await addToGuestCart.mutateAsync({
          productId,
          variantId,
          quantity,
        });
      } catch (error) {
        console.error('Failed to add to cart:', error);
        throw error;
      }
    },
    [addToGuestCart]
  );

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(
    async (productId: string, variantId: string) => {
      try {
        await removeFromGuestCart.mutateAsync({
          productId,
          variantId,
        });
      } catch (error) {
        console.error('Failed to remove from cart:', error);
        throw error;
      }
    },
    [removeFromGuestCart]
  );

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback(
    async (productId: string, variantId: string, quantity: number) => {
      if (quantity <= 0) {
        return removeFromCart(productId, variantId);
      }

      try {
        await updateGuestCartQuantity.mutateAsync({
          productId,
          variantId,
          quantity,
        });
      } catch (error) {
        console.error('Failed to update quantity:', error);
        throw error;
      }
    },
    [updateGuestCartQuantity, removeFromCart]
  );

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    try {
      await clearGuestCart.mutateAsync();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }, [clearGuestCart]);

  /**
   * Check if item is in cart
   */
  const isInCart = useCallback(
    (productId: string, variantId: string) => {
      return guestCartItems.some(
        (item) => item.productId === productId && item.variantId === variantId
      );
    },
    [guestCartItems]
  );

  /**
   * Get item quantity
   */
  const getItemQuantity = useCallback(
    (productId: string, variantId: string) => {
      const item = guestCartItems.find(
        (item) => item.productId === productId && item.variantId === variantId
      );
      return item?.quantity ?? 0;
    },
    [guestCartItems]
  );

  // Calculate totals
  const totals = useMemo(() => {
    if (!cartDetails?.items) {
      return { subtotal: 0, itemCount: 0, uniqueItemCount: 0 };
    }

    const subtotal = cartDetails.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = cartDetails.items.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueItemCount = cartDetails.items.length;

    return { subtotal, itemCount, uniqueItemCount };
  }, [cartDetails]);

  const isUpdating =
    addToGuestCart.isPending ||
    removeFromGuestCart.isPending ||
    updateGuestCartQuantity.isPending ||
    clearGuestCart.isPending;

  return {
    // Cart items
    items: guestCartItems,
    cartDetails: cartDetails?.items ?? [],
    
    // Totals
    ...totals,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Helpers
    isInCart,
    getItemQuantity,
    
    // Loading states
    isLoading: isLoadingDetails,
    isUpdating,
    isInitialized: guestSession.isInitialized,
  };
}
