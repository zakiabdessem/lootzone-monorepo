/*
  Warnings:

  - A unique constraint covering the columns `[checkoutDraftId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "chargilyWebhookEvents" JSONB[],
ADD COLUMN     "checkoutDraftId" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'DZD';

-- CreateTable
CREATE TABLE "CheckoutDraft" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "userId" TEXT,
    "cartSnapshot" JSONB NOT NULL,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'draft',
    "continueToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "chargilyCustomerId" TEXT,
    "chargilyProductId" TEXT,
    "chargilyPriceId" TEXT,
    "chargilyCheckoutId" TEXT,
    "chargilyPaymentUrl" TEXT,
    "flexyReceiptUrl" TEXT,
    "flexyPaymentTime" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutDraft_continueToken_key" ON "CheckoutDraft"("continueToken");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutDraft_chargilyCheckoutId_key" ON "CheckoutDraft"("chargilyCheckoutId");

-- CreateIndex
CREATE INDEX "CheckoutDraft_email_idx" ON "CheckoutDraft"("email");

-- CreateIndex
CREATE INDEX "CheckoutDraft_continueToken_idx" ON "CheckoutDraft"("continueToken");

-- CreateIndex
CREATE INDEX "CheckoutDraft_paymentStatus_idx" ON "CheckoutDraft"("paymentStatus");

-- CreateIndex
CREATE INDEX "CheckoutDraft_tokenExpiresAt_idx" ON "CheckoutDraft"("tokenExpiresAt");

-- CreateIndex
CREATE INDEX "CheckoutDraft_chargilyCheckoutId_idx" ON "CheckoutDraft"("chargilyCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_checkoutDraftId_key" ON "Order"("checkoutDraftId");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_checkoutDraftId_fkey" FOREIGN KEY ("checkoutDraftId") REFERENCES "CheckoutDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
