import { getLeasesRequiringReceiptGeneration, updateNextReceiptDate } from '@/features/lease/db';
import { deleteReceiptFromBlob, saveReceiptToBlob } from '@/features/rent-receipt/blob';
import createReceipt, { addBlobUrlToReceipt, deleteReceipt, createSharedReceipt } from '@/features/rent-receipt/db';
import { sendReceiptReviewEmail } from '@/features/rent-receipt/email/sendReviewEmail';
import { generatePDF } from '@/features/rent-receipt/pdf/generatePDF';
import { getMonthRange, computeNextReceiptDate } from '@/features/rent-receipt/utils';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, {
      status: 401,
    });
  }

  const leases = await getLeasesRequiringReceiptGeneration();
  const today = new Date();
  console.log(`Processing ${leases.length} leases for receipt generation`);

  for (const lease of leases) {
    const createdReceipts: Array<{ id: string; blobUrl: string | null }> = [];
    try {
      const { startDate, endDate } = getMonthRange(today);

      if (!lease.tenants || lease.tenants.length === 0) {
        console.warn(`No tenant found for lease ${lease.id}, skipping`);
        continue;
      }

      const rentDetails = {
        baseRent: lease.rentAmount,
        charges: lease.charges || 0
      };

      if (!rentDetails.baseRent) {
        throw new Error(`Error getting rent details from lease ${lease.id}`);
      }

      console.log(`Processing lease ${lease.id} (${lease.leaseType}) with ${lease.tenants.length} tenant(s)`);

      // Handle different lease types
      switch (lease.leaseType) {
        case 'INDIVIDUAL':
        case 'COLOCATION': {
          // For individual and colocation leases: create separate receipts for each tenant
          // Each tenant gets their own receipt (colocation means separate leases per tenant)
          for (const tenant of lease.tenants) {
            const receipt = await createReceipt(
              startDate,
              endDate,
              rentDetails.baseRent,
              rentDetails.charges,
              lease.paymentFrequency,
              lease.propertyId,
              tenant.id,
              lease.id
            );

            if (!receipt) {
              throw new Error(`Error creating receipt for tenant ${tenant.id} in lease ${lease.id}`);
            }

            createdReceipts.push(receipt);

            // Generate PDF for individual tenant
            const pdfBuffer = await generatePDF({
              receipt,
              property: lease.property,
              tenant: tenant
            });

            const url = await saveReceiptToBlob(pdfBuffer);

            if (!url) {
              throw new Error(`Error saving receipt for tenant ${tenant.id} in lease ${lease.id}`);
            }

            await addBlobUrlToReceipt(receipt.id, url);

            // Send review email to landlord for each receipt
            await sendReceiptReviewEmail(receipt, lease.property);

            console.log(`Created individual receipt for tenant ${tenant.firstName} ${tenant.lastName}`);
          }
          break;
        }

        case 'SHARED': {
          // For shared leases: create ONE receipt for ALL tenants with total amount
          const sharedReceipt = await createSharedReceipt(
            startDate,
            endDate,
            rentDetails.baseRent,
            rentDetails.charges,
            lease.paymentFrequency,
            lease.propertyId,
            lease.tenants.map(t => t.id),
            lease.id
          );

          if (!sharedReceipt) {
            throw new Error(`Error creating shared receipt for lease ${lease.id}`);
          }

          createdReceipts.push(sharedReceipt);

          // Generate PDF with all tenants included
          const sharedPdfBuffer = await generatePDF({
            receipt: sharedReceipt,
            property: lease.property,
            tenants: lease.tenants
          });

          const sharedUrl = await saveReceiptToBlob(sharedPdfBuffer);

          if (!sharedUrl) {
            throw new Error(`Error saving shared receipt for lease ${lease.id}`);
          }

          await addBlobUrlToReceipt(sharedReceipt.id, sharedUrl);

          // Send one review email to landlord for the shared receipt
          await sendReceiptReviewEmail(sharedReceipt, lease.property);

          console.log(`Created shared receipt for ${lease.tenants.length} tenants: ${lease.tenants.map(t => `${t.firstName} ${t.lastName}`).join(', ')}`);
          break;
        }

        default:
          console.warn(`Unknown lease type: ${lease.leaseType} for lease ${lease.id}`);
          continue;
      }

      // Update next receipt date, respecting the landlord-configured day of month
      const nextDate = computeNextReceiptDate(today, lease.receiptGenerationDate);
      await updateNextReceiptDate(lease.id, nextDate);

      console.log(`Successfully processed lease ${lease.id}, next receipt date: ${nextDate.toISOString()}`);

    } catch (error) {
      console.error(`Error processing receipt for lease ${lease.id}: ${error}`);

      // Clean up any created receipts on error
      for (const receipt of createdReceipts) {
        try {
          await deleteReceipt(receipt.id);
          if (receipt.blobUrl) {
            await deleteReceiptFromBlob(receipt.blobUrl);
          }
          console.log(`Cleaned up receipt ${receipt.id} due to error`);
        } catch (deleteError) {
          console.error(`Failed to clean up receipt ${receipt.id}: ${deleteError}`);
        }
      }
    }
  }

  console.log(`Finished processing ${leases.length} leases`);
  return Response.json({
    success: true,
    processedLeases: leases.length,
    message: `Processed ${leases.length} leases for receipt generation`
  });
}
