import { prisma } from "@/prisma/db"
import type { user } from "@prisma/client"
import type { UpdateUserOutput } from "./schemas"

export async function updateUser(input: UpdateUserOutput): Promise<user> {
    return prisma.user.update({
        where: { id: input.id },
        data: {
            name: input.name,
            email: input.email,
            image: "",
            address: input.address,
            city: input.city,
            state: input.state,
            country: input.country,
            postalCode: input.postalCode,
            updatedAt: new Date(),
        },
    })
}