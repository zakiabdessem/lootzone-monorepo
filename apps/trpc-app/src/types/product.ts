import type { RouterOutputs } from "./trpc";
import { Platform, Region, ProductCategory } from "~/constants/enums";

// Use tRPC-inferred types instead of manual definitions
export type Product = RouterOutputs["product"]["getBySlug"];
export type ProductList = RouterOutputs["product"]["list"];
export type CreateProductInput = RouterOutputs["product"]["create"];

/**
 * Enhanced ProductVariant using enums
 */
export interface ProductVariant {
  /** Unique identifier of the variant (could be SKU) */
  id: string;
  /** Human-readable name, e.g. "1 Month | CONSOLE & PC" */
  name: string;
  /** Selling price for this variant */
  price: number;
  /** Striked-through price before discount (optional) */
  originalPrice?: number;
  /** Region code using enum */
  region?: Region;
}

/**
 * Minimal data required to render a product card in a grid/list.
 * Now using type-safe enums
 */
export interface IProductCard {
  /** DB primary key */
  id: string;
  /** SEO-friendly slug */
  slug: string;
  /** Cover image URL */
  image: string;
  /** Marketing title */
  title: string;
  /** Region using enum */
  region: Region;
  /** Platform info using enum */
  platformIcon?: string | null | undefined;
  platformName?: Platform | null | undefined;
  /** Array of purchasable variants (optional for Algolia results) */
  variants?: ProductVariant[];
  /** Direct price (for Algolia results without variants) */
  price?: number;
  /** Direct originalPrice (for Algolia results without variants) */
  originalPrice?: number;
  /** Whether to show platform badge */
  platformShow?: boolean;
  /** Local UI state */
  liked?: boolean;
}

/**
 * Slide type for carousels (e.g. HeroCarousel)
 */
export type Slide = {
  label: string;
  product: IProductCard;
};

/**
 * Category type using enum for better type safety
 */
export type ICategory = {
  name?: ProductCategory;
  label?: string;
  icon: string;
  count?: number;
};
