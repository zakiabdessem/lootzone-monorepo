import { z } from "zod";
import { Platform, ProductCategory, Region } from "~/constants/enums";
import {
    adminProcedure,
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "../trpc";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

const GUEST_COOKIE = "lz_guest_session";

async function getOrCreateGuestSession(ctx: any) {
  const jar = await cookies();
  let token = jar.get(GUEST_COOKIE)?.value;
  let session = token
    ? await ctx.db.guestSession.findUnique({ where: { token } })
    : null;
  if (!session) {
    token = randomUUID();
    session = await ctx.db.guestSession.create({ data: { token } });
    jar.set(GUEST_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  // Link to user when authenticated
  if (ctx.session?.user && !session.userId) {
    session = await ctx.db.guestSession.update({
      where: { id: session.id },
      data: { userId: ctx.session.user.id },
    });
  }
  return session;
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
  platformIcon: z.string().url().optional(),
  platformName: z.nativeEnum(Platform).optional(),
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
  checkSlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
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

      return products.map((p) => ({
        id: p.id,
        slug: p.slug,
        image: p.image,
        platformShow: !!p.platformIcon,
        platformIcon: p.platformIcon,
        platformName: p.platformName,
        title: p.title,
        region: p.region as unknown as Region,
        variants: p.variants.map((v) => ({
          id: v.id,
          name: v.name,
          price: Number(v.price),
          originalPrice: v.originalPrice ? Number(v.originalPrice) : Number(v.price),
        })),
      }));
    }),
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      // TODO: Replace with actual Prisma query
      return {
        id: "1",
        slug: input.slug,
        title: "Sample Product",
        description: "Sample description",
        image: "https://example.com/image.jpg",
        gallery: ["https://example.com/gallery1.jpg"],
        platformIcon: "steam-icon",
        platformName: Platform.STEAM,
        region: Region.GLOBAL,
        category: ProductCategory.PRODUCT,
        variants: [
          {
            id: "variant-1",
            name: "Standard Edition",
            price: 29.99,
            originalPrice: 39.99,
            region: Region.GLOBAL,
          },
        ],
        keyFeatures: ["Feature 1", "Feature 2"],
        deliveryInfo: "Instant delivery",
        deliverySteps: ["Step 1", "Step 2"],
        terms: "Terms and conditions",
        importantNotes: ["Note 1", "Note 2"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }),

  // Guest wishlist (server-side via cookie session)
  getGuestFavorites: publicProcedure.query(async ({ ctx }) => {
    const session = await getOrCreateGuestSession(ctx);
    const favs = await ctx.db.guestFavorite.findMany({
      where: { sessionId: session.id },
      select: { productId: true },
      orderBy: { createdAt: "desc" },
    });
    return favs.map((f) => f.productId);
  }),

  addGuestFavorite: publicProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getOrCreateGuestSession(ctx);
      await ctx.db.guestFavorite.upsert({
        where: { sessionId_productId: { sessionId: session.id, productId: input.productId } },
        create: { sessionId: session.id, productId: input.productId },
        update: {},
      });
      return { success: true };
    }),

  removeGuestFavorite: publicProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getOrCreateGuestSession(ctx);
      await ctx.db.guestFavorite.deleteMany({
        where: { sessionId: session.id, productId: input.productId },
      });
      return { success: true };
    }),

  list: publicProcedure
    .input(
      z.object({
        category: z.nativeEnum(ProductCategory).optional(),
        platform: z.nativeEnum(Platform).optional(),
        region: z.nativeEnum(Region).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // TODO: Replace with actual Prisma query with pagination
      return {
        items: [
          {
            id: "1",
            slug: "sample-product-1",
            title: "Sample Product 1",
            description: "Sample description 1",
            image: "https://example.com/image1.jpg",
            gallery: ["https://example.com/gallery1.jpg"],
            platformIcon: "steam-icon",
            platformName: Platform.STEAM,
            region: Region.GLOBAL,
            category: ProductCategory.PRODUCT,
            variants: [
              {
                id: "variant-1",
                name: "Standard Edition",
                price: 29.99,
                originalPrice: 39.99,
                region: Region.GLOBAL,
              },
            ],
            keyFeatures: ["Feature 1", "Feature 2"],
            deliveryInfo: "Instant delivery",
            deliverySteps: ["Step 1", "Step 2"],
            terms: "Terms and conditions",
            importantNotes: ["Note 1", "Note 2"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        nextCursor: undefined,
      };
    }),

  // Protected procedures - requires authentication
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const favorites = await ctx.db.userFavorite.findMany({
      where: { userId },
      select: { productId: true },
      orderBy: { createdAt: "desc" },
    });
    return favorites.map((f) => f.productId);
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
      orderBy: { createdAt: "desc" },
    });

    return favorites.map((f) => {
      const p = f.product;
      return {
        id: p.id,
        slug: p.slug,
        image: p.image,
        platformShow: !!p.platformIcon,
        platformIcon: p.platformIcon,
        platformName: p.platformName,
        title: p.title,
        region: p.region as unknown as Region,
        variants: p.variants.map((v) => ({
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
        data: input.productIds.map((productId) => ({ userId, productId })),
        skipDuplicates: true,
      });
      // Optionally clear guest favorites for current linked session
      try {
        const session = await getOrCreateGuestSession(ctx);
        await ctx.db.guestFavorite.deleteMany({ where: { sessionId: session.id } });
      } catch {}
      return { success: true };
    }),

  // Admin-only procedures
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

  create: adminProcedure
    .input(createProductSchema)
    .mutation(async ({ input, ctx }) => {
      console.log('Creating product with input:', input);

      // Validate that the category exists
      const categoryExists = await ctx.db.category.findUnique({
        where: { id: input.category },
      });

      if (!categoryExists) {
        throw new Error("Category not found");
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
            }))
          }
        },
        include: {
          variants: true,
          category: true,
        }
      });

      return product;
    }),

  update: adminProcedure
    .input(updateProductSchema)
    .mutation(async ({ input, ctx }) => {
      // TODO: Update product in database
      return {
        ...input,
        updatedAt: new Date().toISOString(),
      };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Delete product from database
      return { success: true };
    }),
});
