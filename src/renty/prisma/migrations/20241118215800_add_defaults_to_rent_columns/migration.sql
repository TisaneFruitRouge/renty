/*
  Warnings:

  - Made the column `currency` on table `property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentFrequency` on table `property` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "property" ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'EUR',
ALTER COLUMN "paymentFrequency" SET NOT NULL,
ALTER COLUMN "paymentFrequency" SET DEFAULT 'monthly';
