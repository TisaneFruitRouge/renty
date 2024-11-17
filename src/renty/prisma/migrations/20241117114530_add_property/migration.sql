-- CreateTable
CREATE TABLE "property" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "images" TEXT[],

    CONSTRAINT "property_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
