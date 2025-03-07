import type { property, rentReceipt, tenant, user } from '@prisma/client'

interface RentReceiptPreviewProps {
    receipt: rentReceipt & {
        property: property & { user: user }
        tenant: tenant
    }
}

export function RentReceiptPreview({ receipt }: RentReceiptPreviewProps) {

    // TODO: Display error message
    if (!receipt.blobUrl) {
        return null
    }

    return (    
        <iframe
            src={receipt.blobUrl}
            className="w-full h-[calc(100vh-12rem)] rounded-lg border shadow-sm"
            title="Receipt preview"
        />
    )
}
