#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import algoliasearch from 'algoliasearch';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

// Initialize Algolia client
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_SEARCH_KEY!
);

const index = client.initIndex(process.env.ALGOLIA_PRODUCTS_INDEX!);

async function syncProductsToAlgolia() {
  console.log('🔄 Starting Algolia sync...');
  
  try {
    // Fetch all products with their categories and variants
    const products = await prisma.product.findMany({
      where: { isActive: true },
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

    console.log(`📦 Found ${products.length} products to sync`);

    // Transform products for Algolia
    const algoliaObjects = products.map(product => {
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
          stock: variant.stock,
          isInfiniteStock: variant.isInfiniteStock,
          isActive: variant.isActive,
        })) || [],
        minPrice: productWithVariants.variants?.length > 0 ? Math.min(...productWithVariants.variants.map((v: any) => v.price)) : 0,
        maxPrice: productWithVariants.variants?.length > 0 ? Math.max(...productWithVariants.variants.map((v: any) => v.price)) : 0,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    });

    // Clear existing index and add new objects
    console.log('🗑️  Clearing existing index...');
    await index.clearObjects();

    console.log('📤 Uploading products to Algolia...');
    const { objectIDs } = await index.saveObjects(algoliaObjects);

    console.log(`✅ Successfully synced ${objectIDs.length} products to Algolia`);
    
    // Configure search settings
    await index.setSettings({
      searchableAttributes: [
        'title',
        'description',
        'platformName',
        'categories.name',
        'keyFeatures',
      ],
      attributesForFaceting: [
        'searchable(categories.name)',
        'searchable(platformName)',
        'searchable(region)',
      ],
      customRanking: ['desc(createdAt)'],
      typoTolerance: true,
      attributesToRetrieve: [
        'title',
        'slug',
        'description',
        'image',
        'platformName',
        'platformIcon',
        'region',
        'keyFeatures',
        'categories',
        'variants',
        'minPrice',
        'maxPrice',
      ],
    });

    console.log('⚙️  Configured search settings');

  } catch (error) {
    console.error('❌ Error syncing to Algolia:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncProductsToAlgolia()
  .then(() => {
    console.log('🎉 Algolia sync completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Algolia sync failed:', error);
    process.exit(1);
  });
