'use client';

import { toast } from '@/lib/toast';
import { useCallback, useMemo } from 'react';
import { api } from '~/trpc/react';
import { useGuestSession } from './useGuestSession';

/**
 * Unified wishlist hook for guest and authenticated users.
 * - Guest: uses GuestSession model via database and cookies
 * - Authed: uses tRPC product.addFavorite/removeFavorite/getFavorites
 */
export function useWishlist() {
  // We consider user authenticated if product.getFavorites query is permitted
  // const utils = api.useUtils(); // This method doesn't exist on tRPC client

  const favoritesQuery = api.product.getFavorites.useQuery(undefined, {
    retry: false, // Don't retry on auth failures
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  const isAuthenticated = favoritesQuery.isSuccess;

  // Guest session hook for unauthenticated users
  const guestSession = useGuestSession();

  const mergeMutation = api.product.mergeGuestWishlist.useMutation();
  const addFavoriteMutation = api.product.addFavorite.useMutation({
    onMutate: async variables => {
      // optimistic update
      await utils.product.getFavorites.cancel();
      const prev = utils.product.getFavorites.getData();
      utils.product.getFavorites.setData(undefined, old => {
        const set = new Set(old ?? []);
        set.add(variables.productId);
        return Array.from(set);
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.product.getFavorites.setData(undefined, ctx.prev);
      toast.error('Could not add to wishlist');
    },
    onSuccess: () => {
      toast.success('Added to wishlist');
    },
    onSettled: async () => {
      await utils.product.getFavorites.invalidate();
    },
  });
  const removeFavoriteMutation = api.product.removeFavorite.useMutation({
    onMutate: async variables => {
      await utils.product.getFavorites.cancel();
      const prev = utils.product.getFavorites.getData();
      utils.product.getFavorites.setData(undefined, old => {
        const set = new Set(old ?? []);
        set.delete(variables.productId);
        return Array.from(set);
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.product.getFavorites.setData(undefined, ctx.prev);
      toast.error('Could not remove from wishlist');
    },
    onSuccess: () => {
      toast.success('Removed from wishlist');
    },
    onSettled: async () => {
      await utils.product.getFavorites.invalidate();
    },
  });

  const wishlistIds = useMemo(() => {
    if (isAuthenticated) return favoritesQuery.data ?? [];
    // Return empty array during SSR/hydration to avoid mismatch
    if (!guestSession.isInitialized) return [];
    return guestSession.wishlistItems;
  }, [
    favoritesQuery.data,
    isAuthenticated,
    guestSession.wishlistItems,
    guestSession.isInitialized,
  ]);

  const isLiked = useCallback(
    (productId: string) => {
      if (isAuthenticated) {
        return (favoritesQuery.data ?? []).includes(productId);
      }
      // Return false during SSR/hydration to avoid mismatch
      if (!guestSession.isInitialized) return false;
      return guestSession.isInWishlist(productId);
    },
    [favoritesQuery.data, isAuthenticated, guestSession]
  );

  const toggle = useCallback(
    async (productId: string) => {
      if (isAuthenticated) {
        const inList = (favoritesQuery.data ?? []).includes(productId);
        if (inList) {
          await removeFavoriteMutation.mutateAsync({ productId });
        } else {
          await addFavoriteMutation.mutateAsync({ productId });
        }
      } else {
        try {
          const wasInList = guestSession.isInWishlist(productId);
          await guestSession.toggleWishlist(productId);
          toast.success(wasInList ? 'Removed from wishlist' : 'Added to wishlist');
        } catch (error) {
          toast.error('Failed to update wishlist');
        }
      }
    },
    [
      isAuthenticated,
      favoritesQuery.data,
      addFavoriteMutation,
      removeFavoriteMutation,
      guestSession,
    ]
  );

  const setFromServerOnLogin = useCallback((serverIds: string[]) => {
    // This is handled by mergeGuestToServer now
  }, []);

  const mergeGuestToServer = useCallback(
    async (userId?: string) => {
      if (!isAuthenticated || !guestSession.sessionToken) return;

      // If no userId provided, try to use existing guest wishlist merge functionality
      if (!userId) {
        // Use the existing mergeGuestWishlist procedure which should work with the current session
        if (guestSession.wishlistItems.length === 0) return;

        try {
          await utils.product.getFavorites.cancel();
          await mergeMutation.mutateAsync({ productIds: guestSession.wishlistItems });
          // Clear guest session after successful merge
          localStorage.removeItem('guest_session_token');
          document.cookie = 'guest_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          await utils.product.getFavorites.invalidate();
          toast.success('Wishlist synced');
        } catch {
          toast.error('Could not sync wishlist');
        }
        return;
      }

      // If userId is provided, use the guest session merge method
      try {
        await utils.product.getFavorites.cancel();
        await guestSession.mergeWithUser(userId);
        await utils.product.getFavorites.invalidate();
        toast.success('Wishlist synced');
      } catch {
        toast.error('Could not sync wishlist');
      }
    },
    [isAuthenticated, utils, guestSession, mergeMutation]
  );

  return {
    isAuthenticated,
    ids: wishlistIds,
    isLiked,
    toggle,
    setFromServerOnLogin,
    mergeGuestToServer,
    isLoading: favoritesQuery.isLoading || guestSession.isLoading || !guestSession.isInitialized,
    isUpdating:
      guestSession.isAddingToWishlist ||
      guestSession.isRemovingFromWishlist ||
      addFavoriteMutation.isPending ||
      removeFavoriteMutation.isPending,
  };
}
