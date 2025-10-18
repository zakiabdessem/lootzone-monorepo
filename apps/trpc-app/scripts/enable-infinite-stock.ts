/**
 * Script to enable infinite stock for all product variants
 * Run with: npx tsx scripts/enable-infinite-stock.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Enabling infinite stock for all product variants...\n');

  const result = await prisma.productVariant.updateMany({
    where: {
      isInfiniteStock: false,
    },
    data: {
      isInfiniteStock: true,
    },
  });

  console.log(`✅ Updated ${result.count} variants to have infinite stock\n`);

  // Verify the changes
  const variants = await prisma.productVariant.findMany({
    select: {
      id: true,
      name: true,
      isInfiniteStock: true,
      stock: true,
      product: {
        select: {
          title: true,
        },
      },
    },
  });

  console.log('📊 Current stock status:');
  const infinite = variants.filter(v => v.isInfiniteStock);
  const limited = variants.filter(v => !v.isInfiniteStock);

  console.log(`  ✅ Infinite Stock: ${infinite.count}`);
  console.log(`  ⚠️  Limited Stock: ${limited.count}\n`);

  if (limited.length > 0) {
    console.log('⚠️  Some variants still have limited stock:');
    limited.forEach(v => {
      console.log(`  - ${v.product.title} (${v.name}): stock=${v.stock}`);
    });
  } else {
    console.log('✅ All variants now have infinite stock enabled!');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
