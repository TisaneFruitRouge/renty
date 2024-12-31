/*
  Warnings:

  - You are about to drop the column `amount` on the `rentReceipt` table. All the data in the column will be lost.
  - Added the required column `baseRent` to the `rentReceipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `charges` to the `rentReceipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rentReceipt" DROP COLUMN "amount",
ADD COLUMN     "baseRent" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "charges" DOUBLE PRECISION NOT NULL;
