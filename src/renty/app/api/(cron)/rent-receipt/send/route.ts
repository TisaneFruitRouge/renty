import { getPendingReceiptsForDate } from '@/features/rent-receipt/db';
import { sendReceiptEmail } from '@/features/rent-receipt/email/sendEmail';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, {
      status: 401,
    });
  }

  const today = new Date();
  const pendingReceipts = await getPendingReceiptsForDate(today);

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
        
        await sendReceiptEmail(
          receipt,
          receipt.tenant,
          receipt.property.user.email,
          pdfBuffer
        );
      }
    } catch (error) {
      console.error(`Error sending receipt ${receipt.id}: ${error}`);
    }
  }

  return Response.json({ success: true });
}
