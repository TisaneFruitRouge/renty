import { useTranslations } from "next-intl"
import { Receipt } from "lucide-react"
import type { property, rentReceipt, tenant } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface RecentPaymentsSectionProps {
    recentPayments: (rentReceipt & { property: property; tenant: tenant })[]
    propertyId: string
}

export default function RecentPaymentsSection({ recentPayments, propertyId }: RecentPaymentsSectionProps) {
    const t = useTranslations('property');
    const t_rentReceiptsStatus = useTranslations('rent-receipts.status');

    return (
        <div className="bg-card rounded-xl shadow-sm border border-border">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{t("recent-payments")}</h2>
                    <Link href={`/rent-receipts?propertyId=${propertyId}`}>
                        <Button variant="ghost">
                            {t("see-more")}
                        </Button>
                    </Link>
                </div> 
                <div className="space-y-4">
                    {recentPayments.map(payment => (
                        <div key={payment.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                            <div className="flex items-center">
                                <Receipt className="h-5 w-5 text-muted-foreground" />
                                <div className="ml-4">
                                    <div className="text-sm font-medium">{payment.tenant.firstName} {payment.tenant.lastName}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {payment.createdAt?.toLocaleDateString('fr-FR')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className="text-sm font-medium mr-4">
                                    {payment.baseRent + payment.charges} €
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'PAID' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                                    {t_rentReceiptsStatus(`${payment.status}`)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
