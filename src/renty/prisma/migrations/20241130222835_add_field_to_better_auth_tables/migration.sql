-- AlterTable
ALTER TABLE "account" ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" DATE,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "scope" TEXT,
ADD COLUMN     "updatedAt" DATE;

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "createdAt" DATE,
ADD COLUMN     "token" TEXT,
ADD COLUMN     "updatedAt" DATE;

-- AlterTable
ALTER TABLE "verification" ADD COLUMN     "updatedAt" DATE;
