'use server'

import type { z } from "zod"
import { prisma } from "@/prisma/db"
import createReceipt, { addBlobUrlToReceipt, deleteReceipt, createSharedReceipt } from "./db"
import { generatePDF } from "./pdf/generatePDF"
import { deleteReceiptFromBlob, saveReceiptToBlob } from "./blob"
import { sendReceiptEmail } from "./email/sendEmail"
import type { createReceiptSchema } from "./schemas"
import { RentReceiptStatus, type rentReceipt } from "@prisma/client";
import { updateReceiptStatus } from "./db";

type createRentReceiptInput = z.infer<typeof createReceiptSchema>

export async function createRentReceiptAction(sendMail = true, {
    propertyId,
    baseRent,
    charges,
    startDate,
    endDate
}: createRentReceiptInput) {

    const property = await prisma.property.findUnique({
        where: {
            id: propertyId
        },
        include: {
            leases: {
                where: {
                    status: 'ACTIVE'
                },
                include: {
                    tenants: true
                }
            },
            user: true
        }
    })

    if (!property) {
      throw new Error(`Property with id: ${propertyId} was not found`);
    }

    if (!property.leases || property.leases.length === 0) {
      throw new Error(`No active leases found for property ${propertyId}`);
    }

    const activeLease = property.leases[0];
    if (!activeLease.tenants || activeLease.tenants.length === 0) {
      throw new Error(`No tenants found in active lease for property ${propertyId}`);
    }

    let createdReceipt: rentReceipt | null = null;
    const isShared = activeLease.leaseType === 'SHARED' && activeLease.tenants.length > 1;

    try {
        let pdfBuffer: Buffer;

        if (isShared) {
            createdReceipt = await createSharedReceipt(
                startDate,
                endDate,
                baseRent,
                charges,
                activeLease.paymentFrequency,
                property.id,
                activeLease.tenants.map(t => t.id)
            );

            if (!createdReceipt) {
                throw new Error(`Error creating shared receipt for property ${property.id}`);
            }

            pdfBuffer = await generatePDF({
                receipt: createdReceipt,
                property,
                tenants: activeLease.tenants
            });
        } else {
            createdReceipt = await createReceipt(
                startDate,
                endDate,
                baseRent,
                charges,
                activeLease.paymentFrequency,
                property.id,
                activeLease.tenants[0].id
            );

            if (!createdReceipt) {
                throw new Error(`Error creating receipt for property ${property.id}`);
            }

            pdfBuffer = await generatePDF({
                receipt: createdReceipt,
                property,
                tenant: activeLease.tenants[0]
            });
        }

        const url = await saveReceiptToBlob(pdfBuffer);

        if (!url) {
          throw new Error(`Error saving receipt for property ${property.id}`);
        }

        await addBlobUrlToReceipt(createdReceipt.id, url);

        if (sendMail) {
            const recipients = isShared ? activeLease.tenants : [activeLease.tenants[0]];
            for (const recipient of recipients) {
                await sendReceiptEmail(
                    createdReceipt,
                    recipient,
                    property.user.email,
                    pdfBuffer
                );
            }
        }

        return createdReceipt;

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

export async function updateRentReceiptStatusAction(id: string, newStatus: RentReceiptStatus) {
  'use server'
  await updateReceiptStatus(id, newStatus);
}

export async function sendRentReceiptAction(id: string) {
  const receipt = await prisma.rentReceipt.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          user: true
        }
      },
      tenant: true,
      lease: {
        include: {
          tenants: true
        }
      }
    }
  });

  if (!receipt || !receipt.blobUrl) {
    throw new Error('Receipt not found or no PDF generated');
  }

  // Fetch the PDF content from the blob URL
  const pdfResponse = await fetch(receipt.blobUrl);
  if (!pdfResponse.ok) {
    throw new Error(`Failed to fetch PDF from blob storage: ${pdfResponse.statusText}`);
  }
  const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

  const isShared = receipt.lease?.leaseType === 'SHARED' && (receipt.lease?.tenants?.length ?? 0) > 1;
  const recipients = isShared ? receipt.lease!.tenants : [receipt.tenant];

  for (const recipient of recipients) {
    await sendReceiptEmail(
      receipt,
      recipient,
      receipt.property.user.email,
      pdfBuffer
    );
  }

  // Update status to PAID
  await updateReceiptStatus(id, RentReceiptStatus.PAID);
}
