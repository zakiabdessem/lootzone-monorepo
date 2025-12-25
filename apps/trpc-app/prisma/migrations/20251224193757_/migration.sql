-- DropForeignKey (only if exists)
ALTER TABLE "public"."ProductCategory" DROP CONSTRAINT IF EXISTS "ProductCategory_categoryId_fkey";

-- DropForeignKey (only if exists)
ALTER TABLE "public"."ProductCategory" DROP CONSTRAINT IF EXISTS "ProductCategory_productId_fkey";

-- AlterTable - Add columns only if they don't exist
DO $$ 
BEGIN
    -- Add couponCode to CheckoutDraft if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'CheckoutDraft' AND column_name = 'couponCode'
    ) THEN
        ALTER TABLE "CheckoutDraft" ADD COLUMN "couponCode" TEXT;
    END IF;
    
    -- Add discountAmount to CheckoutDraft if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'CheckoutDraft' AND column_name = 'discountAmount'
    ) THEN
        ALTER TABLE "CheckoutDraft" ADD COLUMN "discountAmount" DECIMAL(10,2);
    END IF;
END $$;

-- AlterTable - Add columns to Order only if they don't exist
DO $$ 
BEGIN
    -- Add couponCode to Order if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Order' AND column_name = 'couponCode'
    ) THEN
        ALTER TABLE "Order" ADD COLUMN "couponCode" TEXT;
    END IF;
    
    -- Add couponId to Order if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Order' AND column_name = 'couponId'
    ) THEN
        ALTER TABLE "Order" ADD COLUMN "couponId" TEXT;
    END IF;
    
    -- Add discountAmount to Order if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Order' AND column_name = 'discountAmount'
    ) THEN
        ALTER TABLE "Order" ADD COLUMN "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;
    END IF;
    
    -- Add subtotalBeforeDiscount to Order if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Order' AND column_name = 'subtotalBeforeDiscount'
    ) THEN
        ALTER TABLE "Order" ADD COLUMN "subtotalBeforeDiscount" DECIMAL(10,2);
    END IF;
END $$;

-- CreateTable (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "minOrderAmount" DECIMAL(10,2),
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (only if it doesn't exist)
CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS "Coupon_isActive_idx" ON "Coupon"("isActive");

-- CreateIndex (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS "Coupon_expiresAt_idx" ON "Coupon"("expiresAt");

-- CreateIndex (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS "Order_couponId_idx" ON "Order"("couponId");

-- AddForeignKey (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ProductCategory_productId_fkey'
    ) THEN
        ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ProductCategory_categoryId_fkey'
    ) THEN
        ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Order_couponId_fkey'
    ) THEN
        ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
