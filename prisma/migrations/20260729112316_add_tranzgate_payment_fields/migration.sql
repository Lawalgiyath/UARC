/*
  Warnings:

  - A unique constraint covering the columns `[paymentBatchId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentBatchId" TEXT,
ADD COLUMN     "paymentCode" TEXT,
ADD COLUMN     "paymentDocumentNo" TEXT,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PaymentWebhook" ALTER COLUMN "signature" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StudentVerification" ALTER COLUMN "rejectionReason" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentBatchId_key" ON "Payment"("paymentBatchId");

-- CreateIndex
CREATE INDEX "Payment_paymentBatchId_idx" ON "Payment"("paymentBatchId");
