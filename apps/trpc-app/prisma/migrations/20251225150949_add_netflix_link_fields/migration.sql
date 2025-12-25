-- AlterTable
ALTER TABLE "NetflixAccessLink" ADD COLUMN "username" TEXT,
ADD COLUMN "notes" TEXT,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'UNPAID';

-- CreateIndex
CREATE INDEX "NetflixAccessLink_status_idx" ON "NetflixAccessLink"("status");

