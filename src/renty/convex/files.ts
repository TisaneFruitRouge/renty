import { mutation } from "./_generated/server";
import { v } from "convex/values";

const bucket = v.union(
  v.literal("propertyImage"),
  v.literal("rentReceipt"),
  v.literal("document"),
  v.literal("other"),
);

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveUploadedFile = mutation({
  args: {
    storageId: v.id("_storage"),
    bucket,
    name: v.optional(v.string()),
    contentType: v.optional(v.string()),
    size: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Uploaded file is not available from Convex storage");
    }

    await ctx.db.insert("storageFiles", {
      storageId: args.storageId,
      url,
      bucket: args.bucket,
      name: args.name ?? null,
      contentType: args.contentType ?? null,
      size: args.size ?? null,
      createdAt: Date.now(),
    });

    return url;
  },
});

export const deleteByUrl = mutation({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query("storageFiles")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();

    if (!file) {
      return { deleted: false };
    }

    await ctx.storage.delete(file.storageId);
    await ctx.db.delete(file._id);

    return { deleted: true };
  },
});
