import { Resend } from 'resend';
import type { rentReceipt, tenant } from '@prisma/client';
import RentReceiptEmail from './RentReceiptEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long'
  }).format(date);
}

export async function sendReceiptEmail(
  receipt: rentReceipt,
  tenant: tenant,
  landlordEmail: string,
  pdfBuffer: Buffer
) {
  const month = formatDate(receipt.startDate);
  
  await resend.emails.send({
    from: 'Renty <little-bot@renty.cc>',
    to: tenant.email,
    cc: landlordEmail,
    subject: `Quittance de loyer - ${month}`,
    react: RentReceiptEmail({
      tenantName: tenant.firstName,
      month: month
    }),
    attachments: [{
      filename: `quittance-${month}.pdf`,
      content: pdfBuffer
    }]
  });
}
