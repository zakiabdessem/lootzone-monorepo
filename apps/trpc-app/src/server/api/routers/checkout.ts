/**
 * Checkout Router
 * Handles multi-step checkout flow with payment integration
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { chargilyService } from '~/server/services/chargily.service';
import { PaymentMethod, PaymentStatus } from '~/constants/enums';
import { validateAndCalculateDiscount, sanitizeCouponCode } from './coupon';
import { Decimal } from '@prisma/client/runtime/library';

export const checkoutRouter = createTRPCRouter({
  /**
   * Get previous customer info for autofill
   * Looks up by guest session token or IP address
   */
  getPreviousCustomerInfo: publicProcedure
    .input(
      z.object({
        guestSessionToken: z.string().optional(),
        ipAddress: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // First try to find by guest session token
        if (input.guestSessionToken) {
          const draftBySession = await ctx.db.checkoutDraft.findFirst({
            where: {
              guestSessionToken: input.guestSessionToken,
              email: { not: '' }, // Ensure it has customer info
            },
            orderBy: { createdAt: 'desc' },
            select: {
              email: true,
              phone: true,
              fullName: true,
            },
          });

          if (draftBySession) {
            console.log('[Checkout] Found previous customer info by session token');
            return draftBySession;
          }
        }

        // Fallback: Try to find by IP address (if session expired)
        if (input.ipAddress) {
          const draftByIp = await ctx.db.checkoutDraft.findFirst({
            where: {
              ipAddress: input.ipAddress,
              email: { not: '' },
            },
            orderBy: { createdAt: 'desc' },
            select: {
              email: true,
              phone: true,
              fullName: true,
            },
          });

          if (draftByIp) {
            console.log('[Checkout] Found previous customer info by IP address');
            return draftByIp;
          }
        }

        // No previous info found
        return null;
      } catch (error) {
        console.error('[Checkout] Error fetching previous customer info:', error);
        return null; // Don't throw error, just return null for better UX
      }
    }),

  /**
   * Step 1: Save checkout draft with user info and cart snapshot
   */
  saveDraft: publicProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email address'),
        phone: z.string().min(10, 'Phone must be at least 10 digits'),
        fullName: z.string().min(3, 'Full name must be at least 3 characters'),
        cartSnapshot: z.object({
          items: z.array(
            z.object({
              productId: z.string(),
              variantId: z.string(),
              quantity: z.number().min(1),
              price: z.number().positive(),
              title: z.string().optional(),
            })
          ).min(1, 'Cart must have at least one item'),
          subtotal: z.number().positive(),
          currency: z.string().default('DZD'),
        }),
        couponCode: z.string().optional(),
        guestSessionToken: z.string().optional(),
        ipAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Set token expiry (24 hours from now)
        const tokenExpiresAt = new Date();
        tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

        let couponData: { code?: string; discountAmount?: Decimal; cartSnapshot: any } = {
          cartSnapshot: input.cartSnapshot,
        };

        // Validate and apply coupon if provided
        if (input.couponCode) {
          try {
            const result = await validateAndCalculateDiscount(
              ctx.db,
              input.couponCode,
              input.cartSnapshot.subtotal,
              input.email,
              input.ipAddress
            );

            couponData.code = result.coupon.code;
            couponData.discountAmount = new Decimal(result.discountAmount);
            
            // Add discount info to cart snapshot
            couponData.cartSnapshot = {
              ...input.cartSnapshot,
              discount: {
                code: result.coupon.code,
                type: result.coupon.discountType,
                value: Number(result.coupon.discountValue),
                amount: result.discountAmount,
              },
            };

            console.log('[Checkout] Coupon applied:', result.coupon.code, 'Discount:', result.discountAmount);
          } catch (error) {
            // Log but don't fail the draft creation
            console.warn('[Checkout] Coupon validation failed:', error);
            throw error; // Re-throw to inform user
          }
        }

        // Create checkout draft
        const draft = await ctx.db.checkoutDraft.create({
          data: {
            email: input.email,
            phone: input.phone,
            fullName: input.fullName,
            cartSnapshot: couponData.cartSnapshot,
            couponCode: couponData.code,
            discountAmount: couponData.discountAmount,
            userId: ctx.session?.user?.id, // Optional if user is logged in
            guestSessionToken: input.guestSessionToken,
            ipAddress: input.ipAddress,
            tokenExpiresAt,
            paymentStatus: PaymentStatus.DRAFT,
          },
        });

        console.log('[Checkout] Draft created:', draft.id);

        // TODO: Send email with continue link
        // await emailService.sendCheckoutDraftEmail(draft);

        return {
          draftId: draft.id,
          continueToken: draft.continueToken,
          expiresAt: draft.tokenExpiresAt.toISOString(),
          discountAmount: couponData.discountAmount ? Number(couponData.discountAmount) : undefined,
        };
      } catch (error) {
        console.error('[Checkout] Error saving draft:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save checkout draft',
        });
      }
    }),

  /**
   * Get draft by token (for continue payment flow)
   */
  getDraft: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const draft = await ctx.db.checkoutDraft.findUnique({
        where: { continueToken: input.token },
      });

      if (!draft) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checkout draft not found',
        });
      }

      if (draft.tokenExpiresAt < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Checkout link has expired',
        });
      }

      return draft;
    }),

  /**
   * Get draft by ID (for current session)
   */
  getDraftById: publicProcedure
    .input(
      z.object({
        draftId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const draft = await ctx.db.checkoutDraft.findUnique({
        where: { id: input.draftId },
      });

      if (!draft) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checkout draft not found',
        });
      }

      return draft;
    }),

  /**
   * Update payment method selection
   */
  updatePaymentMethod: publicProcedure
    .input(
      z.object({
        draftId: z.string(),
        paymentMethod: z.enum(['flexy', 'edahabia', 'paypal', 'redotpay']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const draft = await ctx.db.checkoutDraft.update({
        where: { id: input.draftId },
        data: { paymentMethod: input.paymentMethod },
      });

      return { success: true, draft };
    }),

  /**
   * Step 3: Create payment based on selected method
   */
  createPayment: publicProcedure
    .input(
      z.object({
        draftId: z.string(),
        // Flexy-specific fields
        flexyData: z
          .object({
            receiptUrl: z.string().url(),
            paymentTime: z.string(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Get draft
        const draft = await ctx.db.checkoutDraft.findUnique({
          where: { id: input.draftId },
        });

        if (!draft) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Checkout draft not found',
          });
        }

        if (!draft.paymentMethod) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Payment method not selected',
          });
        }

        // Handle different payment methods
        if (draft.paymentMethod === PaymentMethod.EDAHABIA_CHARGILY) {
          console.log('[Checkout] Creating Chargily payment for draft:', draft.id);

          // Create Chargily checkout
          const chargilyResult = await chargilyService.createCheckout({
            id: draft.id,
            email: draft.email,
            phone: draft.phone,
            fullName: draft.fullName,
            cartSnapshot: draft.cartSnapshot as any,
          });

          // Update draft with Chargily details
          await ctx.db.checkoutDraft.update({
            where: { id: draft.id },
            data: {
              chargilyCustomerId: chargilyResult.customerId,
              chargilyProductId: chargilyResult.productId,
              chargilyPriceId: chargilyResult.priceId,
              chargilyCheckoutId: chargilyResult.checkoutId,
              chargilyPaymentUrl: chargilyResult.paymentUrl,
              paymentStatus: PaymentStatus.PENDING,
            },
          });

          return {
            success: true,
            paymentUrl: chargilyResult.paymentUrl,
            checkoutId: chargilyResult.checkoutId,
          };
        }

        if (draft.paymentMethod === PaymentMethod.FLEXY) {
          console.log('[Checkout] Processing Flexy payment for draft:', draft.id);

          if (!input.flexyData) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Flexy payment data is required',
            });
          }

          // Get cart snapshot
          const cartSnapshot = draft.cartSnapshot as any;
          const subtotal = cartSnapshot.subtotal || 0;
          const subtotalBeforeDiscount = subtotal;
          
          // Re-validate and calculate coupon discount (security: never trust client)
          let discountAmount = 0;
          let couponId: string | undefined;
          let couponCode: string | undefined;

          if (draft.couponCode) {
            try {
              const result = await validateAndCalculateDiscount(
                ctx.db,
                draft.couponCode,
                subtotal,
                draft.email,
                draft.ipAddress || undefined
              );
              
              discountAmount = result.discountAmount;
              couponId = result.coupon.id;
              couponCode = result.coupon.code;
              
              console.log('[Checkout] Coupon re-validated:', couponCode, 'Discount:', discountAmount);
            } catch (error) {
              console.error('[Checkout] Coupon validation failed during payment:', error);
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Coupon is no longer valid. Please try again without the coupon.',
              });
            }
          }

          // Calculate total: apply discount first, then add Flexy fee on discounted amount
          const discountedSubtotal = subtotal - discountAmount;
          const flexyFee = discountedSubtotal * 0.2; // 20% fee on discounted amount
          const totalAmount = discountedSubtotal + flexyFee;

          console.log('[Checkout] Flexy payment calculation - Original:', subtotal, 'Discount:', discountAmount, 'Discounted:', discountedSubtotal, 'Fee:', flexyFee, 'Total:', totalAmount);

          // Update draft with Flexy receipt info first
          await ctx.db.checkoutDraft.update({
            where: { id: draft.id },
            data: {
              flexyReceiptUrl: input.flexyData.receiptUrl,
              flexyPaymentTime: input.flexyData.paymentTime,
              paymentStatus: PaymentStatus.PENDING, // Awaiting admin verification
            },
          });

          // Create order immediately (status pending, awaiting admin verification)
          const order = await ctx.db.order.create({
            data: {
              userId: draft.userId || null, // null for guest checkout
              status: 'pending', // Will be updated after admin verification
              paymentMethod: 'flexy',
              paymentStatus: 'pending', // Awaiting admin verification
              totalAmount: totalAmount,
              currency: cartSnapshot.currency || 'DZD',
              checkoutDraftId: draft.id, // Link order to draft (correct relation direction)
              couponId: couponId,
              couponCode: couponCode,
              discountAmount: new Decimal(discountAmount),
              subtotalBeforeDiscount: discountAmount > 0 ? new Decimal(subtotalBeforeDiscount) : null,
              items: {
                create: cartSnapshot.items.map((item: any) => ({
                  productId: item.productId,
                  variantId: item.variantId,
                  quantity: item.quantity,
                  price: item.price,
                  totalPrice: item.price * item.quantity,
                })),
              },
              chargilyWebhookEvents: [], // Empty for Flexy
              notes: `Flexy Payment - Was made at ${input.flexyData.paymentTime}${couponCode ? ` - Coupon: ${couponCode}` : ''}`,
            },
            include: {
              items: {
                include: {
                  product: true,
                  variant: true,
                },
              },
            },
          });

          // Atomically increment coupon usage if coupon was used
          if (couponId) {
            await ctx.db.coupon.update({
              where: { id: couponId },
              data: { currentUses: { increment: 1 } },
            });
            console.log('[Checkout] Coupon usage incremented:', couponCode);
          }

          console.log('[Checkout] Flexy payment submitted successfully. Order ID:', order.id);

          // Send Telegram notification asynchronously (non-blocking)
          void (async () => {
            try {
              const { telegramService } = await import('~/server/services/telegram.service');
              await telegramService.sendOrderNotification({
                orderId: order.id,
                orderStatus: order.status,
                customerName: draft.fullName,
                customerEmail: draft.email,
                customerPhone: draft.phone,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                items: order.items.map(item => ({
                  product: { title: item.product.title },
                  variant: { sku: item.variant.id, title: item.variant.name },
                  quantity: item.quantity,
                  price: Number(item.price),
                  totalPrice: Number(item.totalPrice),
                })),
                subtotal: subtotalBeforeDiscount,
                discount: discountAmount > 0 ? { code: couponCode!, amount: discountAmount } : undefined,
                fees: flexyFee,
                totalAmount: Number(order.totalAmount),
                currency: order.currency,
                createdAt: order.createdAt,
                notes: order.notes || undefined,
                flexyReceiptUrl: input.flexyData.receiptUrl,
                flexyPaymentTime: input.flexyData.paymentTime,
              });
            } catch (error) {
              console.error('[Checkout] Failed to send Telegram notification:', error);
            }
          })();

          console.log('[Checkout] Flexy payment submitted successfully. Order ID:', order.id);

          return {
            success: true,
            orderId: order.id,
            message: 'Flexy payment submitted for verification. You will receive an email once verified.',
          };
        }

        // TODO: Handle other payment methods (PayPal, RedotPay)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Payment method ${draft.paymentMethod} not yet implemented`,
        });
      } catch (error) {
        console.error('[Checkout] Error creating payment:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment',
        });
      }
    }),

  /**
   * Get payment status
   */
  getPaymentStatus: publicProcedure
    .input(
      z.object({
        draftId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const draft = await ctx.db.checkoutDraft.findUnique({
        where: { id: input.draftId },
        include: {
          order: true,
        },
      });

      if (!draft) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payment not found',
        });
      }

      return {
        status: draft.paymentStatus,
        orderId: draft.orderId,
        order: draft.order,
      };
    }),

  /**
   * Admin: Get all checkout drafts
   */
  getAllDrafts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // TODO: Add admin check
      const drafts = await ctx.db.checkoutDraft.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: input.status ? { paymentStatus: input.status } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      let nextCursor: string | undefined = undefined;
      if (drafts.length > input.limit) {
        const nextItem = drafts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: drafts,
        nextCursor,
      };
    }),
});
