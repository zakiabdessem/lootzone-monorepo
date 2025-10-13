-- AlterTable
ALTER TABLE "CheckoutDraft" ADD COLUMN     "guestSessionToken" TEXT,
ADD COLUMN     "ipAddress" TEXT;

-- CreateIndex
CREATE INDEX "CheckoutDraft_guestSessionToken_idx" ON "CheckoutDraft"("guestSessionToken");

-- CreateIndex
CREATE INDEX "CheckoutDraft_ipAddress_idx" ON "CheckoutDraft"("ipAddress");
