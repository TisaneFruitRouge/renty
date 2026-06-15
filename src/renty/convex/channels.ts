import { query, mutation } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getLandlordById } from "./authUsers";

const participantType = v.union(v.literal("LANDLORD"), v.literal("TENANT"));

function appId(doc: { prismaId?: string | null; _id: string }) {
  return doc.prismaId ?? doc._id;
}

function shape<T extends { _id: string; prismaId?: string | null }>(doc: T) {
  const { _creationTime, ...rest } = doc as T & { _creationTime: number };
  return { ...rest, id: appId(doc) };
}

async function channelById(ctx: QueryCtx, id: string) {
  const byPrisma = await ctx.db
    .query("channels")
    .withIndex("by_prisma_id", (q) => q.eq("prismaId", id))
    .first();
  if (byPrisma) return byPrisma;
  const convexId = ctx.db.normalizeId("channels", id);
  return convexId ? await ctx.db.get(convexId) : null;
}

async function propertyByAppId(ctx: QueryCtx, id: string) {
  const byPrisma = await ctx.db
    .query("properties")
    .withIndex("by_prisma_id", (q) => q.eq("prismaId", id))
    .first();
  if (byPrisma) return byPrisma;
  const convexId = ctx.db.normalizeId("properties", id);
  return convexId ? await ctx.db.get(convexId) : null;
}

async function tenantByAppId(ctx: QueryCtx, id: string) {
  const byPrisma = await ctx.db
    .query("tenants")
    .withIndex("by_prisma_id", (q) => q.eq("prismaId", id))
    .first();
  if (byPrisma) return byPrisma;
  const convexId = ctx.db.normalizeId("tenants", id);
  return convexId ? await ctx.db.get(convexId) : null;
}

async function participantsOf(ctx: QueryCtx, channelAppId: string) {
  const participants = await ctx.db
    .query("channelParticipants")
    .withIndex("by_channel", (q) => q.eq("channelId", channelAppId))
    .collect();
  return participants.map(shape);
}

async function isChannelParticipant(ctx: QueryCtx, channelAppId: string, participantId: string) {
  const membership = await ctx.db
    .query("channelParticipants")
    .withIndex("by_participant", (q) => q.eq("participantId", participantId))
    .filter((q) =>
      q.and(
        q.eq(q.field("channelId"), channelAppId),
        q.or(q.eq(q.field("leftAt"), null), q.eq(q.field("leftAt"), undefined)),
      ),
    )
    .first();
  return membership !== null;
}

async function resolveSender(ctx: QueryCtx, senderId: string, senderType: "LANDLORD" | "TENANT") {
  if (senderType === "LANDLORD") {
    return await getLandlordById(ctx, senderId);
  }
  const tenant = await tenantByAppId(ctx, senderId);
  return tenant ? shape(tenant) : null;
}

export const listForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const memberships = await ctx.db
      .query("channelParticipants")
      .withIndex("by_participant", (q) => q.eq("participantId", userId))
      .collect();

    const seen = new Set<string>();
    const unique = memberships.filter((membership) => {
      if (seen.has(membership.channelId)) return false;
      seen.add(membership.channelId);
      return true;
    });

    const channels = await Promise.all(
      unique.map(async (membership) => {
        const channel = await channelById(ctx, membership.channelId);
        if (!channel) return null;
        const property = await propertyByAppId(ctx, channel.propertyId);
        return {
          ...shape(channel),
          participants: await participantsOf(ctx, appId(channel)),
          property: property ? shape(property) : null,
        };
      }),
    );
    return channels.filter((channel) => channel !== null);
  },
});

export const getMessages = query({
  args: { channelId: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, { channelId, userId }) => {
    const channel = await channelById(ctx, channelId);
    if (!channel) return null;

    const channelAppId = appId(channel);
    if (userId && !(await isChannelParticipant(ctx, channelAppId, userId))) {
      return null;
    }

    const messages = (
      await ctx.db
        .query("messages")
        .withIndex("by_channel", (q) => q.eq("channelId", channelAppId))
        .collect()
    )
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, 50);

    const messagesWithSender = await Promise.all(
      messages.map(async (message) => ({
        ...shape(message),
        sender: await resolveSender(ctx, message.senderId, message.senderType),
      })),
    );

    const property = await propertyByAppId(ctx, channel.propertyId);
    return {
      ...shape(channel),
      messages: messagesWithSender,
      participants: await participantsOf(ctx, channelAppId),
      property: property ? shape(property) : null,
    };
  },
});

export const getParticipants = query({
  args: { channelId: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, { channelId, userId }) => {
    const channel = await channelById(ctx, channelId);
    if (!channel) return [];
    const channelAppId = appId(channel);
    if (userId && !(await isChannelParticipant(ctx, channelAppId, userId))) {
      return [];
    }

    const participants = await ctx.db
      .query("channelParticipants")
      .withIndex("by_channel", (q) => q.eq("channelId", channelAppId))
      .collect();

    const resolved = await Promise.all(
      participants.map(async (participant) => {
        const detail = await resolveSender(
          ctx,
          participant.participantId,
          participant.participantType,
        );
        return detail ? { ...detail, participantType: participant.participantType } : null;
      }),
    );
    return resolved.filter((entry) => entry !== null);
  },
});

export const getByPropertyId = query({
  args: { propertyId: v.string() },
  handler: async (ctx, { propertyId }) => {
    const channel = (
      await ctx.db
        .query("channels")
        .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
        .collect()
    ).find((c) => c.type === "PROPERTY");
    return channel ? shape(channel) : null;
  },
});

export const saveMessage = mutation({
  args: {
    channelId: v.string(),
    senderId: v.string(),
    senderType: participantType,
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const channel = await channelById(ctx, args.channelId);
    if (!channel) throw new Error("Channel not found");
    const channelAppId = appId(channel);
    if (!(await isChannelParticipant(ctx, channelAppId, args.senderId))) {
      throw new Error("Not authorized to send messages in this channel");
    }

    const id = crypto.randomUUID();
    await ctx.db.insert("messages", {
      prismaId: id,
      channelId: channelAppId,
      senderId: args.senderId,
      senderType: args.senderType,
      content: args.content,
      createdAt: Date.now(),
    });
    const created = await ctx.db
      .query("messages")
      .withIndex("by_prisma_id", (q) => q.eq("prismaId", id))
      .first();
    return shape(created!);
  },
});

export const createPropertyChannel = mutation({
  args: { propertyId: v.string(), landlordId: v.string() },
  handler: async (ctx, { propertyId, landlordId }) => {
    const now = Date.now();
    const channelId = crypto.randomUUID();
    await ctx.db.insert("channels", {
      prismaId: channelId,
      propertyId,
      type: "PROPERTY",
      name: null,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("channelParticipants", {
      prismaId: crypto.randomUUID(),
      channelId,
      participantId: landlordId,
      participantType: "LANDLORD",
      joinedAt: now,
      leftAt: null,
    });
    return shape((await channelById(ctx, channelId))!);
  },
});

export const addTenantToPropertyChannel = mutation({
  args: { propertyId: v.string(), tenantId: v.string() },
  handler: async (ctx, { propertyId, tenantId }) => {
    const channel = (
      await ctx.db
        .query("channels")
        .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
        .collect()
    ).find((c) => c.type === "PROPERTY") ?? (await ctx.db
      .query("channels")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .first());
    if (!channel) throw new Error(`No channel found for property ${propertyId}`);

    await ctx.db.insert("channelParticipants", {
      prismaId: crypto.randomUUID(),
      channelId: appId(channel),
      participantId: tenantId,
      participantType: "TENANT",
      joinedAt: Date.now(),
      leftAt: null,
    });
    return shape(channel);
  },
});
