import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { OrderStatus, PaymentMethod } from "~/constants/enums";

export const orderRouter = createTRPCRouter({
  // Get user's orders
  getUserOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        status: z.nativeEnum(OrderStatus).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const where: any = { userId };

      if (input.status) {
        where.status = input.status;
      }

      const orders = await ctx.db.order.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  image: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined = undefined;
      if (orders.length > input.limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: orders.map((order) => ({
          id: order.id,
          status: order.status,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          totalAmount: Number(order.totalAmount),
          currency: order.currency,
          items: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productTitle: item.product.title,
            productImage: item.product.image,
            variantId: item.variantId,
            variantName: item.variant.name,
            quantity: item.quantity,
            price: Number(item.price),
            totalPrice: Number(item.totalPrice),
          })),
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        })),
        nextCursor,
      };
    }),

  // Get specific order (for customers)
  getOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  image: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check authorization: user must own the order or be admin
      const isAdmin = ctx.session.user.role === "admin";
      const isOwner = order.userId === ctx.session.user.id;

      if (!isAdmin && !isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this order",
        });
      }

      return {
        id: order.id,
        userId: order.userId,
        user: order.user
          ? {
              id: order.user.id,
              firstName: order.user.firstName,
              lastName: order.user.lastName,
              email: order.user.email,
              phone: order.user.phone,
            }
          : null,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        totalAmount: Number(order.totalAmount),
        currency: order.currency,
        paymentId: order.paymentId,
        notes: isAdmin ? order.notes : null, // Only admins can see notes
        chargilyWebhookEvents: order.chargilyWebhookEvents,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productTitle: item.product.title,
          productImage: item.product.image,
          variantId: item.variantId,
          variantName: item.variant.name,
          quantity: item.quantity,
          price: Number(item.price),
          totalPrice: Number(item.totalPrice),
          deliveryInfo: item.deliveryInfo,
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      };
    }),

  // Admin: Get specific order (admin can view any order)
  adminGetOrder: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          checkoutDraft: {
            select: {
              id: true,
              email: true,
              phone: true,
              fullName: true,
              flexyReceiptUrl: true,
              flexyPaymentTime: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  image: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return {
        id: order.id,
        userId: order.userId,
        user: order.user
          ? {
              id: order.user.id,
              firstName: order.user.firstName,
              lastName: order.user.lastName,
              email: order.user.email,
              phone: order.user.phone,
            }
          : null,
        checkoutDraft: order.checkoutDraft
          ? {
              id: order.checkoutDraft.id,
              email: order.checkoutDraft.email,
              phone: order.checkoutDraft.phone,
              fullName: order.checkoutDraft.fullName,
              flexyReceiptUrl: order.checkoutDraft.flexyReceiptUrl,
              flexyPaymentTime: order.checkoutDraft.flexyPaymentTime,
            }
          : null,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        totalAmount: Number(order.totalAmount),
        currency: order.currency,
        paymentId: order.paymentId,
        notes: order.notes,
        chargilyWebhookEvents: order.chargilyWebhookEvents,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productTitle: item.product.title,
          productImage: item.product.image,
          variantId: item.variantId,
          variantName: item.variant.name,
          quantity: item.quantity,
          price: Number(item.price),
          totalPrice: Number(item.totalPrice),
          deliveryInfo: item.deliveryInfo,
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      };
    }),

  // Create new order
  createOrder: protectedProcedure
    .input(
      z.object({
        items: z
          .array(
            z.object({
              productId: z.string(),
              variantId: z.string(),
              quantity: z.number().min(1),
              price: z.number().positive(),
            })
          )
          .min(1),
        paymentMethod: z.nativeEnum(PaymentMethod),
        totalAmount: z.number().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Create order in database
      return {
        id: "new-order-id",
        status: OrderStatus.PENDING,
        ...input,
        userId: ctx.session.user.id,
        createdAt: new Date().toISOString(),
      };
    }),

  // Admin: Get all orders
  getAllOrders: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.nativeEnum(OrderStatus).optional(),
        userId: z.string().optional(),
        search: z.string().optional(), // Search by order ID or customer name/email
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: any = {};

      if (input.status) {
        where.status = input.status;
      }

      if (input.userId) {
        where.userId = input.userId;
      }

      if (input.search) {
        where.OR = [
          { id: { contains: input.search, mode: "insensitive" } },
          {
            user: {
              OR: [
                { firstName: { contains: input.search, mode: "insensitive" } },
                { lastName: { contains: input.search, mode: "insensitive" } },
                { email: { contains: input.search, mode: "insensitive" } },
              ],
            },
          },
        ];
      }

      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) {
          where.createdAt.gte = new Date(input.startDate);
        }
        if (input.endDate) {
          where.createdAt.lte = new Date(input.endDate);
        }
      }

      const [orders, totalCount] = await Promise.all([
        ctx.db.order.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    image: true,
                  },
                },
                variant: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        ctx.db.order.count({ where }),
      ]);

      return {
        orders: orders.map((order) => ({
          id: order.id,
          userId: order.userId,
          user: order.user
            ? {
                id: order.user.id,
                firstName: order.user.firstName,
                lastName: order.user.lastName,
                email: order.user.email,
                phone: order.user.phone,
              }
            : null,
          status: order.status,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          totalAmount: Number(order.totalAmount),
          currency: order.currency,
          paymentId: order.paymentId,
          notes: order.notes,
          chargilyWebhookEvents: order.chargilyWebhookEvents,
          items: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productTitle: item.product.title,
            productImage: item.product.image,
            variantId: item.variantId,
            variantName: item.variant.name,
            quantity: item.quantity,
            price: Number(item.price),
            totalPrice: Number(item.totalPrice),
          })),
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        })),
        totalCount,
      };
    }),

  // Admin: Update order status
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.nativeEnum(OrderStatus),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        select: { id: true, status: true },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: { status: input.status },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  image: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        id: updatedOrder.id,
        userId: updatedOrder.userId,
        user: updatedOrder.user
          ? {
              id: updatedOrder.user.id,
              firstName: updatedOrder.user.firstName,
              lastName: updatedOrder.user.lastName,
              email: updatedOrder.user.email,
              phone: updatedOrder.user.phone,
            }
          : null,
        status: updatedOrder.status,
        paymentMethod: updatedOrder.paymentMethod,
        paymentStatus: updatedOrder.paymentStatus,
        totalAmount: Number(updatedOrder.totalAmount),
        currency: updatedOrder.currency,
        paymentId: updatedOrder.paymentId,
        notes: updatedOrder.notes,
        chargilyWebhookEvents: updatedOrder.chargilyWebhookEvents,
        items: updatedOrder.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productTitle: item.product.title,
          productImage: item.product.image,
          variantId: item.variantId,
          variantName: item.variant.name,
          quantity: item.quantity,
          price: Number(item.price),
          totalPrice: Number(item.totalPrice),
        })),
        createdAt: updatedOrder.createdAt.toISOString(),
        updatedAt: updatedOrder.updatedAt.toISOString(),
      };
    }),

  // Admin: Update order notes
  updateOrderNotes: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        notes: z.string().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        select: { id: true },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: { notes: input.notes },
      });

      return {
        success: true,
        orderId: updatedOrder.id,
        notes: updatedOrder.notes,
      };
    }),

  // Admin: Approve Flexy payment
  approveFlexyPayment: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        include: {
          checkoutDraft: true,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      }

      if (order.paymentMethod !== 'flexy') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Order is not a Flexy payment',
        });
      }

      if (order.paymentStatus === 'paid') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment already approved',
        });
      }

      console.log('[Order] Approving Flexy payment for order:', order.id);

      // Update order status
      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: {
          paymentStatus: 'paid',
          status: 'processing', // Move to processing
          notes: input.adminNotes 
            ? `${order.notes || ''}\n\nAdmin approved: ${input.adminNotes}`
            : order.notes,
        },
      });

      // Update linked checkout draft
      if (order.checkoutDraftId) {
        await ctx.db.checkoutDraft.update({
          where: { id: order.checkoutDraftId },
          data: {
            paymentStatus: 'paid',
          },
        });
      }

      console.log('[Order] Flexy payment approved successfully');

      // TODO: Send confirmation email to customer
      // await emailService.sendPaymentApprovedEmail({
      //   customerEmail: order.checkoutDraft?.email,
      //   orderId: order.id,
      // });

      return { 
        success: true, 
        order: {
          id: updatedOrder.id,
          status: updatedOrder.status,
          paymentStatus: updatedOrder.paymentStatus,
        }
      };
    }),

  // Admin: Reject Flexy payment
  rejectFlexyPayment: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        reason: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        include: {
          checkoutDraft: true,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      }

      if (order.paymentMethod !== 'flexy') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Order is not a Flexy payment',
        });
      }

      if (order.paymentStatus === 'failed') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment already rejected',
        });
      }

      console.log('[Order] Rejecting Flexy payment for order:', order.id, 'Reason:', input.reason);

      // Update order status
      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: {
          paymentStatus: 'failed',
          status: 'cancelled',
          notes: `${order.notes || ''}\n\nPayment Rejected: ${input.reason}`,
        },
      });

      // Update linked checkout draft
      if (order.checkoutDraftId) {
        await ctx.db.checkoutDraft.update({
          where: { id: order.checkoutDraftId },
          data: {
            paymentStatus: 'failed',
          },
        });
      }

      console.log('[Order] Flexy payment rejected successfully');

      // TODO: Send rejection email to customer
      // await emailService.sendPaymentRejectedEmail({
      //   customerEmail: order.checkoutDraft?.email,
      //   orderId: order.id,
      //   reason: input.reason,
      // });

      return { 
        success: true, 
        order: {
          id: updatedOrder.id,
          status: updatedOrder.status,
          paymentStatus: updatedOrder.paymentStatus,
        }
      };
    }),
});
