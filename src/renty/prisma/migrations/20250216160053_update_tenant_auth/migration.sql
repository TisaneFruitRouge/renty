-- AlterTable
ALTER TABLE "tenantAuth" ADD COLUMN     "biometricEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "biometricPublicKey" TEXT;

-- CreateIndex
CREATE INDEX "tenantAuth_phoneNumber_idx" ON "tenantAuth"("phoneNumber");
