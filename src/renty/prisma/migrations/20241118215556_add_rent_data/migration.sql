-- AlterTable
ALTER TABLE "property" ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "depositAmount" DOUBLE PRECISION,
ADD COLUMN     "isFurnished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentFrequency" TEXT,
ADD COLUMN     "rentDetails" JSONB,
ADD COLUMN     "rentedSince" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
