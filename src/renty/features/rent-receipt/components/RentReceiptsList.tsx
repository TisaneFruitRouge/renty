'use client'

import { property, rentReceipt, tenant } from "@prisma/client"
import { RentReceiptItem } from "./RentReceiptItem"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ReceiptText } from "lucide-react"
import CreateRentReceiptModal from "./CreateRentReceiptModal"
import { Pagination } from "@/components/ui/pagination"
import { useState } from "react"

const PAGE_SIZE = 15

interface RentReceiptsListProps {
  receipts: (rentReceipt & { property: property; tenant: tenant })[]
  properties: property[]
}

export default function RentReceiptsList({ receipts, properties }: RentReceiptsListProps) {
  const t = useTranslations('rent-receipts')
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(receipts.length / PAGE_SIZE)
  const paginated = receipts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 mt-12 bg-muted/20 border border-border rounded-md p-12 text-center">
        <div className="bg-background p-4 rounded-md border border-border">
          <ReceiptText className="h-16 w-16 text-primary" />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-semibold">{t('no-receipts')}</h2>
          <p className="text-muted-foreground">
            {t('empty-state-description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <CreateRentReceiptModal properties={properties} />

          <Link href="/properties">
            <Button variant="outline" className="gap-2 w-full">
              {t('manage-properties')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* List with single outer border, internal dividers */}
      <div className="border border-border rounded-md overflow-hidden">
        {/* Column headers */}
        <div className="flex items-center px-4 py-2 bg-muted/40 border-b border-border">
          <span className="flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('column.receipt')}
          </span>
          <span className="shrink-0 mx-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('column.status')}
          </span>
          <span className="shrink-0 w-20 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide mr-9">
            {t('column.amount')}
          </span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {paginated.map((receipt) => (
            <RentReceiptItem key={receipt.id} receipt={receipt} />
          ))}
        </div>
      </div>

      {/* Footer: count + pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          {t('pagination.showing', {
            from: (page - 1) * PAGE_SIZE + 1,
            to: Math.min(page * PAGE_SIZE, receipts.length),
            total: receipts.length,
          })}
        </p>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            setPage(p)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      </div>
    </div>
  )
}
