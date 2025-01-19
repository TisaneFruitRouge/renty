'use client'

import { useEffect, useState } from 'react'
import type { property, rentReceipt, tenant, user } from '@prisma/client'
import { RentReceiptTemplate } from '../pdf/RentReceiptTemplate'
import { pdf } from '@react-pdf/renderer'
import { useTranslations } from 'next-intl'

interface RentReceiptPreviewProps {
    receipt: rentReceipt & {
        property: property & { user: user }
        tenant: tenant
    }
}

export function RentReceiptPreview({ receipt }: RentReceiptPreviewProps) {
    const [url, setUrl] = useState<string>()
    const t = useTranslations('rent-receipts.detail')

    useEffect(() => {
        async function generatePreview() {
            try {
                const blob = await pdf(
                    RentReceiptTemplate({
                        receipt,
                        property: receipt.property,
                        tenant: receipt.tenant,
                    })
                ).toBlob()
                const url = URL.createObjectURL(blob)
                setUrl(url)

                return () => {
                    URL.revokeObjectURL(url)
                }
            } catch (error) {
                console.error('Error generating preview:', error)
            }
        }

        generatePreview()
    }, [receipt])

    if (!url) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
                {t('loading')}
            </div>
        )
    }

    return (
        <iframe
            src={url}
            className="w-full h-[calc(100vh-12rem)] rounded-lg border shadow-sm"
            title="Receipt preview"
        />
    )
}
