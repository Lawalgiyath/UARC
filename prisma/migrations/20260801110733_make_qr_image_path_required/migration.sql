/*
  Warnings:

  - Made the column `qrImagePath` on table `QRCode` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "QRCode" ALTER COLUMN "qrImagePath" SET NOT NULL;
