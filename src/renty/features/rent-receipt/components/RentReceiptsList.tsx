import { property, rentReceipt, tenant } from "@prisma/client"
import { RentReceiptItem } from "./RentReceiptItem"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ReceiptText } from "lucide-react"
import CreateRentReceiptModal from "./CreateRentReceiptModal"

interface RentReceiptsListProps {
  receipts: (rentReceipt & { property: property; tenant: tenant })[]
  properties: property[]
}

export default async function RentReceiptsList({ receipts, properties }: RentReceiptsListProps) {
  const t = await getTranslations('rent-receipts')
  const isEmpty = receipts.length === 0

  return (
    <div className="relative">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-6 mt-12 bg-muted/20 border border-border rounded-xl p-12 text-center">
          <div className="bg-background p-4 rounded-full shadow-sm border border-border">
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
      ) : (
        <div>
          {receipts.map((receipt, index) => (
            <RentReceiptItem
              key={receipt.id || index}
              receipt={receipt}
            />
          ))}
        </div>
      )}
    </div>
  )
}
