"use client";

import { toast } from "@/lib/toast";
import { useCallback, useMemo } from "react";
import { api } from "~/trpc/react";

/**
 * Unified wishlist hook using server for both guest and authenticated users.
 * - Guest: product.getGuestFavorites/addGuestFavorite/removeGuestFavorite (cookie session)
 * - Authed: product.addFavorite/removeFavorite/getFavorites
 */
export function useWishlist() {
  const utils = api.useUtils();

  // Auth favorites
  const authFavs = api.product.getFavorites.useQuery(undefined);
  const isAuthenticated = authFavs.isSuccess;

  // Guest favorites (always query; server will tie cookie session)
  const guestFavs = api.product.getGuestFavorites.useQuery(undefined, {
    enabled: !isAuthenticated,
  });

  const addFavoriteMutation = api.product.addFavorite.useMutation({
    onMutate: async (variables) => {
      await utils.product.getFavorites.cancel();
      const prev = utils.product.getFavorites.getData();
      utils.product.getFavorites.setData(undefined, (old) => {
        const set = new Set(old ?? []);
        set.add(variables.productId);
        return Array.from(set);
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.product.getFavorites.setData(undefined, ctx.prev);
      toast.error("Could not add to wishlist");
    },
    onSuccess: () => {
      toast.success("Added to wishlist");
    },
    onSettled: async () => {
      await utils.product.getFavorites.invalidate();
    },
  });

  const removeFavoriteMutation = api.product.removeFavorite.useMutation({
    onMutate: async (variables) => {
      await utils.product.getFavorites.cancel();
      const prev = utils.product.getFavorites.getData();
      utils.product.getFavorites.setData(undefined, (old) => {
        const set = new Set(old ?? []);
        set.delete(variables.productId);
        return Array.from(set);
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.product.getFavorites.setData(undefined, ctx.prev);
      toast.error("Could not remove from wishlist");
    },
    onSuccess: () => {
      toast.success("Removed from wishlist");
    },
    onSettled: async () => {
      await utils.product.getFavorites.invalidate();
    },
  });

  const addGuestFavorite = api.product.addGuestFavorite.useMutation({
    onSuccess: async () => {
      await utils.product.getGuestFavorites.invalidate();
      toast.success("Added to wishlist");
    },
    onError: () => toast.error("Could not add to wishlist"),
  });

  const removeGuestFavorite = api.product.removeGuestFavorite.useMutation({
    onSuccess: async () => {
      await utils.product.getGuestFavorites.invalidate();
      toast.success("Removed from wishlist");
    },
    onError: () => toast.error("Could not remove from wishlist"),
  });

  const ids = useMemo(() => {
    if (isAuthenticated) return authFavs.data ?? [];
    return guestFavs.data ?? [];
  }, [isAuthenticated, authFavs.data, guestFavs.data]);

  const isLiked = useCallback(
    (productId: string) => ids.includes(productId),
    [ids]
  );

  const toggle = useCallback(
    async (productId: string) => {
      if (isAuthenticated) {
        const inList = (authFavs.data ?? []).includes(productId);
        if (inList) {
          await removeFavoriteMutation.mutateAsync({ productId });
        } else {
          await addFavoriteMutation.mutateAsync({ productId });
        }
      } else {
        const inList = (guestFavs.data ?? []).includes(productId);
        if (inList) {
          await removeGuestFavorite.mutateAsync({ productId });
        } else {
          await addGuestFavorite.mutateAsync({ productId });
        }
      }
    },
    [isAuthenticated, authFavs.data, guestFavs.data, addFavoriteMutation, removeFavoriteMutation, addGuestFavorite, removeGuestFavorite]
  );

  const mergeGuestToServer = api.product.mergeGuestWishlist.useMutation();

  const handleMergeGuestToServer = useCallback(async () => {
    if (!isAuthenticated) return;
    const guest = guestFavs.data ?? [];
    if (guest.length === 0) return;
    try {
      await utils.product.getFavorites.cancel();
      await mergeGuestToServer.mutateAsync({ productIds: guest });
      await Promise.all([
        utils.product.getFavorites.invalidate(),
        utils.product.getGuestFavorites.invalidate(),
      ]);
      toast.success("Wishlist synced");
    } catch {
      toast.error("Could not sync wishlist");
    }
  }, [isAuthenticated, guestFavs.data, utils, mergeGuestToServer]);

  return {
    isAuthenticated,
    ids,
    isLiked,
    toggle,
    mergeGuestToServer: handleMergeGuestToServer,
    isLoading: isAuthenticated ? authFavs.isLoading : guestFavs.isLoading,
  };
}
