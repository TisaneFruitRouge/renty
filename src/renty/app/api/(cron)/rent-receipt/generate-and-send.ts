import { getAllPropertiesWithActiveTenants } from '@/features/properties/db';
import createReceipt, { deleteReceipt } from '@/features/rent-receipt/db';
import { sendReceiptEmail } from '@/features/rent-receipt/email/sendEmail';
import { generatePDF } from '@/features/rent-receipt/pdf/generatePDF';
import { parseRentDetails, shouldGenerateReceipt } from '@/features/rent-receipt/utils';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  const properties = await getAllPropertiesWithActiveTenants();
  const today = new Date();

  const propertiesThatNeedReceipts = properties.filter(property => 
    shouldGenerateReceipt(property, today)
  );

  for (const property of propertiesThatNeedReceipts) {
    let createdReceipt = null;
    try {
      const rentDetails = parseRentDetails(property.rentDetails);
      if (!rentDetails) {
        throw new Error(`Error parsing rent details for property ${property.id}`);
      }

      createdReceipt = await createReceipt(
        new Date(),
        new Date(),
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

      // send mail
      await sendReceiptEmail(
        createdReceipt,
        property.tenants[0],
        property.user.email,
        pdfBuffer
      );

    } catch (error) {
      console.error(`Error processing receipt for property ${property.id}: ${error}`);
      if (createdReceipt) {
        try {
          await deleteReceipt(createdReceipt.id);
          console.log(`Cleaned up receipt ${createdReceipt.id} after error`);
        } catch (deleteError) {
          console.error(`Failed to clean up receipt ${createdReceipt.id}: ${deleteError}`);
        }
      }
    }
  }

  return Response.json({ success: true });
}