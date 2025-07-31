import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc";
import { Platform, Region, ProductCategory } from "~/constants/enums";

// Zod schemas for input validation
const createProductSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  image: z.string().url(),
  gallery: z.array(z.string().url()).optional(),
  platformIcon: z.string().optional(),
  platformName: z.nativeEnum(Platform).optional(),
  region: z.nativeEnum(Region).default(Region.GLOBAL),
  isDlc: z.boolean().default(false),
  category: z.nativeEnum(ProductCategory),
  variants: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number().positive(),
        originalPrice: z.number().positive(),
        region: z.nativeEnum(Region).optional(),
        attributes: z.record(z.any()).optional(),
      })
    )
    .min(1),
  keyFeatures: z.array(z.string()).optional(),
  deliveryInfo: z.string().optional(),
  deliverySteps: z.array(z.string()).optional(),
  terms: z.string().optional(),
  importantNotes: z.array(z.string()).optional(),
});

const updateProductSchema = createProductSchema.partial().extend({
  id: z.string(),
});

export const productRouter = createTRPCRouter({
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
        isDlc: false,
        category: ProductCategory.PRODUCT,
        variants: [
          {
            id: "variant-1",
            name: "Standard Edition",
            price: 29.99,
            originalPrice: 39.99,
            region: Region.GLOBAL,
            attributes: {},
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
            isDlc: false,
            category: ProductCategory.PRODUCT,
            variants: [
              {
                id: "variant-1",
                name: "Standard Edition",
                price: 29.99,
                originalPrice: 39.99,
                region: Region.GLOBAL,
                attributes: {},
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
  create: adminProcedure
    .input(createProductSchema)
    .mutation(async ({ input, ctx }) => {
      // TODO: Create product in database
      return {
        id: "new-product-id",
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
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
