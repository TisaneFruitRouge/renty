'use server'

import { z } from "zod"
import { prisma } from "@/prisma/db"
import createReceipt, { addBlobUrlToRceipt, deleteReceipt } from "./db"
import { generatePDF } from "./pdf/generatePDF"
import { deleteReceiptFromBlob, saveReceiptToBlob } from "./blob"
import { sendReceiptEmail } from "./email/sendEmail"
import { createReceiptSchema } from "./schemas"
import type { RentReceiptStatus } from "@prisma/client";
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
            tenants: true,
            user: true
        }
    })
    
    if (!property) {
      throw new Error(`Property with id: ${propertyId} was not found`);
    }

    let createdReceipt;

    try {
    
        createdReceipt = await createReceipt(
          startDate,
          endDate,
          baseRent,
          charges,
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
        
        if (sendMail) {
            // send mail
            await sendReceiptEmail(
                createdReceipt,
                property.tenants[0],
                property.user.email,
                pdfBuffer
            );
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