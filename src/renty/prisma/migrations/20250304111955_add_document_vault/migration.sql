-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('LEASE', 'INVENTORY', 'INSURANCE', 'MAINTENANCE', 'PAYMENT', 'CORRESPONDENCE', 'LEGAL', 'UTILITY', 'OTHER');

-- CreateTable
CREATE TABLE "document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "propertyId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_propertyId_idx" ON "document"("propertyId");

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
