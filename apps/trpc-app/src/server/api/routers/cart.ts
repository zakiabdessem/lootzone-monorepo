import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const CART_COOKIE = "lz_guest_session";

async function getOrCreateGuestSession(ctx: any) {
  const jar = await cookies();
  let token = jar.get(CART_COOKIE)?.value;
  let session = token
    ? await ctx.db.guestSession.findUnique({ where: { token } })
    : null;
  if (!session) {
    token = randomUUID();
    session = await ctx.db.guestSession.create({ data: { token } });
    jar.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  return session;
}

export const cartRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const session = await getOrCreateGuestSession(ctx);

    // If user is authed and guest session unlinked, link for continuity
    if (ctx.session?.user && !session.userId) {
      await ctx.db.guestSession.update({
        where: { id: session.id },
        data: { userId: ctx.session.user.id },
      });
    }

    const items = await ctx.db.cartItem.findMany({
      where: { sessionId: session.id },
      include: {
        product: { select: { id: true, title: true, slug: true, image: true } },
        variant: { select: { id: true, name: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const subtotal = items.reduce((acc, it) => acc + Number(it.totalPrice), 0);

    return {
      items: items.map((it) => ({
        id: it.id,
        productId: it.productId,
        variantId: it.variantId,
        title: it.product.title,
        slug: it.product.slug,
        image: it.product.image,
        variantName: it.variant.name,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice),
        lineTotal: Number(it.totalPrice),
      })),
      itemCount: items.reduce((acc, it) => acc + it.quantity, 0),
      subtotal,
      currency: "DZD",
    };
  }),

  addItem: publicProcedure
    .input(z.object({ productId: z.string(), variantId: z.string(), quantity: z.number().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const session = await getOrCreateGuestSession(ctx);

      const variant = await ctx.db.productVariant.findUnique({
        where: { id: input.variantId },
        select: { id: true, price: true, productId: true },
      });
      if (!variant || variant.productId !== input.productId) {
        throw new Error("Invalid product/variant");
      }

      const unitPrice = Number(variant.price);
      const existing = await ctx.db.cartItem.findUnique({
        where: { sessionId_variantId: { sessionId: session.id, variantId: input.variantId } },
      });

      if (existing) {
        const quantity = existing.quantity + input.quantity;
        const totalPrice = Number((unitPrice * quantity).toFixed(2));
        await ctx.db.cartItem.update({
          where: { id: existing.id },
          data: { quantity, unitPrice, totalPrice },
        });
      } else {
        const totalPrice = Number((unitPrice * input.quantity).toFixed(2));
        await ctx.db.cartItem.create({
          data: {
            sessionId: session.id,
            productId: input.productId,
            variantId: input.variantId,
            quantity: input.quantity,
            unitPrice,
            totalPrice,
          },
        });
      }

      return { success: true };
    }),

  updateQuantity: publicProcedure
    .input(z.object({ variantId: z.string(), quantity: z.number().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const session = await getOrCreateGuestSession(ctx);
      const item = await ctx.db.cartItem.findUnique({
        where: { sessionId_variantId: { sessionId: session.id, variantId: input.variantId } },
        select: { id: true, unitPrice: true },
      });
      if (!item) throw new Error("Item not found");
      const totalPrice = Number((Number(item.unitPrice) * input.quantity).toFixed(2));
      await ctx.db.cartItem.update({
        where: { id: item.id },
        data: { quantity: input.quantity, totalPrice },
      });
      return { success: true };
    }),

  removeItem: publicProcedure
    .input(z.object({ variantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getOrCreateGuestSession(ctx);
      await ctx.db.cartItem.deleteMany({
        where: { sessionId: session.id, variantId: input.variantId },
      });
      return { success: true };
    }),

  clear: publicProcedure.mutation(async ({ ctx }) => {
    const session = await getOrCreateGuestSession(ctx);
    await ctx.db.cartItem.deleteMany({ where: { sessionId: session.id } });
    return { success: true };
  }),
});