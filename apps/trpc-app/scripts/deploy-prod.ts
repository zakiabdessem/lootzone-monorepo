#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import algoliasearch from 'algoliasearch';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

// Initialize Algolia client with production credentials
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_KEY! // Use admin key for production
);

const index = client.initIndex(process.env.ALGOLIA_PRODUCTS_INDEX!);

async function deployToProduction() {
  
  try {
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
        })) || [],
        minPrice: productWithVariants.variants?.length > 0 ? Math.min(...productWithVariants.variants.map((v: any) => v.price)) : 0,
        maxPrice: productWithVariants.variants?.length > 0 ? Math.max(...productWithVariants.variants.map((v: any) => v.price)) : 0,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    });

    // Clear and upload to Algolia
    await index.clearObjects();
    const { objectIDs } = await index.saveObjects(algoliaObjects);

    console.log(`✅ Successfully synced ${objectIDs.length} products to Algolia`);

    // 3. Configure search settings
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
    });

    console.log('⚙️  Configured search settings');

    // 4. Verify deployment
    console.log('🔍 Verifying deployment...');
    const testSearch = await index.search('cyberpunk', { hitsPerPage: 1 });
    console.log(`✅ Test search returned ${testSearch.hits.length} results`);

  } catch (error) {
    console.error('❌ Production deployment failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the deployment
deployToProduction()
  .then(() => {
    console.log('🎉 Production deployment completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Production deployment failed:', error);
    process.exit(1);
  });