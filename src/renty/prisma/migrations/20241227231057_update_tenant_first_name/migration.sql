/*
  Warnings:

  - You are about to drop the column `fistName` on the `tenant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tenant" DROP COLUMN "fistName",
ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT 'John';
