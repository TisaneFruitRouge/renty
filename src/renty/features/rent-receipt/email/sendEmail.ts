import { Resend } from 'resend';
import type { rentReceipt, tenant } from '@prisma/client';

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
    html: `<p>Bonjour ${tenant.fistName},</p>
           <p>Veuillez trouver ci-joint votre quittance de loyer pour ${month}.</p>
           <p>Cordialement,<br>Renty</p>`,
    attachments: [{
      filename: `quittance-${month}.pdf`,
      content: pdfBuffer
    }]
  });
}
