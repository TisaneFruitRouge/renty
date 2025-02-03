import { getPropertyById } from "@/features/properties/db"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import HeaderCard from "@/features/properties/components/property-detail/HeaderCard"
import RentalCard from "@/features/properties/components/property-detail/RentalCard"
import { getTranslations } from "next-intl/server"
import TenantSection from "@/features/tenant/components/TenantSection"
import { getTenantByPropertyId } from "@/features/tenant/actions"
import RentReceiptSettings from "@/features/properties/components/property-detail/RentReceiptSettings"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface PropertyPageProps {
    params: Promise<{ id: string }>
}

export default async function PropertyPage({ params }: PropertyPageProps) {
    
    const t = await getTranslations('property');
    
    let property;
    const { id } = await params;
    try {
        property = await getPropertyById(id);
    } catch {
        notFound();
    }

    const session = await auth.api.getSession({
        headers: await headers()
    })

    const userId = session?.user?.id;

    if (userId !== property.userId) {
        redirect("/");
    }

    if (!property) {
        notFound();
    }

    const tenant = await getTenantByPropertyId(id);

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between">
                <Link href="/">
                    <Button variant="ghost">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        {t("back-to-properties")}
                    </Button>
                </Link>
                <RentReceiptSettings property={property} />
            </div>
            <div className="flex flex-col gap-4">
                <HeaderCard property={property} />
                <RentalCard property={property} />
                <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-xl font-semibold mb-4">{t('tenant.title')}</h2>
                    <TenantSection propertyId={id} initialTenant={tenant} />
                </div>
            </div> 
        </div>
    )
}