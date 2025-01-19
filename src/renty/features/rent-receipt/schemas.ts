import { z } from "zod";

export const createReceiptSchema = z.object({
    propertyId: z.string({
        required_error: 'property-required',
    }),
    startDate: z.date({
        required_error: 'start-date-required',
    }),
    endDate: z.date({
        required_error: 'end-date-required',
    })
    //@ts-expect-error: I cannot find a way to correctly type the arguments
    .refine((date, ctx) => {
        if (!ctx || !ctx.parent) return true;

        const startDate = ctx.parent.startDate;
        if (date < startDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'end-date-after-start',
            });
            return false;
        }
        return true;
    }),
    baseRent: z.number({
        required_error: 'base-rent-required',
    }).min(0, 'base-rent-positive'),
    charges: z.number({
        required_error: 'charges-required',
    }).min(0, 'charges-positive'),
});