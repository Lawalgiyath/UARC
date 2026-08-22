-- AlterTable
ALTER TABLE "Exhibitor" ADD COLUMN     "checkFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "checkVerdict" TEXT,
ADD COLUMN     "declaredAmount" INTEGER,
ADD COLUMN     "paidOn" TIMESTAMP(3),
ADD COLUMN     "paidVia" TEXT;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "checkFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "checkVerdict" TEXT,
ADD COLUMN     "declaredAmount" INTEGER,
ADD COLUMN     "paidOn" TIMESTAMP(3),
ADD COLUMN     "paidVia" TEXT;

-- AlterTable
ALTER TABLE "Sponsor" ADD COLUMN     "checkFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "checkVerdict" TEXT,
ADD COLUMN     "declaredAmount" INTEGER,
ADD COLUMN     "paidOn" TIMESTAMP(3),
ADD COLUMN     "paidVia" TEXT;
