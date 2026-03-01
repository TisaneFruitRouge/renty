import { getPendingReceiptsOlderThan, updateReceiptStatus } from '@/features/rent-receipt/db';
import { sendReceiptEmail } from '@/features/rent-receipt/email/sendEmail';
import { RentReceiptStatus } from '@prisma/client';
import type { NextRequest } from 'next/server';

// Landlord review window: receipts younger than this are held back
const REVIEW_WINDOW_DAYS = 3;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, {
      status: 401,
    });
  }

  const cutoffDate = new Date(Date.now() - REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const pendingReceipts = await getPendingReceiptsOlderThan(cutoffDate);

  for (const receipt of pendingReceipts) {
    try {
      // Only send if still in PENDING status and has a blob URL
      if (receipt.status === 'PENDING' && receipt.blobUrl) {
        // Fetch the PDF content from the blob URL
        const pdfResponse = await fetch(receipt.blobUrl);
        if (!pdfResponse.ok) {
          throw new Error(`Failed to fetch PDF from blob storage: ${pdfResponse.statusText}`);
        }
        const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

        const landlordEmail = receipt.property.user.email;

        // For shared leases, email all tenants; for others, email the primary tenant only
        const isSharedLease =
          receipt.lease?.leaseType === 'SHARED' &&
          (receipt.lease?.tenants?.length ?? 0) > 1;

        const recipients = isSharedLease ? receipt.lease!.tenants : [receipt.tenant];

        for (const recipient of recipients) {
          await sendReceiptEmail(receipt, recipient, landlordEmail, pdfBuffer);
        }

        await updateReceiptStatus(receipt.id, RentReceiptStatus.PAID);
      }
    } catch (error) {
      console.error(`Error sending receipt ${receipt.id}: ${error}`);
    }
  }

  return Response.json({ success: true });
}
