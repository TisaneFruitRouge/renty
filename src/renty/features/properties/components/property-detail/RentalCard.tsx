import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { property } from "@prisma/client"
import { getTranslations } from "next-intl/server"
import EditRentalModal from "./EditRentalModal"

interface RentalCardProps {
    property: property
}

export default async function RentalCard({ property }: RentalCardProps) {
    const t = await getTranslations('property');

    // Dummy data for now
    const rentalInfo = {
        rentDetails: property.rentDetails as { baseRent: number; charges: number } ?? {
            baseRent: 0,
            charges: 0,
        },
        currency: property.currency ?? "EUR",
        paymentFrequency: (property.paymentFrequency as "biweekly" | "monthly" | "quarterly" | "yearly" | undefined ) ?? "monthly",
        depositAmount: property.depositAmount ?? 0,
        rentedSince: property.rentedSince ? new Date(property.rentedSince).toISOString().split('T')[0] : "",
        isFurnished: property.isFurnished ?? false,
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">{t('rental-details')}</h2>
                        <div className="flex items-center text-muted-foreground">
                            <p>{t('rental-description')}</p>
                        </div>
                    </div>
                    <EditRentalModal property={property} />
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">{t('pricing')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('base-rent')}</p>
                                <p>{rentalInfo.rentDetails.baseRent} {rentalInfo.currency} / {t(`rental.payment-frequency.${rentalInfo.paymentFrequency}`)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('charges')}</p>
                                <p>{rentalInfo.rentDetails.charges} {rentalInfo.currency} / {t(`rental.payment-frequency.${rentalInfo.paymentFrequency}`)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('total-rent')}</p>
                                <p className="font-semibold">{rentalInfo.rentDetails.baseRent + rentalInfo.rentDetails.charges} {rentalInfo.currency} / {t(`rental.payment-frequency.${rentalInfo.paymentFrequency}`)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('deposit')}</p>
                                <p>{rentalInfo.depositAmount} {rentalInfo.currency}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">{t('duration')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('rented-since')}</p>
                                <p>{new Date(rentalInfo.rentedSince).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('lease-duration')}</p>
                                <p>{rentalInfo.isFurnished ? t('one-year-lease') : t('three-year-lease')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
