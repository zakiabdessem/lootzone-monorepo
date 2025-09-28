import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

const GUEST_SESSION_EXPIRY_DAYS = 30;

export const guestSessionRouter = createTRPCRouter({
  // Create or retrieve guest session
  createOrGet: publicProcedure
    .input(
      z.object({
        sessionToken: z.string().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Try to find existing session
      if (input.sessionToken) {
        const existingSession = await ctx.db.guestSession.findUnique({
          where: {
            sessionToken: input.sessionToken,
            expiresAt: { gt: new Date() }, // Not expired
          },
        });

        if (existingSession) {
          return {
            sessionToken: existingSession.sessionToken,
            wishlistItems: existingSession.wishlistItems,
            cartItems: existingSession.cartItems,
            expiresAt: existingSession.expiresAt,
          };
        }
      }

      // Create new session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + GUEST_SESSION_EXPIRY_DAYS);

      // Generate unique session token using crypto for better randomness
      const sessionToken =
        input.sessionToken || `guest_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

      const newSession = await ctx.db.guestSession.create({
        data: {
          sessionToken,
          wishlistItems: [],
          cartItems: [],
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          expiresAt,
        },
      });

      return {
        sessionToken: newSession.sessionToken,
        wishlistItems: newSession.wishlistItems,
        cartItems: newSession.cartItems,
        expiresAt: newSession.expiresAt,
      };
    }),

  // Add product to guest wishlist
  addToWishlist: publicProcedure
    .input(
      z.object({
        sessionToken: z.string(),
        productId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.guestSession.findUnique({
        where: {
          sessionToken: input.sessionToken,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Guest session not found or expired',
        });
      }

      // Add product ID to wishlist if not already present
      const wishlistItems = new Set(session.wishlistItems);
      wishlistItems.add(input.productId);

      const updatedSession = await ctx.db.guestSession.update({
        where: { sessionToken: input.sessionToken },
        data: {
          wishlistItems: Array.from(wishlistItems),
          updatedAt: new Date(),
        },
      });

      return {
        wishlistItems: updatedSession.wishlistItems,
        success: true,
      };
    }),

  // Remove product from guest wishlist
  removeFromWishlist: publicProcedure
    .input(
      z.object({
        sessionToken: z.string(),
        productId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.guestSession.findUnique({
        where: {
          sessionToken: input.sessionToken,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Guest session not found or expired',
        });
      }

      // Remove product ID from wishlist
      const wishlistItems = session.wishlistItems.filter(id => id !== input.productId);

      const updatedSession = await ctx.db.guestSession.update({
        where: { sessionToken: input.sessionToken },
        data: {
          wishlistItems,
          updatedAt: new Date(),
        },
      });

      return {
        wishlistItems: updatedSession.wishlistItems,
        success: true,
      };
    }),

  // Get guest wishlist
  getWishlist: publicProcedure
    .input(z.object({ sessionToken: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.guestSession.findUnique({
        where: {
          sessionToken: input.sessionToken,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        return {
          wishlistItems: [],
          cartItems: [],
        };
      }

      return {
        wishlistItems: session.wishlistItems,
        cartItems: session.cartItems,
      };
    }),

  // Merge guest session with user account (for after login)
  mergeWithUser: publicProcedure
    .input(
      z.object({
        sessionToken: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.guestSession.findUnique({
        where: { sessionToken: input.sessionToken },
      });

      if (!session || session.wishlistItems.length === 0) {
        return { merged: 0 };
      }

      // Add guest wishlist items to user favorites
      await ctx.db.userFavorite.createMany({
        data: session.wishlistItems.map(productId => ({
          userId: input.userId,
          productId,
        })),
        skipDuplicates: true,
      });

      // Clean up guest session
      await ctx.db.guestSession.delete({
        where: { sessionToken: input.sessionToken },
      });

      return { merged: session.wishlistItems.length };
    }),

  // Clean up expired sessions (admin utility)
  cleanupExpired: publicProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.db.guestSession.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return { deletedCount: result.count };
  }),
});
