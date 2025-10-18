-- Create the junction table for product/categories many-to-many relation
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- Populate the junction table with existing product -> category links
INSERT INTO "ProductCategory" ("id", "productId", "categoryId")
SELECT
    concat('pc_', md5(random()::text || clock_timestamp()::text)),
    "id",
    "categoryId"
FROM "Product"
WHERE "categoryId" IS NOT NULL;

-- Create supporting indexes and unique constraint
CREATE UNIQUE INDEX "ProductCategory_productId_categoryId_key"
    ON "ProductCategory" ("productId", "categoryId");
CREATE INDEX "ProductCategory_productId_idx"
    ON "ProductCategory" ("productId");
CREATE INDEX "ProductCategory_categoryId_idx"
    ON "ProductCategory" ("categoryId");

-- Add foreign key constraints
ALTER TABLE "ProductCategory"
    ADD CONSTRAINT "ProductCategory_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
ALTER TABLE "ProductCategory"
    ADD CONSTRAINT "ProductCategory_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE;

-- Drop legacy foreign key and index on Product.categoryId
ALTER TABLE "Product"
    DROP CONSTRAINT IF EXISTS "Product_categoryId_fkey";
DROP INDEX IF EXISTS "Product_categoryId_idx";

-- Remove the obsolete categoryId column
ALTER TABLE "Product" DROP COLUMN IF EXISTS "categoryId";
