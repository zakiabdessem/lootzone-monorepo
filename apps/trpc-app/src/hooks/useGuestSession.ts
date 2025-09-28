'use client';

import { useEffect, useState } from 'react';
import { api } from '~/trpc/react';

const GUEST_SESSION_COOKIE = 'guest_session_token';

/**
 * Hook to manage guest session for unauthenticated users
 * Handles wishlist and cart storage using server-side sessions with cookies
 */
export function useGuestSession() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get session data
  const { data: sessionData, isLoading } = api.guestSession.getWishlist.useQuery(
    { sessionToken: sessionToken! },
    { enabled: !!sessionToken }
  );

  // Create or get session mutation
  const createOrGetSession = api.guestSession.createOrGet.useMutation();

  // Initialize session on mount (client-side only)
  useEffect(() => {
    const initializeSession = async () => {
      // Only run on client side to avoid hydration mismatch
      if (typeof window === 'undefined') {
        setIsInitialized(true);
        return;
      }

      // Check for existing session token in localStorage/cookie
      let token = localStorage.getItem(GUEST_SESSION_COOKIE);

      if (!token) {
        // Create new session
        try {
          const result = await createOrGetSession.mutateAsync({
            sessionToken: undefined,
            ipAddress: undefined, // Could be obtained from request in real implementation
            userAgent: navigator.userAgent,
          });
          token = result.sessionToken;
          localStorage.setItem(GUEST_SESSION_COOKIE, token);

          // Set cookie for server-side access
          document.cookie = `${GUEST_SESSION_COOKIE}=${token}; path=/; max-age=${
            30 * 24 * 60 * 60
          }; SameSite=Lax`;
        } catch (error) {
          console.error('Failed to create guest session:', error);
          setIsInitialized(true);
          return;
        }
      }

      setSessionToken(token);
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initializeSession();
    }
  }, [isInitialized, createOrGetSession]);

  const utils = api.useUtils();

  // Add to wishlist
  const addToWishlist = api.guestSession.addToWishlist.useMutation({
    onMutate: async variables => {
      // Cancel outgoing fetches
      await utils.guestSession.getWishlist.cancel({ sessionToken: variables.sessionToken });

      // Snapshot the previous value
      const previousData = utils.guestSession.getWishlist.getData({
        sessionToken: variables.sessionToken,
      });

      // Optimistically update to the new value
      utils.guestSession.getWishlist.setData({ sessionToken: variables.sessionToken }, old => {
        if (!old) return { wishlistItems: [variables.productId], cartItems: [] };
        const newWishlist = [...old.wishlistItems];
        if (!newWishlist.includes(variables.productId)) {
          newWishlist.push(variables.productId);
        }
        return { ...old, wishlistItems: newWishlist };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousData) {
        utils.guestSession.getWishlist.setData(
          { sessionToken: variables.sessionToken },
          context.previousData
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      utils.guestSession.getWishlist.invalidate({ sessionToken: variables.sessionToken });
    },
  });

  // Remove from wishlist
  const removeFromWishlist = api.guestSession.removeFromWishlist.useMutation({
    onMutate: async variables => {
      // Cancel outgoing fetches
      await utils.guestSession.getWishlist.cancel({ sessionToken: variables.sessionToken });

      // Snapshot the previous value
      const previousData = utils.guestSession.getWishlist.getData({
        sessionToken: variables.sessionToken,
      });

      // Optimistically update to the new value
      utils.guestSession.getWishlist.setData({ sessionToken: variables.sessionToken }, old => {
        if (!old) return { wishlistItems: [], cartItems: [] };
        const newWishlist = old.wishlistItems.filter(id => id !== variables.productId);
        return { ...old, wishlistItems: newWishlist };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousData) {
        utils.guestSession.getWishlist.setData(
          { sessionToken: variables.sessionToken },
          context.previousData
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      utils.guestSession.getWishlist.invalidate({ sessionToken: variables.sessionToken });
    },
  });

  // Merge with user account (call after login)
  const mergeWithUser = api.guestSession.mergeWithUser.useMutation({
    onSuccess: () => {
      // Clear guest session
      localStorage.removeItem(GUEST_SESSION_COOKIE);
      document.cookie = `${GUEST_SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      setSessionToken(null);
    },
  });

  const isInWishlist = (productId: string): boolean => {
    return sessionData?.wishlistItems?.includes(productId) ?? false;
  };

  const toggleWishlist = async (productId: string) => {
    if (!sessionToken) return;

    if (isInWishlist(productId)) {
      await removeFromWishlist.mutateAsync({ sessionToken, productId });
    } else {
      await addToWishlist.mutateAsync({ sessionToken, productId });
    }
  };

  return {
    sessionToken,
    isInitialized,
    isLoading: isLoading || !isInitialized,
    wishlistItems: sessionData?.wishlistItems ?? [],
    cartItems: sessionData?.cartItems ?? [],
    isInWishlist,
    toggleWishlist,
    addToWishlist: (productId: string) =>
      sessionToken ? addToWishlist.mutateAsync({ sessionToken, productId }) : Promise.resolve(),
    removeFromWishlist: (productId: string) =>
      sessionToken
        ? removeFromWishlist.mutateAsync({ sessionToken, productId })
        : Promise.resolve(),
    mergeWithUser: (userId: string) =>
      sessionToken ? mergeWithUser.mutateAsync({ sessionToken, userId }) : Promise.resolve(),
    isAddingToWishlist: addToWishlist.isPending,
    isRemovingFromWishlist: removeFromWishlist.isPending,
  };
}
