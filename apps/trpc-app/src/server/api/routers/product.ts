import { z } from "zod";
import { Platform, ProductCategory, Region } from "~/constants/enums";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

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
    // TODO: Get user's favorite products
    return [];
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
