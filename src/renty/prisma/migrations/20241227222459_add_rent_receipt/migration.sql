-- DropForeignKey
ALTER TABLE "tenant" DROP CONSTRAINT "tenant_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "tenant" DROP CONSTRAINT "tenant_userId_fkey";

-- DropIndex
DROP INDEX "tenant_propertyId_key";

-- AlterTable
ALTER TABLE "tenant" ALTER COLUMN "propertyId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "rentReceipt" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentFrequency" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rentReceipt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "rentReceipt" ADD CONSTRAINT "rentReceipt_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rentReceipt" ADD CONSTRAINT "rentReceipt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
