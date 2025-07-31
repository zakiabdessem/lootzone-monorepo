import { z } from "zod";
import { ProductCategory } from "~/constants/enums";
import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Zod schemas for admin input
const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  type: z.nativeEnum(ProductCategory),
  parentId: z.string().nullable().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().default(true),
});

const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  type: z.nativeEnum(ProductCategory).optional(),
  parentId: z.string().nullable().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

const deleteCategorySchema = z.object({
  id: z.string(),
});

const toggleActiveSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
});

export const categoryRouter = createTRPCRouter({
  // Get all categories with optional filtering
  getAll: publicProcedure
    .input(
      z
        .object({
          type: z.nativeEnum(ProductCategory).optional(),
          parentId: z.string().optional(),
          includeChildren: z.boolean().default(false),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input?.type) {
        where.type = input.type;
      }

      if (input?.parentId) {
        where.parentId = input.parentId;
      } else if (input?.parentId === null) {
        where.parentId = null;
      }

      return ctx.db.category.findMany({
        where,
        include: {
          children: input?.includeChildren
            ? {
                orderBy: { displayOrder: "asc" },
              }
            : false,
          parent: true,
        },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      });
    }),

  // Get smart categories (parent categories) with their children
  getSmart: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      where: {
        type: ProductCategory.SMART,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { displayOrder: "asc" },
    });
  }),

  // Get simple categories (for category bar)
  getSimple: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      where: {
        type: ProductCategory.SIMPLE,
        isActive: true,
      },
      orderBy: { displayOrder: "asc" },
    });
  }),

  // Get product categories (subcategories)
  getProduct: publicProcedure
    .input(
      z
        .object({
          parentId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        type: ProductCategory.PRODUCT,
        isActive: true,
      };

      if (input?.parentId) {
        where.parentId = input.parentId;
      }

      return ctx.db.category.findMany({
        where,
        include: {
          parent: true,
        },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      });
    }),

  // Get utility categories (featured, popular, etc.)
  getUtility: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      where: {
        type: ProductCategory.UTILITY,
        isActive: true,
      },
      orderBy: { displayOrder: "asc" },
    });
  }),

  // Get category by slug
  getBySlug: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.category.findUnique({
      where: {
        slug: input,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        },
        parent: true,
      },
    });
  }),

  // Get category hierarchy (for navigation/breadcrumbs)
  getHierarchy: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { displayOrder: "asc" },
            },
          },
        },
      },
      orderBy: { displayOrder: "asc" },
    });
  }),

  // Admin: Create category
  create: adminProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.create({
        data: {
          name: input.name,
          slug: input.slug,
          type: input.type,
          parentId: input.parentId ?? null,
          displayOrder: input.displayOrder,
          isActive: input.isActive,
        },
      });
    }),

  // Admin: Update category
  update: adminProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.category.update({
        where: { id },
        data,
      });
    }),

  // Admin: Delete category (soft delete by default)
  delete: adminProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      // Soft delete: set isActive to false
      return ctx.db.category.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  // Admin: Toggle active/inactive
  toggleActive: adminProcedure
    .input(toggleActiveSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });
    }),
});
