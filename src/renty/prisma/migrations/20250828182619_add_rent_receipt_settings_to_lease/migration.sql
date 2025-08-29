-- AlterTable
ALTER TABLE "public"."lease" ADD COLUMN     "autoGenerateReceipts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nextReceiptDate" TIMESTAMP(3),
ADD COLUMN     "receiptGenerationDate" INTEGER;

-- AlterTable
ALTER TABLE "public"."rentReceipt" ADD COLUMN     "leaseId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."rentReceipt" ADD CONSTRAINT "rentReceipt_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "public"."lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;
