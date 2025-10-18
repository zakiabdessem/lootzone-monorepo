// @ts-ignore - algoliasearch types not available
import algoliasearch from "algoliasearch";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

let cachedIndex: ReturnType<ReturnType<typeof algoliasearch>["initIndex"]> | null = null;

const ensureAlgoliaIndex = () => {
  if (cachedIndex) {
    return cachedIndex;
  }

  if (!env.ALGOLIA_APP_ID || !env.ALGOLIA_SEARCH_KEY || !env.ALGOLIA_PRODUCTS_INDEX) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Algolia search is not configured. Please set ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY and ALGOLIA_PRODUCTS_INDEX environment variables.",
    });
  }

  const client = algoliasearch(env.ALGOLIA_APP_ID, env.ALGOLIA_SEARCH_KEY);
  cachedIndex = client.initIndex(env.ALGOLIA_PRODUCTS_INDEX);
  return cachedIndex;
};

const selectFirstString = (...values: Array<unknown>): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

const selectFirstNumber = (...values: Array<unknown>): number | undefined => {
  for (const value of values) {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
};

const transformHit = (hit: Record<string, unknown>) => {
  const record = hit as Record<string, unknown> & { [key: string]: unknown };

  const id = String(record.objectID ?? record.id ?? "");
  const title =
    selectFirstString(record.title, record.name, record.slug, id) ?? "Untitled product";
  const slug = selectFirstString(record.slug, record.handle, record.permalink, id);
  const image =
    selectFirstString(
      record.image,
      record.thumbnail,
      record.cover,
      record.coverImage,
      record.primaryImage,
      "/product-placeholder.jpg",
    ) ?? "/product-placeholder.jpg";

  const region =
    selectFirstString(record.region, record.regionCode, record.platformRegion, "GLOBAL") ??
    "GLOBAL";

  const price = selectFirstNumber(
    record.price,
    record.minPrice,
    record.currentPrice,
    record.amount,
    record.salePrice,
  );
  const originalPrice = selectFirstNumber(
    record.originalPrice,
    record.compareAtPrice,
    record.maxPrice,
    record.listPrice,
  );

  const badge = selectFirstString(record.badge, record.badgeLabel, record.productType, record.category);

  const tags = Array.isArray(record.tags)
    ? (record.tags.filter((tag): tag is string => typeof tag === "string" && tag.length > 0))
    : [];

  const highlightResult = record._highlightResult as
    | { [key: string]: { value?: unknown } | undefined }
    | undefined;

  const highlightedTitle = selectFirstString(
    highlightResult?.title?.value,
    highlightResult?.name?.value,
  );

  return {
    id,
    title,
    slug,
    image,
    region,
    price,
    originalPrice,
    badge,
    tags,
    highlightedTitle,
  } as const;
};

export const searchRouter = createTRPCRouter({
  products: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(128),
        limit: z.number().min(1).max(20).default(6),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Try Algolia first
      try {
        const index = ensureAlgoliaIndex();
        const response = await index.search(input.query, {
          hitsPerPage: input.limit,
          attributesToHighlight: ["title", "name"],
        });

        return response.hits.map((hit: any) => transformHit(hit as Record<string, unknown>));
      } catch (error) {
        console.log("Algolia not available, falling back to database search");
        
        // Fallback to database search
        const products = await ctx.db.product.findMany({
          where: {
            isActive: true,
            OR: [
              { title: { contains: input.query, mode: 'insensitive' } },
              { description: { contains: input.query, mode: 'insensitive' } },
              { platformName: { contains: input.query, mode: 'insensitive' } },
            ],
          },
          include: {
            variants: {
              where: { isActive: true },
            },
            categories: {
              include: {
                category: true,
              },
            },
          } as any,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
        });

        return products.map(product => {
          const productWithVariants = product as any;
          return {
            id: product.id,
            title: product.title,
            slug: product.slug,
            image: product.image,
            region: product.region,
            price: productWithVariants.variants?.length > 0 ? Math.min(...productWithVariants.variants.map((v: any) => v.price)) : undefined,
            originalPrice: productWithVariants.variants?.length > 0 ? Math.max(...productWithVariants.variants.map((v: any) => v.originalPrice || v.price)) : undefined,
            badge: product.platformName,
            tags: product.keyFeatures,
            highlightedTitle: product.title,
          };
        });
      }
    }),
  popular: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(20).default(6),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      // Try Algolia first
      try {
        const index = ensureAlgoliaIndex();
        const response = await index.search("", {
          hitsPerPage: input?.limit ?? 6,
          attributesToHighlight: ["title", "name"],
        });

        return response.hits.map((hit: any) => transformHit(hit as Record<string, unknown>));
      } catch (error) {
        console.log("Algolia not available, falling back to database for popular products");
        
        // Fallback to database - get popular products
        const products = await ctx.db.product.findMany({
          where: {
            isActive: true,
            showInRecommended: true,
          },
          include: {
            variants: {
              where: { isActive: true },
            },
            categories: {
              include: {
                category: true,
              },
            },
          } as any,
          take: input?.limit ?? 6,
          orderBy: { createdAt: 'desc' },
        });

        return products.map(product => {
          const productWithVariants = product as any;
          return {
            id: product.id,
            title: product.title,
            slug: product.slug,
            image: product.image,
            region: product.region,
            price: productWithVariants.variants?.length > 0 ? Math.min(...productWithVariants.variants.map((v: any) => v.price)) : undefined,
            originalPrice: productWithVariants.variants?.length > 0 ? Math.max(...productWithVariants.variants.map((v: any) => v.originalPrice || v.price)) : undefined,
            badge: product.platformName,
            tags: product.keyFeatures,
            highlightedTitle: product.title,
          };
        });
      }
    }),
});