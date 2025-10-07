/**
 * Checkout Router
 * Handles multi-step checkout flow with payment integration
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { chargilyService } from '~/server/services/chargily.service';
import { PaymentMethod, PaymentStatus } from '~/constants/enums';

export const checkoutRouter = createTRPCRouter({
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Set token expiry (24 hours from now)
        const tokenExpiresAt = new Date();
        tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

        // Create checkout draft
        const draft = await ctx.db.checkoutDraft.create({
          data: {
            email: input.email,
            phone: input.phone,
            fullName: input.fullName,
            cartSnapshot: input.cartSnapshot,
            userId: ctx.session?.user?.id, // Optional if user is logged in
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
        };
      } catch (error) {
        console.error('[Checkout] Error saving draft:', error);
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

          // Update draft with Flexy receipt info
          await ctx.db.checkoutDraft.update({
            where: { id: draft.id },
            data: {
              flexyReceiptUrl: input.flexyData.receiptUrl,
              flexyPaymentTime: input.flexyData.paymentTime,
              paymentStatus: PaymentStatus.PENDING, // Admin will verify
            },
          });

          return {
            success: true,
            message: 'Flexy payment submitted for verification',
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
