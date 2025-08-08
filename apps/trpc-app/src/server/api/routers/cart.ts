import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import type { Cart, CartItem, CartItemInput } from "~/types/order";

const carts = new Map<string, Cart>();

function recalc(cart: Cart): Cart {
  const subtotal = cart.items.reduce((sum, i) => sum + i.total, 0);
  const discountTotal = 0;
  const taxTotal = 0;
  const shippingTotal = 0;
  const grandTotal = subtotal - discountTotal + taxTotal + shippingTotal;
  const updated: Cart = {
    ...cart,
    subtotal,
    discountTotal,
    taxTotal,
    shippingTotal,
    grandTotal,
    updatedAt: new Date().toISOString(),
  };
  return updated;
}

function ensureCart(cartId: string): Cart {
  const existing = carts.get(cartId);
  if (existing) return existing;
  const now = new Date().toISOString();
  const empty: Cart = {
    id: cartId,
    currency: "DZD",
    items: [],
    subtotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    shippingTotal: 0,
    grandTotal: 0,
    createdAt: now,
    updatedAt: now,
  };
  carts.set(cartId, empty);
  return empty;
}

export const cartRouter = createTRPCRouter({
  getActive: publicProcedure
    .input(z.object({ cartId: z.string(), userId: z.string().optional() }))
    .query(async ({ input }) => {
      const cart = ensureCart(input.cartId);
      return recalc(cart);
    }),

  addItem: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        item: z.object({
          productId: z.string(),
          variantId: z.string().optional(),
          title: z.string(),
          unitPrice: z.number().nonnegative(),
          quantity: z.number().int().positive(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const cart = ensureCart(input.cartId);
      const { item } = input;
      const id = crypto.randomUUID();
      const newItem: CartItem = {
        id,
        ...item,
        total: item.unitPrice * item.quantity,
      };
      const updated: Cart = { ...cart, items: [...cart.items, newItem] };
      carts.set(input.cartId, recalc(updated));
      return carts.get(input.cartId)!;
    }),

  updateItemQuantity: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        itemId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .mutation(async ({ input }) => {
      const cart = ensureCart(input.cartId);
      const items = cart.items.map((it) =>
        it.id === input.itemId
          ? { ...it, quantity: input.quantity, total: it.unitPrice * input.quantity }
          : it
      );
      const updated: Cart = { ...cart, items };
      carts.set(input.cartId, recalc(updated));
      return carts.get(input.cartId)!;
    }),

  removeItem: publicProcedure
    .input(z.object({ cartId: z.string(), itemId: z.string() }))
    .mutation(async ({ input }) => {
      const cart = ensureCart(input.cartId);
      const items = cart.items.filter((it) => it.id !== input.itemId);
      const updated: Cart = { ...cart, items };
      carts.set(input.cartId, recalc(updated));
      return carts.get(input.cartId)!;
    }),

  clear: publicProcedure
    .input(z.object({ cartId: z.string() }))
    .mutation(async ({ input }) => {
      const cart = ensureCart(input.cartId);
      const updated: Cart = { ...cart, items: [] };
      carts.set(input.cartId, recalc(updated));
      return { success: true } as const;
    }),
});