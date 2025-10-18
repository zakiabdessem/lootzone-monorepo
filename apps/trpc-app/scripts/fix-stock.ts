/**
 * Script to check and optionally fix product variant stock data
 * Run with: npx tsx scripts/fix-stock.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking product variant stock data...\n');

  // Get all variants
  const variants = await prisma.productVariant.findMany({
    include: {
      product: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  console.log(`Found ${variants.length} total variants\n`);

  // Group by stock status
  const outOfStock = variants.filter(v => !v.isInfiniteStock && (v.stock ?? 0) === 0);
  const limitedStock = variants.filter(v => !v.isInfiniteStock && (v.stock ?? 0) > 0);
  const infiniteStock = variants.filter(v => v.isInfiniteStock);

  console.log('📊 Stock Status Summary:');
  console.log(`  ✅ Infinite Stock: ${infiniteStock.length}`);
  console.log(`  ⚠️  Limited Stock: ${limitedStock.length}`);
  console.log(`  ❌ Out of Stock: ${outOfStock.length}\n`);

  if (outOfStock.length > 0) {
    console.log('❌ OUT OF STOCK VARIANTS:');
    outOfStock.forEach(v => {
      console.log(`  - ${v.product.title} (${v.name})`);
      console.log(`    Stock: ${v.stock}, isInfiniteStock: ${v.isInfiniteStock}`);
    });
    console.log('');
  }

  // Check hero slide products specifically
  const heroSlides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    include: {
      product: {
        include: {
          variants: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  console.log('🎯 HERO SLIDE PRODUCTS:');
  heroSlides.forEach((slide, idx) => {
    console.log(`\n${idx + 1}. ${slide.product.title} (${slide.label})`);
    slide.product.variants.forEach(v => {
      const status = v.isInfiniteStock 
        ? '✅ INFINITE' 
        : (v.stock ?? 0) > 0 
          ? `⚠️  STOCK: ${v.stock}` 
          : '❌ OUT OF STOCK';
      console.log(`   - ${v.name}: ${status}`);
    });
  });

  console.log('\n\n💡 TO FIX: Run the following command to enable infinite stock for all variants:');
  console.log('   npx tsx scripts/enable-infinite-stock.ts\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
