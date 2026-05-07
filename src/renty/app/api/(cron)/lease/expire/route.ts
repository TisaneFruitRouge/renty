import { getExpiredLeases, updateLeaseStatus, updateLeaseInDb } from "@/features/lease/db";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expiredLeases = await getExpiredLeases();
  let expiredCount = 0;

  for (const lease of expiredLeases) {
    try {
      await updateLeaseStatus(lease.id, "EXPIRED");
      if (lease.autoGenerateReceipts) {
        await updateLeaseInDb(lease.id, { autoGenerateReceipts: false });
      }
      expiredCount++;
    } catch (error) {
      console.error(`Failed to expire lease ${lease.id}:`, error);
    }
  }

  return Response.json({ success: true, expiredCount });
}
