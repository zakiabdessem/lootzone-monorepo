import type { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Platform, Region } from '~/constants/enums';
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { syncProductToAlgolia, removeProductFromAlgolia } from '~/lib/algolia-sync';

const productCategoryInclude = {
  categories: {
    select: {
      id: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
        },
      },
    },
  },
} as const;

type ProductCategoryWithCategory = {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string | null;
    parentId: string | null;
  };
};

const mapProductCategories = (categories: ProductCategoryWithCategory[]) =>
  categories.map(pc => ({
    id: pc.id,
    categoryId: pc.categoryId,
    category: pc.category,
  }));

async function getCategoryWithDescendants(
  categoryId: string,
  db: PrismaClient,
  visited: Set<string> = new Set()
): Promise<string[]> {
  if (visited.has(categoryId)) {
    return [];
  }

  visited.add(categoryId);

  const ids = [categoryId];

  const children = await db.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });

  for (const child of children) {
    const descendantIds = await getCategoryWithDescendants(child.id, db, visited);
    ids.push(...descendantIds);
  }

  return ids;
}

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
  categories: z.array(z.string()).min(1),
  isActive: z.boolean().default(true),
  showInRecentlyViewed: z.boolean().optional().default(false),
  showInRecommended: z.boolean().optional().default(false),
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
          ...productCategoryInclude,
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
        categories: mapProductCategories(p.categories as ProductCategoryWithCategory[]),
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
        ...productCategoryInclude,
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
      categories: mapProductCategories(product.categories as ProductCategoryWithCategory[]),
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
        const descendantCategoryIds = await getCategoryWithDescendants(input.categoryId, ctx.db);
        const uniqueCategoryIds = Array.from(new Set(descendantCategoryIds));
        where.categories = {
          some: {
            categoryId: {
              in: uniqueCategoryIds,
            },
          },
        };
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
          ...productCategoryInclude,
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
          categories: mapProductCategories(p.categories as ProductCategoryWithCategory[]),
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

  // Get products for "Recently Viewed" landing section
  getRecentlyViewed: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(16),
      })
    )
    .query(async ({ input, ctx }) => {
      const products = await ctx.db.product.findMany({
        where: {
          isActive: true,
          showInRecentlyViewed: true,
        },
        take: input.limit,
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
          ...productCategoryInclude,
        },
        orderBy: { createdAt: 'desc' },
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
        categories: mapProductCategories(p.categories as ProductCategoryWithCategory[]),
        variants: p.variants.map(v => ({
          id: v.id,
          name: v.name,
          price: Number(v.price),
          originalPrice: v.originalPrice ? Number(v.originalPrice) : Number(v.price),
        })),
      }));
    }),

  // Get products for "Recommended For You" landing section
  getRecommended: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(16),
      })
    )
    .query(async ({ input, ctx }) => {
      const products = await ctx.db.product.findMany({
        where: {
          isActive: true,
          showInRecommended: true,
        },
        take: input.limit,
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
          ...productCategoryInclude,
        },
        orderBy: { createdAt: 'desc' },
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
        categories: mapProductCategories(p.categories as ProductCategoryWithCategory[]),
        variants: p.variants.map(v => ({
          id: v.id,
          name: v.name,
          price: Number(v.price),
          originalPrice: v.originalPrice ? Number(v.originalPrice) : Number(v.price),
        })),
      }));
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
              ...productCategoryInclude,
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
        categories: mapProductCategories(p.categories as ProductCategoryWithCategory[]),
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
        ...productCategoryInclude,
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
      categories: mapProductCategories(product.categories as ProductCategoryWithCategory[]),
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
        categories: z.array(z.string()).optional(),
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

      if (input.categories?.length) {
        const descendantIdsSets = await Promise.all(
          input.categories.map(categoryId => getCategoryWithDescendants(categoryId, ctx.db))
        );
        const uniqueCategoryIds = Array.from(new Set(descendantIdsSets.flat()));
        where.categories = {
          some: {
            categoryId: {
              in: uniqueCategoryIds,
            },
          },
        };
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
            ...productCategoryInclude,
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

      const formattedProducts = products.map(product => ({
        ...product,
        categories: mapProductCategories(product.categories as ProductCategoryWithCategory[]),
      }));

      return {
        products: formattedProducts,
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
          ...productCategoryInclude,
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

      return {
        ...product,
        categories: mapProductCategories(product.categories as ProductCategoryWithCategory[]),
      };
    }),

  toggleRecentlyViewed: adminProcedure
    .input(z.object({ id: z.string(), showInRecentlyViewed: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const product = await ctx.db.product.update({
        where: { id: input.id },
        data: { showInRecentlyViewed: input.showInRecentlyViewed },
        include: {
          ...productCategoryInclude,
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

      return {
        ...product,
        categories: mapProductCategories(product.categories as ProductCategoryWithCategory[]),
      };
    }),

  toggleRecommended: adminProcedure
    .input(z.object({ id: z.string(), showInRecommended: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const product = await ctx.db.product.update({
        where: { id: input.id },
        data: { showInRecommended: input.showInRecommended },
        include: {
          ...productCategoryInclude,
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

      return {
        ...product,
        categories: mapProductCategories(product.categories as ProductCategoryWithCategory[]),
      };
    }),

  create: adminProcedure.input(createProductSchema).mutation(async ({ input, ctx }) => {
    const uniqueCategoryIds = Array.from(new Set(input.categories));

    const categories = await ctx.db.category.findMany({
      where: { id: { in: uniqueCategoryIds } },
      select: { id: true },
    });

    if (categories.length !== uniqueCategoryIds.length) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'One or more categories are invalid.',
      });
    }

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
        keyFeatures: input.keyFeatures,
        deliveryInfo: input.deliveryInfo,
        deliverySteps: input.deliverySteps,
        terms: input.terms,
        importantNotes: input.importantNotes,
        isActive: input.isActive,
        showInRecentlyViewed: input.showInRecentlyViewed || false,
        showInRecommended: input.showInRecommended || false,
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
      } as any,
      select: {
        id: true,
      },
    });

    await (ctx.db as any).productCategory.createMany({
      data: uniqueCategoryIds.map(categoryId => ({
        productId: product.id,
        categoryId,
      })),
      skipDuplicates: true,
    });

    const productWithRelations = await ctx.db.product.findUnique({
      where: { id: product.id },
      include: {
        ...productCategoryInclude,
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

    if (!productWithRelations) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Failed to load product after creation.',
      });
    }

    const categoriesWithData = (productWithRelations as any)
      .categories as ProductCategoryWithCategory[];

    const result = {
      ...(productWithRelations as any),
      categories: mapProductCategories(categoriesWithData),
      variants: (productWithRelations as any).variants.map((v: any) => ({
        ...v,
        price: Number(v.price),
        originalPrice: v.originalPrice ? Number(v.originalPrice) : Number(v.price),
      })),
    };

    // Auto-sync to Algolia
    await syncProductToAlgolia(productWithRelations);

    return result;
  }),

  update: adminProcedure.input(updateProductSchema).mutation(async ({ input, ctx }) => {
    const { id, variants, categories: categoryIds, ...updateData } = input;

    let uniqueCategoryIds: string[] = [];
    if (categoryIds) {
      uniqueCategoryIds = Array.from(new Set(categoryIds));
      const categories = await ctx.db.category.findMany({
        where: { id: { in: uniqueCategoryIds } },
        select: { id: true },
      });

      if (categories.length !== uniqueCategoryIds.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'One or more categories are invalid.',
        });
      }
    }

    // Start a transaction to ensure all updates succeed or fail together
    const result = await ctx.db.$transaction(async (tx) => {
      // Update the product
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          ...updateData,
        },
      });

      // Handle variants update if provided
      if (variants && variants.length > 0) {
        // Get existing variants
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
        });

        const existingVariantIds = new Set(existingVariants.map(v => v.id));
        const inputVariantIds = new Set(
          variants.filter(v => v.id).map(v => v.id!)
        );

        // Update existing variants and create new ones
        for (const variant of variants) {
          if (variant.id && existingVariantIds.has(variant.id)) {
            // Update existing variant
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                name: variant.name,
                price: variant.price,
                originalPrice: variant.originalPrice,
              },
            });
          } else {
            // Create new variant
            await tx.productVariant.create({
              data: {
                productId: id,
                name: variant.name,
                price: variant.price,
                originalPrice: variant.originalPrice,
                isActive: true,
                stock: 0,
                isInfiniteStock: true,
              },
            });
          }
        }

        // Delete variants that are no longer in the input (only if not referenced)
        const variantsToDelete = existingVariants
          .filter(v => !inputVariantIds.has(v.id))
          .map(v => v.id);

        if (variantsToDelete.length > 0) {
          try {
            await tx.productVariant.deleteMany({
              where: {
                id: { in: variantsToDelete },
                productId: id,
              },
            });
          } catch (error: any) {
            // If deletion fails due to foreign key constraint, just mark as inactive
            if (error.code === 'P2003' || error.message?.includes('foreign key constraint')) {
              await tx.productVariant.updateMany({
                where: {
                  id: { in: variantsToDelete },
                  productId: id,
                },
                data: {
                  isActive: false,
                },
              });
            } else {
              throw error;
            }
          }
        }
      }

      if (categoryIds) {
        const existingCategories = await (tx as any).productCategory.findMany({
          where: { productId: id },
          select: { categoryId: true },
        });
        const existingCategoryIdSet = new Set(
          (existingCategories as Array<{ categoryId: string }>).map(c => c.categoryId)
        );
        const targetCategoryIdSet = new Set(uniqueCategoryIds);

        const categoriesToRemove = Array.from(existingCategoryIdSet).filter(
          categoryId => !targetCategoryIdSet.has(categoryId)
        );

        const categoriesToAdd = uniqueCategoryIds.filter(
          categoryId => !existingCategoryIdSet.has(categoryId)
        );

        if (categoriesToRemove.length) {
          await (tx as any).productCategory.deleteMany({
            where: {
              productId: id,
              categoryId: {
                in: categoriesToRemove,
              },
            },
          });
        }

        if (categoriesToAdd.length) {
          await (tx as any).productCategory.createMany({
            data: categoriesToAdd.map(categoryId => ({
              productId: id,
              categoryId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Fetch and return the updated product with all relations
      const productWithRelations = await tx.product.findUnique({
        where: { id },
        include: {
          ...productCategoryInclude,
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

      if (!productWithRelations) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found after update.',
        });
      }

      const updatedCategories = (productWithRelations as any)
        .categories as ProductCategoryWithCategory[];

      return {
        ...(productWithRelations as any),
        categories: mapProductCategories(updatedCategories),
        variants: (productWithRelations as any).variants.map((v: any) => ({
          ...v,
          price: Number(v.price),
          originalPrice: v.originalPrice ? Number(v.originalPrice) : Number(v.price),
        })),
      };
    });

    // Auto-sync to Algolia after update
    const productWithRelations = await ctx.db.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: {
          where: { isActive: true },
        },
      } as any,
    });

    if (productWithRelations) {
      await syncProductToAlgolia(productWithRelations);
    }

    return result;
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

    // Remove from Algolia when product is deactivated
    await removeProductFromAlgolia(input.id);

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

      // Remove from Algolia when products are deactivated
      for (const id of ids) {
        await removeProductFromAlgolia(id);
      }

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

    // Re-sync to Algolia when product is restored
    const productWithRelations = await ctx.db.product.findUnique({
      where: { id: input.id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: {
          where: { isActive: true },
        },
      } as any,
    });

    if (productWithRelations) {
      await syncProductToAlgolia(productWithRelations);
    }

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

      // Re-sync to Algolia when products are restored
      const productsWithRelations = await ctx.db.product.findMany({
        where: { id: { in: ids } },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          variants: {
            where: { isActive: true },
          },
        } as any,
      });

      for (const product of productsWithRelations) {
        await syncProductToAlgolia(product);
      }

      return { success: true, count: result.count, ids };
    }),
});
