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
      code: "NOT_IMPLEMENTED",
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

  // Extract variants from Algolia or create default variant
  let variants: Array<{ id: string; name: string; price: number; originalPrice?: number | null }> = [];
  
  console.log('🔍 [Algolia] Raw variants from record:', record.variants);
  
  if (Array.isArray(record.variants) && record.variants.length > 0) {
    // Use variants from Algolia if available
    console.log('✅ [Algolia] Using variants from Algolia index');
    variants = record.variants.map((v: any) => ({
      id: String(v.id ?? `${id}-variant-${Math.random()}`),
      name: String(v.name ?? "Default"),
      price: Number(v.price ?? 0),
      originalPrice: v.originalPrice !== undefined ? Number(v.originalPrice) : undefined,
    }));
  } else if (price !== undefined) {
    // Fallback: create default variant from price fields
    console.log('⚠️ [Algolia] No variants in index, creating default variant');
    variants = [{
      id: `${id}-variant-1`,
      name: "Default",
      price: price,
      originalPrice: originalPrice ?? undefined,
    }];
  }
  
  console.log('🔍 [Algolia] Final variants:', variants);

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
    variants,
  };
};

console.log('🔍 [Algolia] Search router loaded and initialized');

export const searchRouter = createTRPCRouter({
  products: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(128),
        limit: z.number().min(1).max(20).default(6),
      }),
    )
    .query(async ({ input }) => {
      console.log('🔍 [Algolia] Products search called with query:', input.query);
      const index = ensureAlgoliaIndex();

      try {
        const response = await index.search(input.query, {
          hitsPerPage: input.limit,
          attributesToHighlight: ["title", "name"],
          attributesToRetrieve: ["*"], // Retrieve all attributes including variants
        });

        console.log('🔍 [Algolia] Search response hits:', response.hits.length);
        console.log('🔍 [Algolia] First hit sample:', JSON.stringify(response.hits[0], null, 2));
        
        const transformedHits = response.hits.map(hit => transformHit(hit as Record<string, unknown>));
        console.log('🔍 [Algolia] First transformed hit:', JSON.stringify(transformedHits[0], null, 2));
        
        return transformedHits;
      } catch (error) {
        console.error("Algolia search error", error);
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to search products right now." });
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
    .query(async ({ input }) => {
      const index = ensureAlgoliaIndex();

      try {
        const response = await index.search("", {
          hitsPerPage: input?.limit ?? 6,
          attributesToHighlight: ["title", "name"],
        });

        return response.hits.map(hit => transformHit(hit as Record<string, unknown>));
      } catch (error) {
        console.error("Algolia popular search error", error);
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to fetch suggested products." });
      }
    }),
});
