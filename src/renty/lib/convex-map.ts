import "server-only";

const DATE_FIELDS = new Set([
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
]);

/**
 * Convex stores timestamps as epoch-millisecond numbers. The app layer expects
 * `Date` objects on known date fields. This revives those fields recursively
 * across nested joins.
 */
export function reviveDates<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => reviveDates(item)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      out[key] = DATE_FIELDS.has(key) && typeof v === "number" ? new Date(v) : reviveDates(v);
    }
    return out as T;
  }
  return value;
}
