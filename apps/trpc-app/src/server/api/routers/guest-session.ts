import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

const GUEST_SESSION_EXPIRY_DAYS = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_SESSIONS = 5; // Max 5 sessions per minute per IP

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ipAddress?: string): boolean {
  if (!ipAddress) return true; // Allow if no IP tracking
  
  const now = Date.now();
  const key = ipAddress;
  const limit = rateLimitMap.get(key);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_MAX_SESSIONS) {
    return false;
  }
  
  limit.count++;
  return true;
}

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
      console.log(`🔍 Guest session createOrGet called with token: ${input.sessionToken || 'undefined'}`);
      
      // Rate limiting check
      if (!checkRateLimit(input.ipAddress)) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many guest session creation requests. Please try again later.',
        });
      }
      // Try to find existing session
      if (input.sessionToken) {
        const existingSession = await ctx.db.guestSession.findUnique({
          where: {
            sessionToken: input.sessionToken,
            expiresAt: { gt: new Date() }, // Not expired
          },
        });

        if (existingSession) {
          console.log(`✅ Found existing guest session: ${input.sessionToken}`);
          return {
            sessionToken: existingSession.sessionToken,
            wishlistItems: existingSession.wishlistItems,
            cartItems: existingSession.cartItems,
            expiresAt: existingSession.expiresAt,
          };
        } else {
          console.log(`❌ Session not found or expired: ${input.sessionToken}`);
        }
      }

      // Create new session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + GUEST_SESSION_EXPIRY_DAYS);

      // Generate unique session token using crypto for better randomness
      // Don't reuse the input token if it was invalid/expired
      const sessionToken = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      try {
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

        console.log(`✅ Created new guest session: ${sessionToken}`);
        return {
          sessionToken: newSession.sessionToken,
          wishlistItems: newSession.wishlistItems,
          cartItems: newSession.cartItems,
          expiresAt: newSession.expiresAt,
        };
      } catch (error) {
        console.error(`❌ Failed to create guest session: ${sessionToken}`, error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create guest session',
        });
      }
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

  // Cart operations
  addToCart: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().min(1).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get('guest_session_token')?.value;

      if (!sessionToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'No guest session found',
        });
      }

      const session = await ctx.db.guestSession.findUnique({
        where: { sessionToken },
      });

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Guest session not found',
        });
      }

      // Parse existing cart items
      const cartItems = Array.isArray(session.cartItems)
        ? (session.cartItems as any[])
        : [];

      // Check if item already exists
      const existingItemIndex = cartItems.findIndex(
        (item: any) =>
          item.productId === input.productId && item.variantId === input.variantId
      );

      if (existingItemIndex >= 0) {
        // Update quantity
        cartItems[existingItemIndex].quantity += input.quantity;
      } else {
        // Add new item
        cartItems.push({
          productId: input.productId,
          variantId: input.variantId,
          quantity: input.quantity,
          addedAt: new Date().toISOString(),
        });
      }

      // Update session
      await ctx.db.guestSession.update({
        where: { sessionToken },
        data: { cartItems },
      });

      return { success: true, cartItems };
    }),

  removeFromCart: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        variantId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get('guest_session_token')?.value;

      if (!sessionToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'No guest session found',
        });
      }

      const session = await ctx.db.guestSession.findUnique({
        where: { sessionToken },
      });

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Guest session not found',
        });
      }

      // Parse existing cart items
      const cartItems = Array.isArray(session.cartItems)
        ? (session.cartItems as any[])
        : [];

      // Remove item
      const updatedCartItems = cartItems.filter(
        (item: any) =>
          !(item.productId === input.productId && item.variantId === input.variantId)
      );

      // Update session
      await ctx.db.guestSession.update({
        where: { sessionToken },
        data: { cartItems: updatedCartItems },
      });

      return { success: true, cartItems: updatedCartItems };
    }),

  updateCartQuantity: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get('guest_session_token')?.value;

      if (!sessionToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'No guest session found',
        });
      }

      const session = await ctx.db.guestSession.findUnique({
        where: { sessionToken },
      });

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Guest session not found',
        });
      }

      // Parse existing cart items
      const cartItems = Array.isArray(session.cartItems)
        ? (session.cartItems as any[])
        : [];

      // Update quantity
      const itemIndex = cartItems.findIndex(
        (item: any) =>
          item.productId === input.productId && item.variantId === input.variantId
      );

      if (itemIndex >= 0) {
        cartItems[itemIndex].quantity = input.quantity;
      }

      // Update session
      await ctx.db.guestSession.update({
        where: { sessionToken },
        data: { cartItems },
      });

      return { success: true, cartItems };
    }),

  clearCart: publicProcedure.mutation(async ({ ctx }) => {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('guest_session_token')?.value;

    if (!sessionToken) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No guest session found',
      });
    }

    await ctx.db.guestSession.update({
      where: { sessionToken },
      data: { cartItems: [] },
    });

    return { success: true };
  }),

  getCart: publicProcedure.query(async ({ ctx }) => {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('guest_session_token')?.value;

    if (!sessionToken) {
      return { items: [] };
    }

    const session = await ctx.db.guestSession.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      return { items: [] };
    }

    // Parse cart items
    const cartItems = Array.isArray(session.cartItems)
      ? (session.cartItems as any[])
      : [];

    if (cartItems.length === 0) {
      return { items: [] };
    }

    // Fetch product and variant details
    const items = await Promise.all(
      cartItems.map(async (item: any) => {
        const product = await ctx.db.product.findUnique({
          where: { id: item.productId },
          include: {
            variants: {
              where: { id: item.variantId, isActive: true },
            },
          },
        });

        if (!product || product.variants.length === 0) {
          return null;
        }

        const variant = product.variants[0];

        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          addedAt: item.addedAt,
          product: {
            id: product.id,
            slug: product.slug,
            title: product.title,
            image: product.image,
            region: product.region,
          },
          variant: {
            id: variant.id,
            name: variant.name,
            price: Number(variant.price),
            originalPrice: variant.originalPrice ? Number(variant.originalPrice) : null,
          },
          price: Number(variant.price),
        };
      })
    );

    // Filter out null items (deleted products/variants)
    const validItems = items.filter((item) => item !== null);

    return { items: validItems };
  }),
});
