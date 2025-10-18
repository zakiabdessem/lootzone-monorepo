import algoliasearch from 'algoliasearch';
import { env } from '~/env';

// Initialize Algolia client
const client = algoliasearch(env.ALGOLIA_APP_ID, env.ALGOLIA_ADMIN_KEY);
const index = client.initIndex(env.ALGOLIA_PRODUCTS_INDEX);

/**
 * Transform a single product for Algolia indexing
 */
export function transformProductForAlgolia(product: any) {
  const productWithVariants = product as any;
  
  return {
    objectID: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    image: product.image,
    platformName: product.platformName,
    platformIcon: product.platformIcon,
    region: product.region,
    keyFeatures: product.keyFeatures,
    categories: productWithVariants.categories?.map((pc: any) => ({
      id: pc.category.id,
      name: pc.category.name,
      slug: pc.category.slug,
      type: pc.category.type,
    })) || [],
    variants: productWithVariants.variants?.map((variant: any) => ({
      id: variant.id,
      name: variant.name,
      price: variant.price,
      originalPrice: variant.originalPrice,
    })) || [],
    minPrice: productWithVariants.variants?.length > 0 
      ? Math.min(...productWithVariants.variants.map((v: any) => v.price)) 
      : 0,
    maxPrice: productWithVariants.variants?.length > 0 
      ? Math.max(...productWithVariants.variants.map((v: any) => v.price)) 
      : 0,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * Sync a single product to Algolia
 */
export async function syncProductToAlgolia(product: any) {
  try {
    if (!env.ALGOLIA_APP_ID || !env.ALGOLIA_ADMIN_KEY || !env.ALGOLIA_PRODUCTS_INDEX) {
      console.log('Algolia not configured, skipping sync');
      return;
    }

    const algoliaObject = transformProductForAlgolia(product);
    
    await index.saveObject(algoliaObject);
    console.log(`✅ Synced product "${product.title}" to Algolia`);
  } catch (error) {
    console.error(`❌ Failed to sync product "${product.title}" to Algolia:`, error);
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Remove a product from Algolia
 */
export async function removeProductFromAlgolia(productId: string) {
  try {
    if (!env.ALGOLIA_APP_ID || !env.ALGOLIA_ADMIN_KEY || !env.ALGOLIA_PRODUCTS_INDEX) {
      console.log('Algolia not configured, skipping removal');
      return;
    }

    await index.deleteObject(productId);
    console.log(`✅ Removed product ${productId} from Algolia`);
  } catch (error) {
    console.error(`❌ Failed to remove product ${productId} from Algolia:`, error);
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Sync multiple products to Algolia
 */
export async function syncProductsToAlgolia(products: any[]) {
  try {
    if (!env.ALGOLIA_APP_ID || !env.ALGOLIA_ADMIN_KEY || !env.ALGOLIA_PRODUCTS_INDEX) {
      console.log('Algolia not configured, skipping bulk sync');
      return;
    }

    const algoliaObjects = products.map(transformProductForAlgolia);
    
    await index.saveObjects(algoliaObjects);
    console.log(`✅ Synced ${products.length} products to Algolia`);
  } catch (error) {
    console.error(`❌ Failed to sync products to Algolia:`, error);
    // Don't throw error to avoid breaking the main operation
  }
}
