import { renderToBuffer } from '@react-pdf/renderer';
import { RentReceiptTemplate } from './RentReceiptTemplate';
import type { rentReceipt, property, tenant, user } from '@prisma/client';

export async function generatePDF(
  receipt: rentReceipt,
  property: property & {user: user},
  tenant: tenant
): Promise<Buffer> {
  try {
    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      RentReceiptTemplate({ 
        receipt,
        property,
        tenant,
      })
    );

    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}