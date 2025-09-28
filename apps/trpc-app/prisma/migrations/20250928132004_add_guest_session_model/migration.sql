/*
  Warnings:

  - You are about to drop the column `isDlc` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isDlc";

-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "originalPrice" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'LootZone',
    "currency" TEXT NOT NULL DEFAULT 'DZD',
    "siteAnnouncementHtml" TEXT NOT NULL,
    "siteSubAnnouncement" TEXT NOT NULL,
    "supportEmail" TEXT NOT NULL DEFAULT 'support@lootzone.com',
    "whatsappNumber" TEXT NOT NULL DEFAULT '+213556032355',
    "whatsappLink" TEXT NOT NULL DEFAULT 'https://wa.me/+213556032355',
    "telegramLink" TEXT NOT NULL DEFAULT 'https://t.me/lootzone',
    "primaryColor" TEXT NOT NULL DEFAULT '#4618AC',
    "accentColor" TEXT NOT NULL DEFAULT '#23c299',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "wishlistItems" TEXT[],
    "cartItems" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroSlide_isActive_idx" ON "HeroSlide"("isActive");

-- CreateIndex
CREATE INDEX "HeroSlide_displayOrder_idx" ON "HeroSlide"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "GuestSession_sessionToken_key" ON "GuestSession"("sessionToken");

-- CreateIndex
CREATE INDEX "GuestSession_sessionToken_idx" ON "GuestSession"("sessionToken");

-- CreateIndex
CREATE INDEX "GuestSession_expiresAt_idx" ON "GuestSession"("expiresAt");

-- CreateIndex
CREATE INDEX "GuestSession_ipAddress_idx" ON "GuestSession"("ipAddress");

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
