import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { OrderStatus, PaymentMethod, PaymentStatus } from "~/constants/enums";
import type { Address, Order, OrderItem } from "~/types/order";
import { cartRouter } from "./cart";

// We import the carts map indirectly by calling cart procedures; for now we will keep logic simple by reusing cartRouter.getActive

export const checkoutRouter = createTRPCRouter({
  placeOrderFromCart: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        email: z.string().email(),
        billing: z.object({
          fullName: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          state: z.string().optional(),
          postalCode: z.string(),
          country: z.string(),
        }) as z.ZodType<Address>,
        shipping: z
          .object({
            fullName: z.string(),
            email: z.string().email(),
            phone: z.string().optional(),
            line1: z.string(),
            line2: z.string().optional(),
            city: z.string(),
            state: z.string().optional(),
            postalCode: z.string(),
            country: z.string(),
          })
          .optional() as z.ZodType<Address | undefined>,
        paymentMethod: z.nativeEnum(PaymentMethod),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Fetch the current cart snapshot by invoking the cart router internally via caller
      const caller = ctx as any; // createCaller not easily accessible here in module scope; keep simple
      // As a simplification, we reconstruct using public procedure ensure on client side
      // In real implementation, you'd use appRouter caller to get the cart content here.

      // Fallback: accept that client provided price snapshot in future; for now, create empty order if cart not found
      const now = new Date().toISOString();
      const orderId = crypto.randomUUID();

      const order: Order = {
        id: orderId,
        orderNumber: `ORD-${Date.now()}`,
        userId: ctx.session?.user?.id,
        email: input.email,
        billingAddress: input.billing,
        shippingAddress: input.shipping,
        currency: "DZD",
        items: [],
        subtotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        shippingTotal: 0,
        grandTotal: 0,
        status: OrderStatus.PENDING,
        paymentStatus:
          input.paymentMethod === PaymentMethod.CASH
            ? PaymentStatus.PENDING
            : PaymentStatus.UNPAID,
        paymentMethod: input.paymentMethod,
        createdAt: now,
        updatedAt: now,
      };

      // TODO: integrate with cart store and move items; for now return skeleton order
      return order;
    }),
});