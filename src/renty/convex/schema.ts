import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const optionalString = v.optional(v.union(v.null(), v.string()));
const optionalNumber = v.optional(v.union(v.null(), v.number()));
const optionalBoolean = v.optional(v.union(v.null(), v.boolean()));
const storageId = v.id("_storage");

const leaseStatus = v.union(
  v.literal("ACTIVE"),
  v.literal("EXPIRED"),
  v.literal("TERMINATED"),
  v.literal("PENDING"),
);

const leaseType = v.union(
  v.literal("INDIVIDUAL"),
  v.literal("SHARED"),
  v.literal("COLOCATION"),
);

const terminationReason = v.union(
  v.literal("MUTUAL_AGREEMENT"),
  v.literal("TENANT_REQUEST"),
  v.literal("LANDLORD_REQUEST"),
  v.literal("NON_PAYMENT"),
  v.literal("BREACH_OF_CONTRACT"),
  v.literal("OTHER"),
);

const rentReceiptStatus = v.union(
  v.literal("PENDING"),
  v.literal("PAID"),
  v.literal("LATE"),
  v.literal("UNPAID"),
  v.literal("CANCELLED"),
  v.literal("DRAFT"),
);

const channelType = v.union(
  v.literal("PROPERTY"),
  v.literal("MAINTENANCE"),
  v.literal("PAYMENT"),
  v.literal("CUSTOM"),
);

const participantType = v.union(v.literal("LANDLORD"), v.literal("TENANT"));

const documentCategory = v.union(
  v.literal("LEASE"),
  v.literal("INVENTORY"),
  v.literal("INSURANCE"),
  v.literal("MAINTENANCE"),
  v.literal("PAYMENT"),
  v.literal("CORRESPONDENCE"),
  v.literal("LEGAL"),
  v.literal("UTILITY"),
  v.literal("OTHER"),
);

export default defineSchema({
  properties: defineTable({
    prismaId: optionalString,
    address: v.string(),
    city: v.string(),
    country: v.string(),
    postalCode: v.string(),
    state: v.string(),
    title: v.string(),
    images: v.array(v.string()),
    imageStorageIds: v.optional(v.array(storageId)),
    userId: v.string(),
    createdAt: optionalNumber,
    updatedAt: optionalNumber,
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user", ["userId"]),

  tenants: defineTable({
    prismaId: optionalString,
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phoneNumber: v.string(),
    leaseId: optionalString,
    notes: optionalString,
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_user", ["userId"])
    .index("by_lease", ["leaseId"]),

  tenantAuths: defineTable({
    prismaId: optionalString,
    tenantId: v.string(),
    phoneNumber: v.string(),
    passcode: v.string(),
    tempCode: optionalString,
    tempCodeExpiresAt: optionalNumber,
    isActivated: v.boolean(),
    refreshToken: optionalString,
    refreshTokenExpiresAt: optionalNumber,
    biometricEnabled: v.boolean(),
    biometricPublicKey: optionalString,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_tenant", ["tenantId"])
    .index("by_phone", ["phoneNumber"]),

  leases: defineTable({
    prismaId: optionalString,
    propertyId: v.string(),
    startDate: v.number(),
    endDate: optionalNumber,
    rentAmount: v.number(),
    depositAmount: optionalNumber,
    charges: optionalNumber,
    leaseType,
    isFurnished: v.boolean(),
    paymentFrequency: v.string(),
    currency: v.string(),
    status: leaseStatus,
    notes: optionalString,
    terminationReason: v.optional(v.union(v.null(), terminationReason)),
    renewedFromLeaseId: optionalString,
    autoGenerateReceipts: v.boolean(),
    receiptGenerationDate: optionalNumber,
    nextReceiptDate: optionalNumber,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_property", ["propertyId"])
    .index("by_status", ["status"]),

  rentReceipts: defineTable({
    prismaId: optionalString,
    startDate: v.number(),
    endDate: v.number(),
    paymentFrequency: v.string(),
    propertyId: v.string(),
    tenantId: v.string(),
    leaseId: optionalString,
    baseRent: v.number(),
    charges: v.number(),
    blobUrl: optionalString,
    storageId: v.optional(v.union(v.null(), storageId)),
    status: rentReceiptStatus,
    createdAt: optionalNumber,
    updatedAt: optionalNumber,
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_property", ["propertyId"])
    .index("by_tenant", ["tenantId"])
    .index("by_lease", ["leaseId"])
    .index("by_status", ["status"]),

  channels: defineTable({
    prismaId: optionalString,
    propertyId: v.string(),
    name: optionalString,
    type: channelType,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_property", ["propertyId"]),

  channelParticipants: defineTable({
    prismaId: optionalString,
    channelId: v.string(),
    participantId: v.string(),
    participantType,
    joinedAt: v.number(),
    leftAt: optionalNumber,
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_channel", ["channelId"])
    .index("by_participant", ["participantId"]),

  messages: defineTable({
    prismaId: optionalString,
    content: v.string(),
    channelId: v.string(),
    senderId: v.string(),
    senderType: participantType,
    createdAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_channel", ["channelId"])
    .index("by_sender", ["senderId"]),

  documents: defineTable({
    prismaId: optionalString,
    name: v.string(),
    description: optionalString,
    fileUrl: v.string(),
    storageId: v.optional(v.union(v.null(), storageId)),
    fileType: v.string(),
    fileSize: v.number(),
    category: documentCategory,
    propertyId: v.string(),
    sharedWithTenant: v.boolean(),
    uploadedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_property", ["propertyId"])
    .index("by_category", ["category"]),

  subscriptions: defineTable({
    prismaId: optionalString,
    plan: v.string(),
    referenceId: v.string(),
    stripeCustomerId: optionalString,
    stripeSubscriptionId: optionalString,
    status: v.string(),
    periodStart: optionalNumber,
    periodEnd: optionalNumber,
    cancelAtPeriodEnd: optionalBoolean,
    seats: optionalNumber,
  })
    .index("by_prisma_id", ["prismaId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_reference", ["referenceId"])
    .index("by_status", ["status"]),

  storageFiles: defineTable({
    storageId,
    url: v.string(),
    bucket: v.union(
      v.literal("propertyImage"),
      v.literal("rentReceipt"),
      v.literal("document"),
      v.literal("other"),
    ),
    name: optionalString,
    contentType: optionalString,
    size: optionalNumber,
    createdAt: v.number(),
  })
    .index("by_storage_id", ["storageId"])
    .index("by_url", ["url"])
    .index("by_bucket", ["bucket"]),
});
