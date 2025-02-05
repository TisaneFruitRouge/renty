import { getPropertyById } from "@/features/properties/db"
import { ChevronLeft, MapPin } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getAvailableTenants, getTenantByPropertyId } from "@/features/tenant/actions"
import { getRentReceiptsOfProperty } from "@/features/rent-receipt/db"
import PhotosSection from "@/features/properties/components/property-detail/PhotosSection"
import TenantsSection from "@/features/properties/components/property-detail/TenantsSection"
import RecentPaymentsSection from "@/features/properties/components/property-detail/RecentPaymentsSection"
import { PropertyKeyInformation } from "@/features/properties/components/property-detail/PropertyKeyInformation"
import { PropertyQuickActions } from "@/features/properties/components/property-detail/PropertyQuickActions"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import EditPropertyModal from "@/features/properties/components/property-detail/EditPropertyModal"

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
    const availableTenants = await getAvailableTenants();
    const recentPayments = await getRentReceiptsOfProperty(property.id, 2);

    return (
        <div className="p-8">
            {/* Back button and header */}
            <div className="mb-8">
                <Link href="/properties" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {t("back-to-properties")}
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                        <div className="flex items-center text-gray-600 mt-1">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{property.address}, {property.postalCode} {property.city}</span>
                        </div>
                    </div>
                    <EditPropertyModal property={property} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main content - 2 columns */}
                <div className="col-span-2 space-y-6">
                    <PhotosSection property={property} />
                    <TenantsSection 
                        propertyId={id} 
                        initialTenant={tenant} 
                        availableTenants={availableTenants}
                    />
                    <RecentPaymentsSection propertyId={id} recentPayments={recentPayments} />
                    
                    {/* TODO: Documents
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">{t("documents")}</h2>
                                <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
                                    <Plus className="w-4 h-4 mr-1" />
                                    {t("add-document")}
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {[].map((doc: any) => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {t("added-on")} {new Date(doc.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
                                            {t("download")}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div> */}
                </div> 

                {/* Sidebar - Property Details */}
                <div className="space-y-6">
                    <PropertyKeyInformation property={property} />
                    <PropertyQuickActions property={property} />
                </div>
            </div>
        </div>
    );
}