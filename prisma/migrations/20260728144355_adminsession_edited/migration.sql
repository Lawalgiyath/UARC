/*
  Warnings:

  - You are about to drop the column `revoked` on the `AdminSession` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `AdminSession` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionHash]` on the table `AdminSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionHash` to the `AdminSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AdminSession_sessionToken_idx";

-- DropIndex
DROP INDEX "AdminSession_sessionToken_key";

-- AlterTable
ALTER TABLE "AdminSession" DROP COLUMN "revoked",
DROP COLUMN "sessionToken",
ADD COLUMN     "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "sessionHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_sessionHash_key" ON "AdminSession"("sessionHash");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");
