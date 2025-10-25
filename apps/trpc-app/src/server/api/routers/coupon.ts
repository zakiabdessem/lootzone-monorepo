import { z } from 'zod';
import { createTRPCRouter, adminProcedure, publicProcedure } from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { Decimal } from '@prisma/client/runtime/library';

// Rate limiting map: sessionToken/IP -> timestamp[]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

/**
 * Rate limit helper function
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(identifier) || [];
  
  // Remove old requests outside the window
  const recentRequests = requests.filter((time) => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  
  return true;
}

/**
 * Sanitize coupon code: trim, uppercase, alphanumeric only
 */
function sanitizeCouponCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Validate and calculate discount for a coupon
 */
async function validateAndCalculateDiscount(
  db: any,
  couponCode: string,
  subtotal: number,
  email?: string,
  ipAddress?: string
) {
  const sanitizedCode = sanitizeCouponCode(couponCode);
  
  // Find coupon
  const coupon = await db.coupon.findUnique({
    where: { code: sanitizedCode },
  });
  
  if (!coupon) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Invalid coupon code',
    });
  }
  
  // Check if active
  if (!coupon.isActive) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'This coupon is no longer active',
    });
  }
  
  // Check expiration
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'This coupon has expired',
    });
  }
  
  // Check usage limits
  if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'This coupon has reached its usage limit',
    });
  }
  
  // Check minimum order amount
  if (coupon.minOrderAmount) {
    const minAmount = Number(coupon.minOrderAmount);
    if (subtotal < minAmount) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Minimum order amount of ${minAmount} DA required to use this coupon`,
      });
    }
  }
  
  // Check single-use per customer (if email or IP provided)
  if (email || ipAddress) {
    const existingOrder = await db.order.findFirst({
      where: {
        couponId: coupon.id,
        OR: [
          email ? { checkoutDraft: { email } } : {},
          ipAddress ? { checkoutDraft: { ipAddress } } : {},
        ],
      },
    });
    
    if (existingOrder) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You have already used this coupon',
      });
    }
  }
  
  // Calculate discount
  let discountAmount = 0;
  const discountValue = Number(coupon.discountValue);
  
  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * discountValue) / 100;
  } else if (coupon.discountType === 'fixed') {
    discountAmount = discountValue;
  }
  
  // Ensure discount doesn't exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);
  
  return {
    coupon,
    discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimals
  };
}

export const couponRouter = createTRPCRouter({
  /**
   * PUBLIC: Validate a coupon code and return discount details
   */
  validateCoupon: publicProcedure
    .input(
      z.object({
        code: z.string().min(1, 'Coupon code is required'),
        subtotal: z.number().min(0),
        email: z.string().email().optional(),
        ipAddress: z.string().optional(),
        sessionToken: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limiting
      const identifier = input.sessionToken || input.ipAddress || input.email || 'anonymous';
      
      if (!checkRateLimit(identifier)) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many coupon validation attempts. Please try again later.',
        });
      }
      
      try {
        const result = await validateAndCalculateDiscount(
          ctx.db,
          input.code,
          input.subtotal,
          input.email,
          input.ipAddress
        );
        
        return {
          valid: true,
          code: result.coupon.code,
          discountType: result.coupon.discountType,
          discountValue: Number(result.coupon.discountValue),
          discountAmount: result.discountAmount,
          message: `Coupon applied! You saved ${result.discountAmount} DA`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to validate coupon',
        });
      }
    }),

  /**
   * ADMIN: Get all coupons with pagination and filters
   */
  getAll: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        sortBy: z.enum(['createdAt', 'currentUses', 'expiresAt']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, search, isActive, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      const where: any = {};
      
      if (search) {
        where.code = {
          contains: search.toUpperCase(),
          mode: 'insensitive',
        };
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const [coupons, total] = await Promise.all([
        ctx.db.coupon.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            _count: {
              select: { orders: true },
            },
          },
        }),
        ctx.db.coupon.count({ where }),
      ]);

      return {
        coupons: coupons.map((coupon) => ({
          ...coupon,
          discountValue: Number(coupon.discountValue),
          minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
          orderCount: coupon._count.orders,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  /**
   * ADMIN: Get coupon by ID
   */
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const coupon = await ctx.db.coupon.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: { orders: true },
          },
          orders: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              createdAt: true,
              totalAmount: true,
              discountAmount: true,
              checkoutDraft: {
                select: {
                  email: true,
                  fullName: true,
                },
              },
            },
          },
        },
      });

      if (!coupon) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Coupon not found',
        });
      }

      return {
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        orderCount: coupon._count.orders,
      };
    }),

  /**
   * ADMIN: Create new coupon
   */
  create: adminProcedure
    .input(
      z.object({
        code: z.string().min(3).max(20),
        discountType: z.enum(['percentage', 'fixed']),
        discountValue: z.number().positive(),
        minOrderAmount: z.number().nonnegative().optional(),
        maxUses: z.number().int().nonnegative().nullable().optional(),
        expiresAt: z.date().nullable().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const sanitizedCode = sanitizeCouponCode(input.code);

      // Validate discount value based on type
      if (input.discountType === 'percentage') {
        if (input.discountValue < 1 || input.discountValue > 100) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Percentage discount must be between 1 and 100',
          });
        }
      } else if (input.discountType === 'fixed') {
        if (input.discountValue > 100000) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Fixed discount amount is too high',
          });
        }
      }

      // Check if code already exists
      const existing = await ctx.db.coupon.findUnique({
        where: { code: sanitizedCode },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A coupon with this code already exists',
        });
      }

      const coupon = await ctx.db.coupon.create({
        data: {
          code: sanitizedCode,
          discountType: input.discountType,
          discountValue: new Decimal(input.discountValue),
          minOrderAmount: input.minOrderAmount ? new Decimal(input.minOrderAmount) : null,
          maxUses: input.maxUses ?? null,
          expiresAt: input.expiresAt ?? null,
          isActive: input.isActive,
        },
      });

      return {
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
      };
    }),

  /**
   * ADMIN: Update coupon
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        discountType: z.enum(['percentage', 'fixed']).optional(),
        discountValue: z.number().positive().optional(),
        minOrderAmount: z.number().nonnegative().nullable().optional(),
        maxUses: z.number().int().nonnegative().nullable().optional(),
        expiresAt: z.date().nullable().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      // Check if coupon exists
      const existing = await ctx.db.coupon.findUnique({
        where: { id },
        include: {
          _count: {
            select: { orders: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Coupon not found',
        });
      }

      // Validate discount value if provided
      if (input.discountValue !== undefined) {
        const discountType = input.discountType || existing.discountType;
        if (discountType === 'percentage') {
          if (input.discountValue < 1 || input.discountValue > 100) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Percentage discount must be between 1 and 100',
            });
          }
        } else if (discountType === 'fixed') {
          if (input.discountValue > 100000) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Fixed discount amount is too high',
            });
          }
        }
      }

      const data: any = {};
      if (input.discountType) data.discountType = input.discountType;
      if (input.discountValue !== undefined) data.discountValue = new Decimal(input.discountValue);
      if (input.minOrderAmount !== undefined) {
        data.minOrderAmount = input.minOrderAmount !== null ? new Decimal(input.minOrderAmount) : null;
      }
      if (input.maxUses !== undefined) data.maxUses = input.maxUses;
      if (input.expiresAt !== undefined) data.expiresAt = input.expiresAt;
      if (input.isActive !== undefined) data.isActive = input.isActive;

      const coupon = await ctx.db.coupon.update({
        where: { id },
        data,
      });

      return {
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
      };
    }),

  /**
   * ADMIN: Delete coupon (soft delete if used, hard delete otherwise)
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const coupon = await ctx.db.coupon.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: { orders: true },
          },
        },
      });

      if (!coupon) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Coupon not found',
        });
      }

      // If coupon has been used, soft delete (deactivate)
      if (coupon._count.orders > 0) {
        await ctx.db.coupon.update({
          where: { id: input.id },
          data: { isActive: false },
        });
        return { message: 'Coupon deactivated (has been used in orders)', softDeleted: true };
      }

      // Otherwise, hard delete
      await ctx.db.coupon.delete({
        where: { id: input.id },
      });

      return { message: 'Coupon deleted successfully', softDeleted: false };
    }),

  /**
   * ADMIN: Get usage statistics
   */
  getStats: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const coupon = await ctx.db.coupon.findUnique({
        where: { id: input.id },
        include: {
          orders: {
            select: {
              discountAmount: true,
              totalAmount: true,
              createdAt: true,
            },
          },
        },
      });

      if (!coupon) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Coupon not found',
        });
      }

      const totalDiscountGiven = coupon.orders.reduce(
        (sum, order) => sum + Number(order.discountAmount),
        0
      );

      const totalRevenue = coupon.orders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0
      );

      return {
        totalUses: coupon.orders.length,
        totalDiscountGiven,
        totalRevenue,
        averageDiscount: coupon.orders.length > 0 ? totalDiscountGiven / coupon.orders.length : 0,
      };
    }),
});

// Export the validation function for use in other routers
export { validateAndCalculateDiscount, sanitizeCouponCode };

