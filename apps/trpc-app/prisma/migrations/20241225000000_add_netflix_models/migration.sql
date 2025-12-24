-- CreateTable
CREATE TABLE "NetflixAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NetflixAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetflixRoom" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NetflixRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetflixAccessLink" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NetflixAccessLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NetflixAccount_email_key" ON "NetflixAccount"("email");

-- CreateIndex
CREATE INDEX "NetflixAccount_email_idx" ON "NetflixAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NetflixRoom_accountId_roomCode_key" ON "NetflixRoom"("accountId", "roomCode");

-- CreateIndex
CREATE INDEX "NetflixRoom_accountId_idx" ON "NetflixRoom"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "NetflixAccessLink_token_key" ON "NetflixAccessLink"("token");

-- CreateIndex
CREATE INDEX "NetflixAccessLink_token_idx" ON "NetflixAccessLink"("token");

-- CreateIndex
CREATE INDEX "NetflixAccessLink_expiresAt_idx" ON "NetflixAccessLink"("expiresAt");

-- CreateIndex
CREATE INDEX "NetflixAccessLink_accountId_idx" ON "NetflixAccessLink"("accountId");

-- AddForeignKey
ALTER TABLE "NetflixRoom" ADD CONSTRAINT "NetflixRoom_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "NetflixAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetflixAccessLink" ADD CONSTRAINT "NetflixAccessLink_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "NetflixAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

