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

export function reviveDates<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => reviveDates(item)) as T;
  }

  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      out[key] = DATE_FIELDS.has(key) && typeof nestedValue === "number"
        ? new Date(nestedValue)
        : reviveDates(nestedValue);
    }
    return out as T;
  }

  return value;
}
