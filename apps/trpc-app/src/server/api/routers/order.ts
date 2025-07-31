import { z } from "zod";
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
      // TODO: Get user's orders from database
      return {
        items: [],
        nextCursor: undefined,
      };
    }),

  // Get specific order
  getOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      // TODO: Get order by ID, ensure user owns it or is admin
      return {
        id: input.orderId,
        status: OrderStatus.PENDING,
        total: 0,
        items: [],
        createdAt: new Date().toISOString(),
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
        cursor: z.string().optional(),
        status: z.nativeEnum(OrderStatus).optional(),
        userId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // TODO: Get all orders with filters
      return {
        items: [],
        nextCursor: undefined,
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
      // TODO: Update order status in database
      return { success: true };
    }),
});
