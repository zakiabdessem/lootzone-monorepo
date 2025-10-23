-- CreateTable
CREATE TABLE "Coupon" (
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

-- AlterTable: Add coupon fields to Order
ALTER TABLE "Order" ADD COLUMN "couponId" TEXT;
ALTER TABLE "Order" ADD COLUMN "couponCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "subtotalBeforeDiscount" DECIMAL(10,2);

-- AlterTable: Add coupon fields to CheckoutDraft
ALTER TABLE "CheckoutDraft" ADD COLUMN "couponCode" TEXT;
ALTER TABLE "CheckoutDraft" ADD COLUMN "discountAmount" DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_isActive_idx" ON "Coupon"("isActive");

-- CreateIndex
CREATE INDEX "Coupon_expiresAt_idx" ON "Coupon"("expiresAt");

-- CreateIndex
CREATE INDEX "Order_couponId_idx" ON "Order"("couponId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

