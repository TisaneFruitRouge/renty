-- CreateEnum
CREATE TYPE "RentReceiptStatus" AS ENUM ('PENDING', 'PAID', 'LATE', 'UNPAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "rentReceipt" ADD COLUMN     "status" "RentReceiptStatus" NOT NULL DEFAULT 'PENDING';
