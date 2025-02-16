-- CreateTable
CREATE TABLE "tenantAuth" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "passcode" TEXT NOT NULL,
    "tempCode" TEXT,
    "tempCodeExpiresAt" TIMESTAMP(3),
    "isActivated" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenantAuth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenantAuth_tenantId_key" ON "tenantAuth"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tenantAuth_phoneNumber_key" ON "tenantAuth"("phoneNumber");

-- AddForeignKey
ALTER TABLE "tenantAuth" ADD CONSTRAINT "tenantAuth_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
