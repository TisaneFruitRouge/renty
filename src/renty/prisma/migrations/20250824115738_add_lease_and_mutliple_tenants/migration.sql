/*
  Warnings:

  - You are about to drop the column `currency` on the `property` table. All the data in the column will be lost.
  - You are about to drop the column `depositAmount` on the `property` table. All the data in the column will be lost.
  - You are about to drop the column `isFurnished` on the `property` table. All the data in the column will be lost.
  - You are about to drop the column `paymentFrequency` on the `property` table. All the data in the column will be lost.
  - You are about to drop the column `rentDetails` on the `property` table. All the data in the column will be lost.
  - You are about to drop the column `rentReceiptStartDate` on the `property` table. All the data in the column will be lost.
  - You are about to drop the column `rentedSince` on the `property` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `tenant` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LeaseType" AS ENUM ('INDIVIDUAL', 'SHARED', 'COLOCATION');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING');

-- DropForeignKey
ALTER TABLE "tenant" DROP CONSTRAINT "tenant_propertyId_fkey";

-- AlterTable
ALTER TABLE "property" DROP COLUMN "currency",
DROP COLUMN "depositAmount",
DROP COLUMN "isFurnished",
DROP COLUMN "paymentFrequency",
DROP COLUMN "rentDetails",
DROP COLUMN "rentReceiptStartDate",
DROP COLUMN "rentedSince";

-- AlterTable
ALTER TABLE "tenant" DROP COLUMN "endDate",
DROP COLUMN "propertyId",
DROP COLUMN "startDate",
ADD COLUMN     "leaseId" TEXT;

-- CreateTable
CREATE TABLE "lease" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "rentAmount" DOUBLE PRECISION NOT NULL,
    "depositAmount" DOUBLE PRECISION,
    "charges" DOUBLE PRECISION DEFAULT 0,
    "leaseType" "LeaseType" NOT NULL DEFAULT 'INDIVIDUAL',
    "isFurnished" BOOLEAN NOT NULL DEFAULT false,
    "paymentFrequency" TEXT NOT NULL DEFAULT 'monthly',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "LeaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lease_propertyId_idx" ON "lease"("propertyId");

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease" ADD CONSTRAINT "lease_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
