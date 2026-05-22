import "server-only";

import { api, components } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";

type TableName =
  | "properties"
  | "tenants"
  | "tenantAuths"
  | "leases"
  | "rentReceipts"
  | "channels"
  | "channelParticipants"
  | "messages"
  | "documents"
  | "subscriptions";

const modelToTable = {
  property: "properties",
  tenant: "tenants",
  tenantAuth: "tenantAuths",
  lease: "leases",
  rentReceipt: "rentReceipts",
  channel: "channels",
  channelParticipant: "channelParticipants",
  Message: "messages",
  message: "messages",
  document: "documents",
  subscription: "subscriptions",
} as const;

const tableToModel = Object.fromEntries(
  Object.entries(modelToTable).map(([model, table]) => [table, model]),
) as Record<string, string>;

type QueryArgs = {
  where?: any;
  include?: any;
  select?: any;
  orderBy?: any;
  take?: number;
  data?: any;
};

function toDate(value: unknown) {
  return typeof value === "number" ? new Date(value) : value;
}

function fromConvex(table: TableName, doc: any) {
  if (!doc) return doc;
  const { _id, _creationTime, prismaId, ...rest } = doc;
  const id = prismaId ?? _id;
  const converted = { ...rest, id, _id, prismaId };

  for (const key of [
    "createdAt",
    "updatedAt",
    "startDate",
    "endDate",
    "expiresAt",
    "periodStart",
    "periodEnd",
    "tempCodeExpiresAt",
    "refreshTokenExpiresAt",
    "nextReceiptDate",
    "joinedAt",
    "leftAt",
    "uploadedAt",
  ]) {
    if (key in converted) converted[key] = toDate(converted[key]);
  }

  if (table === "messages" && converted.senderType) {
    converted.senderType = converted.senderType;
  }

  return converted;
}

function toConvexData(data: any) {
  if (!data) return {};
  const out: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (key === "id") {
      out.prismaId = value;
      continue;
    }
    if (value instanceof Date) {
      out[key] = value.getTime();
      continue;
    }
    out[key] = value;
  }

  return out;
}

function getField(doc: any, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], doc);
}

function matchesScalar(actual: any, expected: any) {
  if (expected instanceof Date) expected = expected.getTime();
  if (actual instanceof Date) actual = actual.getTime();

  if (expected && typeof expected === "object" && !Array.isArray(expected)) {
    if ("in" in expected) return expected.in.includes(actual);
    if ("notIn" in expected) return !expected.notIn.includes(actual);
    if ("lt" in expected && !(actual < normalizeComparable(expected.lt))) return false;
    if ("lte" in expected && !(actual <= normalizeComparable(expected.lte))) return false;
    if ("gt" in expected && !(actual > normalizeComparable(expected.gt))) return false;
    if ("gte" in expected && !(actual >= normalizeComparable(expected.gte))) return false;
    if ("equals" in expected) return actual === expected.equals;
    return Object.entries(expected).every(([key, value]) =>
      matchesScalar(actual?.[key], value),
    );
  }

  return actual === expected;
}

function normalizeComparable(value: any) {
  return value instanceof Date ? value.getTime() : value;
}

function matchesWhere(doc: any, where: any) {
  if (!where) return true;

  return Object.entries(where).every(([key, expected]) => {
    if (key === "OR") return (expected as any[]).some((entry) => matchesWhere(doc, entry));
    if (key === "AND") return (expected as any[]).every((entry) => matchesWhere(doc, entry));

    if (key === "id") {
      return matchesScalar(doc.id ?? doc.prismaId ?? doc._id, expected);
    }

    return matchesScalar(getField(doc, key), expected);
  });
}

function sortDocs(docs: any[], orderBy: any) {
  if (!orderBy) return docs;
  const [field, direction] = Object.entries(orderBy)[0] as [string, "asc" | "desc"];
  const factor = direction === "desc" ? -1 : 1;
  return [...docs].sort((a, b) => {
    const av = normalizeComparable(getField(a, field));
    const bv = normalizeComparable(getField(b, field));
    if (av === bv) return 0;
    return av > bv ? factor : -factor;
  });
}

async function listTable(table: TableName) {
  const client = getConvexClient();
  const docs = await client.query(api.data.list, { table });
  return docs.map((doc: any) => fromConvex(table, doc));
}

async function loadAll() {
  const [
    properties,
    tenants,
    tenantAuths,
    leases,
    rentReceipts,
    channels,
    channelParticipants,
    messages,
    documents,
    subscriptions,
  ] = await Promise.all([
    listTable("properties"),
    listTable("tenants"),
    listTable("tenantAuths"),
    listTable("leases"),
    listTable("rentReceipts"),
    listTable("channels"),
    listTable("channelParticipants"),
    listTable("messages"),
    listTable("documents"),
    listTable("subscriptions"),
  ]);

  return {
    properties,
    tenants,
    tenantAuths,
    leases,
    rentReceipts,
    channels,
    channelParticipants,
    messages,
    documents,
    subscriptions,
  };
}

async function hydrate(table: TableName, doc: any, include: any): Promise<any> {
  if (!doc || !include) return doc;
  const all = await loadAll();
  const result = { ...doc };

  if (table === "properties") {
    if (include.leases) {
      let leases = all.leases.filter((lease) => lease.propertyId === doc.id);
      if (include.leases.where) leases = leases.filter((lease) => matchesWhere(lease, include.leases.where));
      if (include.leases.include?.tenants) {
        leases = await Promise.all(leases.map((lease) => hydrate("leases", lease, include.leases.include)));
      }
      result.leases = sortDocs(leases, include.leases.orderBy);
    }
    if (include.user) result.user = await authUserById(doc.userId);
    if (include.documents) result.documents = all.documents.filter((d) => d.propertyId === doc.id);
    if (include.rentReceipt) result.rentReceipt = all.rentReceipts.filter((r) => r.propertyId === doc.id);
  }

  if (table === "leases") {
    if (include.property) {
      const property = all.properties.find((property) => property.id === doc.propertyId);
      result.property = include.property.include?.user
        ? { ...property, user: property ? await authUserById(property.userId) : null }
        : property;
    }
    if (include.tenants) {
      let tenants = all.tenants.filter((tenant) => tenant.leaseId === doc.id);
      if (include.tenants.include?.auth) {
        tenants = tenants.map((tenant) => ({
          ...tenant,
          auth: all.tenantAuths.find((auth) => auth.tenantId === tenant.id) ?? null,
        }));
      }
      result.tenants = tenants;
    }
    if (include.rentReceipts) {
      result.rentReceipts = all.rentReceipts.filter((receipt) => receipt.leaseId === doc.id);
    }
  }

  if (table === "tenants") {
    if (include.auth) result.auth = all.tenantAuths.find((auth) => auth.tenantId === doc.id) ?? null;
    if (include.lease) {
      const lease = all.leases.find((lease) => lease.id === doc.leaseId) ?? null;
      result.lease = include.lease.include?.property && lease
        ? { ...lease, property: all.properties.find((property) => property.id === lease.propertyId) ?? null }
        : lease;
    }
  }

  if (table === "rentReceipts") {
    if (include.property) {
      const property = all.properties.find((property) => property.id === doc.propertyId) ?? null;
      result.property = include.property.include?.user && property
        ? { ...property, user: await authUserById(property.userId) }
        : property;
    }
    if (include.tenant) result.tenant = all.tenants.find((tenant) => tenant.id === doc.tenantId) ?? null;
    if (include.lease) {
      const lease = all.leases.find((lease) => lease.id === doc.leaseId) ?? null;
      result.lease = include.lease.include?.tenants && lease
        ? { ...lease, tenants: all.tenants.filter((tenant) => tenant.leaseId === lease.id) }
        : lease;
    }
  }

  if (table === "documents" && include.property) {
    result.property = all.properties.find((property) => property.id === doc.propertyId) ?? null;
  }

  if (table === "channels") {
    if (include.property) result.property = all.properties.find((property) => property.id === doc.propertyId) ?? null;
    if (include.participants) {
      result.participants = all.channelParticipants.filter((p) => p.channelId === doc.id);
    }
    if (include.messages) result.messages = all.messages.filter((message) => message.channelId === doc.id);
  }

  return result;
}

async function authUserById(userId: string) {
  try {
    const client = getConvexClient();
    const users = await client.query(components.betterAuth.adapter.findMany as any, {
      model: "user",
      where: [{ field: "userId", value: userId }],
      paginationOpts: { cursor: null, numItems: 1 },
    });
    const user = users.page?.[0];
    return user ? { ...user, id: user.userId ?? user._id } : null;
  } catch {
    return null;
  }
}

function createModel(model: keyof typeof modelToTable) {
  const table = modelToTable[model] as TableName;

  return {
    async findMany(args: QueryArgs = {}) {
      let docs = await listTable(table);
      docs = docs.filter((doc) => matchesWhere(doc, args.where));
      docs = sortDocs(docs, args.orderBy);
      if (args.take !== undefined) docs = docs.slice(0, args.take);
      if (args.include) docs = await Promise.all(docs.map((doc) => hydrate(table, doc, args.include)));
      if (args.select) docs = docs.map((doc) => selectFields(doc, args.select));
      return docs;
    },

    async findUnique(args: QueryArgs = {}) {
      const docs = await this.findMany({ where: args.where, include: args.include, select: args.select });
      return docs[0] ?? null;
    },

    async findFirst(args: QueryArgs = {}) {
      const docs = await this.findMany({ ...args, take: 1 });
      return docs[0] ?? null;
    },

    async count(args: QueryArgs = {}) {
      const docs = await this.findMany({ where: args.where });
      return docs.length;
    },

    async create(args: QueryArgs) {
      const client = getConvexClient();
      const inserted = await client.mutation(api.data.insert, {
        table,
        data: toConvexData({
          id: crypto.randomUUID(),
          ...args.data,
          createdAt: args.data?.createdAt ?? Date.now(),
          updatedAt: args.data?.updatedAt ?? Date.now(),
        }),
      });
      return hydrate(table, fromConvex(table, inserted), args.include);
    },

    async update(args: QueryArgs & { where: any }) {
      const existing = await this.findUnique({ where: args.where });
      if (!existing) throw new Error(`${String(model)} not found`);
      const client = getConvexClient();
      const patched = await client.mutation(api.data.patch, {
        table,
        id: existing._id,
        data: toConvexData({
          ...args.data,
          updatedAt: Date.now(),
        }),
      });
      return hydrate(table, fromConvex(table, patched), args.include);
    },

    async updateMany(args: QueryArgs & { where?: any }) {
      const docs = await this.findMany({ where: args.where });
      await Promise.all(
        docs.map((doc) =>
          getConvexClient().mutation(api.data.patch, {
            table,
            id: doc._id,
            data: toConvexData({ ...args.data, updatedAt: Date.now() }),
          }),
        ),
      );
      return { count: docs.length };
    },

    async delete(args: QueryArgs & { where: any }) {
      const existing = await this.findUnique({ where: args.where });
      if (!existing) throw new Error(`${String(model)} not found`);
      await getConvexClient().mutation(api.data.remove, { id: existing._id });
      return existing;
    },

    async deleteMany(args: QueryArgs & { where?: any }) {
      const docs = await this.findMany({ where: args.where });
      return await getConvexClient().mutation(api.data.removeMany, {
        table,
        ids: docs.map((doc) => doc._id),
      });
    },
  };
}

function createAuthModel(model: "user" | "session") {
  return {
    async findMany(args: QueryArgs = {}) {
      const client = getConvexClient();
      const result = await client.query(components.betterAuth.adapter.findMany as any, {
        model,
        where: whereToAdapterWhere(args.where),
        paginationOpts: { cursor: null, numItems: args.take ?? 200 },
      });
      let docs = (result.page ?? []).map((doc: any) => ({
        ...doc,
        id: doc.userId ?? doc._id,
        _id: doc._id,
      }));
      docs = sortDocs(docs, args.orderBy);
      if (args.take !== undefined) docs = docs.slice(0, args.take);
      if (args.select) docs = docs.map((doc: any) => selectFields(doc, args.select));
      return docs;
    },

    async findUnique(args: QueryArgs = {}) {
      const docs = await this.findMany({ ...args, take: 1 });
      return docs[0] ?? null;
    },

    async findFirst(args: QueryArgs = {}) {
      return await this.findUnique(args);
    },

    async update(args: QueryArgs & { where: any }) {
      const existing = await this.findUnique({ where: args.where });
      if (!existing) throw new Error(`${model} not found`);
      const updated = await getConvexClient().mutation(components.betterAuth.adapter.updateOne as any, {
        input: {
          model,
          where: whereToAdapterWhere(args.where),
          update: toConvexData(args.data),
        },
      });
      return { ...updated, id: updated.userId ?? updated._id };
    },

    async delete(args: QueryArgs & { where: any }) {
      const deleted = await getConvexClient().mutation(components.betterAuth.adapter.deleteOne as any, {
        input: {
          model,
          where: whereToAdapterWhere(args.where),
        },
      });
      return deleted ? { ...deleted, id: deleted.userId ?? deleted._id } : null;
    },
  };
}

function whereToAdapterWhere(where: any) {
  if (!where) return undefined;
  return Object.entries(where).map(([field, value]) => ({
    field: field === "id" ? "_id" : field,
    value: value instanceof Date ? value.getTime() : value,
  }));
}

function selectFields(doc: any, select: Record<string, boolean>) {
  return Object.fromEntries(
    Object.entries(select)
      .filter(([, enabled]) => enabled)
      .map(([key]) => [key, doc[key]]),
  );
}

export const db = {
  user: createAuthModel("user"),
  session: createAuthModel("session"),
  property: createModel("property"),
  tenant: createModel("tenant"),
  tenantAuth: createModel("tenantAuth"),
  lease: createModel("lease"),
  rentReceipt: createModel("rentReceipt"),
  channel: createModel("channel"),
  channelParticipant: createModel("channelParticipant"),
  Message: createModel("Message"),
  message: createModel("message"),
  document: createModel("document"),
  subscription: createModel("subscription"),
  async $transaction<T>(callback: (tx: typeof db) => Promise<T>) {
    return await callback(db);
  },
};
