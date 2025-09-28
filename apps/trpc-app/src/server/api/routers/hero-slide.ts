import { z } from 'zod';
import { adminProcedure, createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const heroSlideRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        product: {
          include: {
            variants: {
              where: { isActive: true },
              orderBy: { price: 'asc' },
              take: 1,
            },
          },
        },
      },
    });
  }),

  getAllForAdmin: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.heroSlide.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        product: {
          include: {
            variants: {
              where: { isActive: true },
              orderBy: { price: 'asc' },
              take: 1,
            },
          },
        },
      },
    });
  }),

  create: adminProcedure
    .input(
      z.object({
        label: z.string().min(1),
        productId: z.string(),
        displayOrder: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.heroSlide.create({
        data: input,
        include: {
          product: {
            include: {
              variants: {
                where: { isActive: true },
                orderBy: { price: 'asc' },
                take: 1,
              },
            },
          },
        },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        label: z.string().min(1),
        productId: z.string(),
        isActive: z.boolean(),
        displayOrder: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.db.heroSlide.update({
        where: { id },
        data,
        include: {
          product: {
            include: {
              variants: {
                where: { isActive: true },
                orderBy: { price: 'asc' },
                take: 1,
              },
            },
          },
        },
      });
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return await ctx.db.heroSlide.delete({
      where: { id: input.id },
    });
  }),
});
