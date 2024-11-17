import { z } from "zod"

export const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().min(2),
    email: z.string().email(),
    address: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
    postalCode: z.string().optional().or(z.literal("")),
});

export type UpdateUserInput = z.input<typeof updateUserSchema>;
export type UpdateUserOutput = z.output<typeof updateUserSchema>;
