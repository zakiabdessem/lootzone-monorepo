import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Platform, Region } from '~/constants/enums';
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

// Zod schemas for input validation
const createProductSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  image: z.string().url(),
  gallery: z.array(z.string().url()).optional().default([]),
  platformIcon: z
    .string()
    .url()
    .optional()
    .nullable()
    .transform(val => val || null),
  platformName: z.preprocess(
    val => (val === '' ? null : val),
    z.nativeEnum(Platform).optional().nullable()
  ),
  region: z.nativeEnum(Region).default(Region.GLOBAL),
  category: z.string(), // Accept categoryId as string instead of enum
  isActive: z.boolean().default(true),
  variants: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        price: z.number().positive(),
        originalPrice: z.number().positive(),
        region: z.nativeEnum(Region).optional(),
      })
    )
    .min(1),
  keyFeatures: z.array(z.string()).min(1),
  deliveryInfo: z.string().min(1),
  deliverySteps: z.array(z.string()).min(1),
  terms: z.string().min(1),
  importantNotes: z.array(z.string()).min(1),
});

const updateProductSchema = createProductSchema.partial().extend({
  id: z.string(),
});

export const productRouter = createTRPCRouter({
  checkSlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input, ctx }) => {
    if (!input.slug) {
      return null;
    }

    const product = await ctx.db.product.findUnique({
      where: {
        slug: input.slug,
      },
      select: {
        id: true,
      },
    });

    return product === null;
  }),

  // Public procedures - anyone can access
  getByIds: publicProcedure
    .input(z.object({ ids: z.array(z.string()).min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      const products = await ctx.db.product.findMany({
        where: { id: { in: input.ids } },
        include: {
          variants: {
            select: {
              id: true,
              name: true,
              price: true,
              originalPrice: true,
            },
          },
        },
      });

      return products.map(p => ({
        id: p.id,
        slug: p.slug,
        image: p.image,
        platformShow: !!p.platformIcon,
        platformIcon: p.platformIcon,
        platformName: p.platformName as Platform | null,
        title: p.title,
        region: p.region as unknown as Region,
        variants: p.variants.map(v => ({
          id: v.id,
          name: v.name,
          price: Number(v.price),
          originalPrice: v.originalPrice ? Number(v.originalPrice) : Number(v.price),
        })),
      }));
    }),
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input, ctx }) => {
    const product = await ctx.db.product.findUnique({
      where: { slug: input.slug, isActive: true },
      include: {
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Product not found',
      });
    }

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      description: product.description,
      image: product.image,
      gallery: product.gallery,
      platformIcon: product.platformIcon,
      platformName: product.platformName as Platform,
      region: product.region as Region,
      category: product.category,
      variants: product.variants.map(v => ({
        id: v.id,
        name: v.name,
        price: Number(v.price),
        originalPrice: v.originalPrice ? Number(v.originalPrice) : Number(v.price),
        region: product.region as Region,
      })),
      keyFeatures: product.keyFeatures,
      deliveryInfo: product.deliveryInfo,
      deliverySteps: product.deliverySteps,
      terms: product.terms,
      importantNotes: product.importantNotes,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }),

  list: publicProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        platform: z.nativeEnum(Platform).optional(),
        region: z.nativeEnum(Region).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: any = {
        isActive: true,
      };

      if (input.categoryId) {
        where.categoryId = input.categoryId;
      }

      if (input.platform) {
        where.platformName = input.platform;
      }

      if (input.region) {
        where.region = input.region;
      }

      const products = await ctx.db.product.findMany({
        where,
        take: input.limit + 1, // Take one extra to know if there's a next page
        cursor: input.cursor ? { id: input.cursor } : undefined,
        include: {
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
              originalPrice: true,
            },
            orderBy: { price: 'asc' },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      let nextCursor: string | undefined = undefined;
      if (products.length > input.limit) {
        const nextItem = products.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: products.map(p => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          description: p.description,
          image: p.image,
          gallery: p.gallery,
          platformIcon: p.platformIcon,
          platformName: p.platformName as Platform,
          region: p.region as Region,
          category: p.category,
          variants: p.variants.map(v => ({
            id: v.id,
            name: v.name,
            price: Number(v.price),
            originalPrice: v.originalPrice ? Number(v.originalPrice) : Number(v.price),
            region: p.region as Region,
          })),
          keyFeatures: p.keyFeatures,
          deliveryInfo: p.deliveryInfo,
          deliverySteps: p.deliverySteps,
          terms: p.terms,
          importantNotes: p.importantNotes,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        })),
        nextCursor,
      };
    }),

  // Protected procedures - requires authentication
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const favorites = await ctx.db.userFavorite.findMany({
      where: { userId },
      select: { productId: true },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map(f => f.productId);
  }),

  getFavoritesDetailed: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const favorites = await ctx.db.userFavorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            variants: {
              select: { id: true, name: true, price: true, originalPrice: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map(f => {
      const p = f.product;
      return {
        id: p.id,
        slug: p.slug,
        image: p.image,
        platformShow: !!p.platformIcon,
        platformIcon: p.platformIcon,
        platformName: p.platformName as Platform | null,
        title: p.title,
        region: p.region as unknown as Region,
        variants: p.variants.map(v => ({
          id: v.id,
          name: v.name,
          price: Number(v.price),
          originalPrice: v.originalPrice ? Number(v.originalPrice) : Number(v.price),
        })),
      };
    });
  }),

  addFavorite: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.db.userFavorite.upsert({
        where: { userId_productId: { userId, productId: input.productId } },
        create: { userId, productId: input.productId },
        update: {},
      });
      return { success: true };
    }),

  removeFavorite: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.db.userFavorite.deleteMany({
        where: { userId, productId: input.productId },
      });
      return { success: true };
    }),

  mergeGuestWishlist: protectedProcedure
    .input(z.object({ productIds: z.array(z.string()).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.db.userFavorite.createMany({
        data: input.productIds.map(productId => ({ userId, productId })),
        skipDuplicates: true,
      });
      return { success: true };
    }),

  // Admin-only procedures
  adminGetById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const product = await ctx.db.product.findUnique({
      where: { id: input.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            isActive: true,
            stock: true,
            isInfiniteStock: true,
          },
        },
      },
    });

    if (!product) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Product not found',
      });
    }

    return {
      ...product,
      variants: product.variants.map(v => ({
        ...v,
        price: Number(v.price),
        originalPrice: v.originalPrice ? Number(v.originalPrice) : Number(v.price),
      })),
    };
  }),

  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: any = {};

      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      if (input.category) {
        where.categoryId = input.category;
      }

      if (input.isActive !== undefined) {
        where.isActive = input.isActive;
      }

      const [products, totalCount] = await Promise.all([
        ctx.db.product.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            variants: {
              select: {
                id: true,
                name: true,
                price: true,
                originalPrice: true,
                isActive: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        ctx.db.product.count({ where }),
      ]);

      return {
        products,
        totalCount,
      };
    }),

  toggleActive: adminProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const product = await ctx.db.product.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          variants: {
            select: {
              id: true,
              name: true,
              price: true,
              originalPrice: true,
              isActive: true,
            },
          },
        },
      });

      return product;
    }),

  create: adminProcedure.input(createProductSchema).mutation(async ({ input, ctx }) => {
    console.log('Creating product with input:', input);

    // Validate that the category exists
    const categoryExists = await ctx.db.category.findUnique({
      where: { id: input.category },
    });

    if (!categoryExists) {
      throw new Error('Category not found');
    }

    // Create the product
    const product = await ctx.db.product.create({
      data: {
        title: input.title,
        description: input.description,
        slug: input.slug,
        image: input.image,
        gallery: input.gallery || [],
        platformIcon: input.platformIcon || null,
        platformName: input.platformName || null,
        region: input.region,
        categoryId: input.category,
        keyFeatures: input.keyFeatures,
        deliveryInfo: input.deliveryInfo,
        deliverySteps: input.deliverySteps,
        terms: input.terms,
        importantNotes: input.importantNotes,
        isActive: input.isActive,
        variants: {
          create: input.variants.map(variant => ({
            name: variant.name,
            price: variant.price,
            originalPrice: variant.originalPrice,
            isActive: true,
            stock: 0,
            isInfiniteStock: true,
          })),
        },
      },
      include: {
        variants: true,
        category: true,
      },
    });

    return product;
  }),

  update: adminProcedure.input(updateProductSchema).mutation(async ({ input, ctx }) => {
    const { id, variants, category, ...updateData } = input;

    // Validate that the category exists if provided
    if (category) {
      const categoryExists = await ctx.db.category.findUnique({
        where: { id: category },
      });

      if (!categoryExists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        });
      }
    }

    // Update the product
    const updatedProduct = await ctx.db.product.update({
      where: { id },
      data: {
        ...updateData,
        ...(category && { categoryId: category }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            isActive: true,
            stock: true,
            isInfiniteStock: true,
          },
        },
      },
    });

    // Handle variants update if provided
    if (variants && variants.length > 0) {
      // Delete existing variants and create new ones
      await ctx.db.productVariant.deleteMany({
        where: { productId: id },
      });

      await ctx.db.productVariant.createMany({
        data: variants.map(variant => ({
          productId: id,
          name: variant.name,
          price: variant.price,
          originalPrice: variant.originalPrice,
          isActive: true,
          stock: 0,
          isInfiniteStock: true,
        })),
      });

      // Fetch updated product with new variants
      const productWithNewVariants = await ctx.db.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          variants: {
            select: {
              id: true,
              name: true,
              price: true,
              originalPrice: true,
              isActive: true,
              stock: true,
              isInfiniteStock: true,
            },
          },
        },
      });

      return productWithNewVariants;
    }

    return updatedProduct;
  }),

  // Soft delete - sets isActive to false instead of removing from DB
  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const product = await ctx.db.product.findUnique({
      where: { id: input.id },
      select: { id: true, isActive: true },
    });

    if (!product) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Product not found',
      });
    }

    // Soft delete by setting isActive to false
    await ctx.db.product.update({
      where: { id: input.id },
      data: { isActive: false },
    });

    return { success: true, id: input.id };
  }),

  // Bulk soft delete - sets isActive to false for multiple products
  bulkDelete: adminProcedure
    .input(z.object({ ids: z.array(z.string()).min(1).max(100) }))
    .mutation(async ({ input, ctx }) => {
      const { ids } = input;

      // Check if all products exist
      const products = await ctx.db.product.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      });

      if (products.length !== ids.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Some products not found',
        });
      }

      // Soft delete by setting isActive to false
      const result = await ctx.db.product.updateMany({
        where: { id: { in: ids } },
        data: { isActive: false },
      });

      return { success: true, count: result.count, ids };
    }),

  // Restore soft-deleted product (sets isActive back to true)
  restore: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const product = await ctx.db.product.findUnique({
      where: { id: input.id },
      select: { id: true, isActive: true },
    });

    if (!product) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Product not found',
      });
    }

    // Restore by setting isActive to true
    await ctx.db.product.update({
      where: { id: input.id },
      data: { isActive: true },
    });

    return { success: true, id: input.id };
  }),

  // Bulk restore
  bulkRestore: adminProcedure
    .input(z.object({ ids: z.array(z.string()).min(1).max(100) }))
    .mutation(async ({ input, ctx }) => {
      const { ids } = input;

      const result = await ctx.db.product.updateMany({
        where: { id: { in: ids } },
        data: { isActive: true },
      });

      return { success: true, count: result.count, ids };
    }),
});
