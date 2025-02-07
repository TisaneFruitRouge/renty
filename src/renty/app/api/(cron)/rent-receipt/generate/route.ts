import { getAllPropertiesWithActiveTenants } from '@/features/properties/db';
import { deleteReceiptFromBlob, saveReceiptToBlob } from '@/features/rent-receipt/blob';
import createReceipt, { addBlobUrlToRceipt, deleteReceipt } from '@/features/rent-receipt/db';
import { sendReceiptReviewEmail } from '@/features/rent-receipt/email/sendReviewEmail';
import { generatePDF } from '@/features/rent-receipt/pdf/generatePDF';
import { parseRentDetails, shouldGenerateReceipt, getMonthRange } from '@/features/rent-receipt/utils';
import { addDays } from 'date-fns';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, {
      status: 401,
    });
  }

  const properties = await getAllPropertiesWithActiveTenants();
  const today = new Date();

  // Check for receipts that will be due in 3 days
  const futureDate = addDays(today, 3);

  const propertiesThatNeedReceipts = properties.filter(property => 
    shouldGenerateReceipt(property, futureDate)
  );

  for (const property of propertiesThatNeedReceipts) {
    let createdReceipt = null;
    try {
      const rentDetails = parseRentDetails(property.rentDetails);
      if (!rentDetails) {
        throw new Error(`Error parsing rent details for property ${property.id}`);
      }

      const { startDate, endDate } = getMonthRange(futureDate);

      createdReceipt = await createReceipt(
        startDate,
        endDate,
        rentDetails.baseRent,
        rentDetails.charges,
        property.paymentFrequency,
        property.id,
        property.tenants[0].id
      );

      if (!createdReceipt) {
        throw new Error(`Error creating receipt for property ${property.id}`);
      }

      // Generate PDF
      const pdfBuffer = await generatePDF(
        createdReceipt,
        property,
        property.tenants[0] 
      );

      const url = await saveReceiptToBlob(pdfBuffer);

      if (!url) {
        throw new Error(`Error saving receipt for property ${property.id}`);
      }

      await addBlobUrlToRceipt(createdReceipt.id, url);

      // Send review email to landlord
      await sendReceiptReviewEmail(createdReceipt, property);

    } catch (error) {
      console.error(`Error processing receipt for property ${property.id}: ${error}`);
      if (createdReceipt) {
        try {
          await deleteReceipt(createdReceipt.id);
          if (createdReceipt.blobUrl) 
            await deleteReceiptFromBlob(createdReceipt.blobUrl);
        } catch (deleteError) {
          console.error(`Failed to clean up receipt ${createdReceipt.id}: ${deleteError}`);
        }
      }
    }
  }

  return Response.json({ success: true });
}