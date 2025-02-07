import { property, rentReceipt, user } from '@prisma/client';
import { resend } from '@/lib/resend';
import RentReceiptReviewEmail from './RentReceiptReviewEmail';

export async function sendReceiptReviewEmail(
  receipt: rentReceipt,
  property: property & { user: user }
) {
  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/rent-receipts/${receipt.id}`;

  await resend.emails.send({
    from: 'Renty <little-bot@renty.cc>',
    to: property.user.email,
    subject: `Nouvelle quittance à valider - ${property.title}`,
    react: RentReceiptReviewEmail({ 
      landlordName: property.user.name,
      propertyTitle: property.title,
      month: receipt.startDate,
      reviewUrl
    }),
  });
}
