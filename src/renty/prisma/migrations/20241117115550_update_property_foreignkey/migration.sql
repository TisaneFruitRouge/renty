/*
  Warnings:

  - You are about to drop the column `accountId` on the `property` table. All the data in the column will be lost.
  - Added the required column `userId` to the `property` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "property" DROP CONSTRAINT "property_accountId_fkey";

-- AlterTable
ALTER TABLE "property" DROP COLUMN "accountId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
