-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('PROPERTY', 'MAINTENANCE', 'PAYMENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ParticipantType" AS ENUM ('LANDLORD', 'TENANT');

-- CreateTable
CREATE TABLE "channel" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT,
    "type" "ChannelType" NOT NULL DEFAULT 'PROPERTY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channelParticipant" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "participantType" "ParticipantType" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "channelParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" "ParticipantType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "channel_propertyId_idx" ON "channel"("propertyId");

-- CreateIndex
CREATE INDEX "channelParticipant_participantId_idx" ON "channelParticipant"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "channelParticipant_channelId_participantId_key" ON "channelParticipant"("channelId", "participantId");

-- CreateIndex
CREATE INDEX "Message_channelId_idx" ON "Message"("channelId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- AddForeignKey
ALTER TABLE "channel" ADD CONSTRAINT "channel_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channelParticipant" ADD CONSTRAINT "channelParticipant_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
