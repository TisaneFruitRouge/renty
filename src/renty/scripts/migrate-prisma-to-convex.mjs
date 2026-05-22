import { PrismaClient } from "@prisma/client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const prisma = new PrismaClient();

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_URL");
}

const convex = new ConvexHttpClient(convexUrl);

const toMs = (value) => (value instanceof Date ? value.getTime() : value ?? null);

async function migrateFile(url, bucket, name) {
  if (!url || !/^https?:\/\//.test(url)) return url;
  if (url.includes("convex.cloud") || url.includes("127.0.0.1")) return url;

  const response = await fetch(url);
  if (!response.ok) {
    console.warn(`Skipping ${url}: ${response.status} ${response.statusText}`);
    return url;
  }

  const blob = await response.blob();
  const uploadUrl = await convex.mutation(api.files.generateUploadUrl);
  const upload = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": response.headers.get("content-type") ?? blob.type,
    },
    body: blob,
  });

  if (!upload.ok) {
    throw new Error(`Convex upload failed for ${url}: ${upload.statusText}`);
  }

  const { storageId } = await upload.json();
  return await convex.mutation(api.files.saveUploadedFile, {
    storageId,
    bucket,
    name,
    contentType: response.headers.get("content-type") ?? blob.type,
    size: blob.size,
  });
}

async function main() {
  const [
    users,
    accounts,
    properties,
    tenants,
    tenantAuths,
    leases,
    receipts,
    channels,
    channelParticipants,
    messages,
    documents,
    subscriptions,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.account.findMany(),
    prisma.property.findMany(),
    prisma.tenant.findMany(),
    prisma.tenantAuth.findMany(),
    prisma.lease.findMany({
      select: {
        id: true,
        propertyId: true,
        startDate: true,
        endDate: true,
        rentAmount: true,
        depositAmount: true,
        charges: true,
        leaseType: true,
        isFurnished: true,
        paymentFrequency: true,
        currency: true,
        status: true,
        notes: true,
        autoGenerateReceipts: true,
        receiptGenerationDate: true,
        nextReceiptDate: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.rentReceipt.findMany(),
    prisma.channel.findMany(),
    prisma.channelParticipant.findMany(),
    prisma.message.findMany(),
    prisma.document.findMany(),
    prisma.subscription.findMany(),
  ]);

  await convex.mutation(api.importAuth.importUsers, {
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: toMs(user.createdAt),
      updatedAt: toMs(user.updatedAt),
      stripeCustomerId: user.stripeCustomerId,
      address: user.address,
      city: user.city,
      state: user.state,
      country: user.country,
      postalCode: user.postalCode,
    })),
  });

  await convex.mutation(api.importAuth.importCredentialAccounts, {
    accounts: accounts.map((account) => ({
      userId: account.userId,
      accountId: account.accountId,
      providerId: account.providerId,
      password: account.password,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      idToken: account.idToken,
      accessTokenExpiresAt: toMs(account.accessTokenExpiresAt),
      refreshTokenExpiresAt: toMs(account.refreshTokenExpiresAt),
      scope: account.scope,
      createdAt: toMs(account.createdAt),
      updatedAt: toMs(account.updatedAt),
    })),
  });

  const migratedProperties = [];
  for (const property of properties) {
    const images = [];
    for (const [index, imageUrl] of property.images.entries()) {
      images.push(await migrateFile(imageUrl, "propertyImage", `${property.id}-${index}`));
    }
    migratedProperties.push({
      prismaId: property.id,
      address: property.address,
      city: property.city,
      country: property.country,
      postalCode: property.postalCode,
      state: property.state,
      title: property.title,
      images,
      userId: property.userId,
      createdAt: toMs(property.createdAt),
      updatedAt: toMs(property.updatedAt),
    });
  }

  const migratedReceipts = [];
  for (const receipt of receipts) {
    const blobUrl = await migrateFile(receipt.blobUrl, "rentReceipt", `${receipt.id}.pdf`);
    migratedReceipts.push({
      prismaId: receipt.id,
      startDate: toMs(receipt.startDate),
      endDate: toMs(receipt.endDate),
      paymentFrequency: receipt.paymentFrequency,
      propertyId: receipt.propertyId,
      tenantId: receipt.tenantId,
      leaseId: receipt.leaseId,
      createdAt: toMs(receipt.createdAt),
      updatedAt: toMs(receipt.updatedAt),
      baseRent: receipt.baseRent,
      charges: receipt.charges,
      blobUrl,
      status: receipt.status,
    });
  }

  const migratedDocuments = [];
  for (const document of documents) {
    const fileUrl = await migrateFile(document.fileUrl, "document", document.name);
    migratedDocuments.push({
      prismaId: document.id,
      name: document.name,
      description: document.description,
      fileUrl,
      fileType: document.fileType,
      fileSize: document.fileSize,
      category: document.category,
      propertyId: document.propertyId,
      uploadedAt: toMs(document.uploadedAt),
      updatedAt: toMs(document.updatedAt),
      sharedWithTenant: document.sharedWithTenant,
    });
  }

  await convex.mutation(api.data.upsertMany, { table: "properties", rows: migratedProperties });
  await convex.mutation(api.data.upsertMany, {
    table: "tenants",
    rows: tenants.map((tenant) => ({
      prismaId: tenant.id,
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      email: tenant.email,
      phoneNumber: tenant.phoneNumber,
      leaseId: tenant.leaseId,
      notes: tenant.notes,
      userId: tenant.userId,
      createdAt: toMs(tenant.createdAt),
      updatedAt: toMs(tenant.updatedAt),
    })),
  });
  await convex.mutation(api.data.upsertMany, {
    table: "tenantAuths",
    rows: tenantAuths.map((auth) => ({
      prismaId: auth.id,
      tenantId: auth.tenantId,
      phoneNumber: auth.phoneNumber,
      passcode: auth.passcode,
      tempCode: auth.tempCode,
      tempCodeExpiresAt: toMs(auth.tempCodeExpiresAt),
      isActivated: auth.isActivated,
      refreshToken: auth.refreshToken,
      refreshTokenExpiresAt: toMs(auth.refreshTokenExpiresAt),
      biometricEnabled: auth.biometricEnabled,
      biometricPublicKey: auth.biometricPublicKey,
      createdAt: toMs(auth.createdAt),
      updatedAt: toMs(auth.updatedAt),
    })),
  });
  await convex.mutation(api.data.upsertMany, {
    table: "leases",
    rows: leases.map((lease) => ({
      prismaId: lease.id,
      propertyId: lease.propertyId,
      startDate: toMs(lease.startDate),
      endDate: toMs(lease.endDate),
      rentAmount: lease.rentAmount,
      depositAmount: lease.depositAmount,
      charges: lease.charges,
      leaseType: lease.leaseType,
      isFurnished: lease.isFurnished,
      paymentFrequency: lease.paymentFrequency,
      currency: lease.currency,
      status: lease.status,
      notes: lease.notes,
      autoGenerateReceipts: lease.autoGenerateReceipts,
      receiptGenerationDate: lease.receiptGenerationDate,
      nextReceiptDate: toMs(lease.nextReceiptDate),
      createdAt: toMs(lease.createdAt),
      updatedAt: toMs(lease.updatedAt),
    })),
  });
  await convex.mutation(api.data.upsertMany, { table: "rentReceipts", rows: migratedReceipts });
  await convex.mutation(api.data.upsertMany, {
    table: "channels",
    rows: channels.map((channel) => ({
      prismaId: channel.id,
      propertyId: channel.propertyId,
      name: channel.name,
      type: channel.type,
      createdAt: toMs(channel.createdAt),
      updatedAt: toMs(channel.updatedAt),
    })),
  });
  await convex.mutation(api.data.upsertMany, {
    table: "channelParticipants",
    rows: channelParticipants.map((participant) => ({
      prismaId: participant.id,
      channelId: participant.channelId,
      participantId: participant.participantId,
      participantType: participant.participantType,
      joinedAt: toMs(participant.joinedAt),
      leftAt: toMs(participant.leftAt),
    })),
  });
  await convex.mutation(api.data.upsertMany, {
    table: "messages",
    rows: messages.map((message) => ({
      prismaId: message.id,
      content: message.content,
      channelId: message.channelId,
      senderId: message.senderId,
      senderType: message.senderType,
      createdAt: toMs(message.createdAt),
    })),
  });
  await convex.mutation(api.data.upsertMany, { table: "documents", rows: migratedDocuments });
  await convex.mutation(api.data.upsertMany, {
    table: "subscriptions",
    rows: subscriptions.map((subscription) => ({
      prismaId: subscription.id,
      plan: subscription.plan,
      referenceId: subscription.referenceId,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      status: subscription.status,
      periodStart: toMs(subscription.periodStart),
      periodEnd: toMs(subscription.periodEnd),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      seats: subscription.seats,
    })),
  });

  console.log("Imported Prisma data and migrated Blob URLs to Convex storage.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
