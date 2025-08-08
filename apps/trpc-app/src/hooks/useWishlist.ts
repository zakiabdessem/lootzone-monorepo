"use client";

import { toast } from "@/lib/toast";
import {
  addToGuestWishlist,
  isInGuestWishlist,
  readGuestWishlist,
  removeFromGuestWishlist,
  writeGuestWishlist,
} from "@/lib/wishlist/storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";

/**
 * Unified wishlist hook for guest and authenticated users.
 * - Guest: uses sessionStorage via storage.ts
 * - Authed: uses tRPC product.addFavorite/removeFavorite/getFavorites
 */
export function useWishlist() {
  // We consider user authenticated if product.getFavorites query is permitted
  const utils = api.useUtils();
  const favoritesQuery = api.product.getFavorites.useQuery(undefined);

  const isAuthenticated = favoritesQuery.isSuccess;

  const mergeMutation = api.product.mergeGuestWishlist.useMutation();
  const addFavoriteMutation = api.product.addFavorite.useMutation({
    onMutate: async (variables) => {
      // optimistic update
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

  const [guestIds, setGuestIds] = useState<string[]>([]);

  useEffect(() => {
    // Load guest wishlist at mount
    setGuestIds(readGuestWishlist());
  }, []);

  const wishlistIds = useMemo(() => {
    if (isAuthenticated) return favoritesQuery.data ?? [];
    return guestIds;
  }, [favoritesQuery.data, isAuthenticated, guestIds]);

  const isLiked = useCallback(
    (productId: string) => {
      if (isAuthenticated) {
        return (favoritesQuery.data ?? []).includes(productId);
      }
      return isInGuestWishlist(productId);
    },
    [favoritesQuery.data, isAuthenticated]
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
        const inList = isInGuestWishlist(productId);
        if (inList) {
          const ids = removeFromGuestWishlist(productId);
          setGuestIds(ids);
          toast.success("Removed from wishlist");
        } else {
          const ids = addToGuestWishlist(productId);
          setGuestIds(ids);
          toast.success("Added to wishlist");
        }
      }
    },
    [isAuthenticated, favoritesQuery.data, addFavoriteMutation, removeFavoriteMutation]
  );

  const setFromServerOnLogin = useCallback((serverIds: string[]) => {
    writeGuestWishlist([]);
    setGuestIds([]);
  }, []);

  const mergeGuestToServer = useCallback(async () => {
    if (!isAuthenticated) return;
    const guest = readGuestWishlist();
    if (guest.length === 0) return;
    try {
      await utils.product.getFavorites.cancel();
      await mergeMutation.mutateAsync({ productIds: guest });
      writeGuestWishlist([]);
      setGuestIds([]);
      await utils.product.getFavorites.invalidate();
      toast.success("Wishlist synced");
    } catch {
      toast.error("Could not sync wishlist");
    }
  }, [isAuthenticated, utils, mergeMutation]);

  return {
    isAuthenticated,
    ids: wishlistIds,
    isLiked,
    toggle,
    setFromServerOnLogin,
    mergeGuestToServer,
    isLoading: favoritesQuery.isLoading,
  };
}
