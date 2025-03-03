'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RentReceiptStatus, type property } from "@prisma/client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { useTranslations } from "next-intl"

interface RentReceiptFiltersProps {
    properties: property[];
}

export function RentReceiptFilters({ properties }: RentReceiptFiltersProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const t = useTranslations('rent-receipts')

    const createQueryString = useCallback(
        (name: string, value: string | null) => {
            const params = new URLSearchParams(searchParams)
            if (value === null) {
                params.delete(name)
            } else {
                params.set(name, value)
            }
            return params.toString()
        },
        [searchParams]
    )

    const currentPropertyId = searchParams.get('propertyId')
    const currentStatus = searchParams.get('receiptStatus')

    return (
        <div className="flex gap-4 mb-6">
            <Select
                value={currentPropertyId || ""}
                onValueChange={(value) => {
                    router.push(
                        `${pathname}?${createQueryString(
                            'propertyId',
                            value === "" ? null : value
                        )}`
                    )
                }}
            >
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t('filters.property.all')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('filters.property.all')}</SelectItem>
                    {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                            {property.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={currentStatus || ""}
                onValueChange={(value) => {
                    router.push(
                        `${pathname}?${createQueryString(
                            'receiptStatus',
                            value === "" ? null : value
                        )}`
                    )
                }}
            >
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t('status.all')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('status.all')}</SelectItem>
                    <SelectItem value={RentReceiptStatus.DRAFT}>{t('status.DRAFT')}</SelectItem>
                    <SelectItem value={RentReceiptStatus.PENDING}>{t('status.PENDING')}</SelectItem>
                    <SelectItem value={RentReceiptStatus.PAID}>{t('status.PAID')}</SelectItem>
                    <SelectItem value={RentReceiptStatus.LATE}>{t('status.LATE')}</SelectItem>
                    <SelectItem value={RentReceiptStatus.CANCELLED}>{t('status.CANCELLED')}</SelectItem>
                    <SelectItem value={RentReceiptStatus.UNPAID}>{t('status.UNPAID')}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
