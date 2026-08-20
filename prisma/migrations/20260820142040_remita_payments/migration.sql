-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('REMITA', 'PAYSTACK');

-- AlterEnum
BEGIN;
CREATE TYPE "PartnerStatus_new" AS ENUM ('PENDING', 'AWAITING_PAYMENT', 'DECLARED', 'PAID', 'CONFIRMED', 'REJECTED', 'FAILED', 'CANCELLED');
ALTER TABLE "Exhibitor" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Sponsor" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Sponsor" ALTER COLUMN "status" TYPE "PartnerStatus_new" USING ("status"::text::"PartnerStatus_new");
ALTER TABLE "Exhibitor" ALTER COLUMN "status" TYPE "PartnerStatus_new" USING ("status"::text::"PartnerStatus_new");
ALTER TYPE "PartnerStatus" RENAME TO "PartnerStatus_old";
ALTER TYPE "PartnerStatus_new" RENAME TO "PartnerStatus";
DROP TYPE "PartnerStatus_old";
ALTER TABLE "Exhibitor" ALTER COLUMN "status" SET DEFAULT 'PENDING';
ALTER TABLE "Sponsor" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RegistrationStatus" ADD VALUE 'DECLARED';
ALTER TYPE "RegistrationStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Exhibitor" ADD COLUMN     "declaredAt" TIMESTAMP(3),
ADD COLUMN     "paymentCheckedAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'REMITA',
ADD COLUMN     "paymentNote" TEXT,
ADD COLUMN     "receiptPublicId" TEXT,
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "rrr" TEXT;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "declaredAt" TIMESTAMP(3),
ADD COLUMN     "paymentCheckedAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'REMITA',
ADD COLUMN     "paymentNote" TEXT,
ADD COLUMN     "receiptPublicId" TEXT,
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "rrr" TEXT;

-- AlterTable
ALTER TABLE "Sponsor" ADD COLUMN     "declaredAt" TIMESTAMP(3),
ADD COLUMN     "paymentCheckedAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'REMITA',
ADD COLUMN     "paymentNote" TEXT,
ADD COLUMN     "receiptPublicId" TEXT,
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "rrr" TEXT;

-- CreateIndex
CREATE INDEX "Registration_rrr_idx" ON "Registration"("rrr");

