-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "showInRecentlyViewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showInRecommended" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Product_showInRecentlyViewed_idx" ON "Product"("showInRecentlyViewed");

-- CreateIndex
CREATE INDEX "Product_showInRecommended_idx" ON "Product"("showInRecommended");
