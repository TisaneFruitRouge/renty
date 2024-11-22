import { z } from "zod"

export const createPropertySchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
    country: z.string().min(2, "Country must be at least 2 characters"),
    postalCode: z.string().min(4, "Postal code must be at least 4 characters"),
})

export const updatePropertySchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
    country: z.string().min(2, "Country must be at least 2 characters"),
    postalCode: z.string().min(4, "Postal code must be at least 4 characters"),
})

export const rentalFormSchema = z.object({
    rentDetails: z.object({
        baseRent: z.number().min(0),
        charges: z.number().min(0),
    }),
    currency: z.string(),
    paymentFrequency: z.enum(["biweekly", "monthly", "quarterly", "yearly"]),
    depositAmount: z.number().min(0),
    rentedSince: z.string(),
    isFurnished: z.boolean(),
})

export type RentalFormValues = z.infer<typeof rentalFormSchema>
