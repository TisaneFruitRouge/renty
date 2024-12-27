import { renderToBuffer } from '@react-pdf/renderer';
import { RentReceiptTemplate } from './RentReceiptTemplate';
import { rentReceipt, property, tenant } from '@prisma/client';

export async function generatePDF(
  receipt: rentReceipt,
  property: property,
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