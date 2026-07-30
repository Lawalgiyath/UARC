/*
  Warnings:

  - You are about to drop the column `qrToken` on the `Attendance` table. All the data in the column will be lost.
  - Added the required column `qrCodeId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Attendance_qrToken_idx";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "qrToken",
ADD COLUMN     "qrCodeId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Attendance_qrCodeId_idx" ON "Attendance"("qrCodeId");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
