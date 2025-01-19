import { RentReceiptStatus } from "@prisma/client"

export const rentReceiptStatusVariants: Record<RentReceiptStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    PAID: "bg-green-100 text-green-800 hover:bg-green-200",
    LATE: "bg-red-100 text-red-800 hover:bg-red-200",
    UNPAID: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    CANCELLED: "bg-gray-100 text-gray-800 hover:bg-gray-200"
}
