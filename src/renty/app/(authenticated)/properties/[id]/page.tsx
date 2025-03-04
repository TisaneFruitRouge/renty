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
                    
                    {/* Document Vault Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            <div className="p-6 flex-1">
                                <div className="flex items-center mb-3">
                                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h2 className="text-lg font-semibold text-gray-900">{t("documents")}</h2>
                                </div>
                                <p className="text-gray-600 mb-4">{t("documents-description")}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                                        {t("category-lease")}
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-700/10">
                                        {t("category-inventory")}
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
                                        {t("category-insurance")}
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-700/10">
                                        {t("category-legal")}
                                    </span>
                                </div>
                                <Link 
                                    href={`/properties/${id}/vault`}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                >
                                    {t("view-document-vault")}
                                </Link>
                            </div>
                            <div className="bg-primary/5 p-6 flex flex-col justify-center items-center md:w-1/3 border-t md:border-t-0 md:border-l border-gray-200">
                                <svg className="w-16 h-16 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                <p className="text-center text-sm font-medium text-gray-900 mb-1">{t("secure-storage")}</p>
                                <p className="text-center text-xs text-gray-600">{t("secure-storage-description")}</p>
                            </div>
                        </div>
                    </div>
                </div> 

                {/* Sidebar - Property Details */}
                <div className="space-y-6">
                    <PropertyKeyInformation property={property} />
                    <PropertyQuickActions property={property} tenant={tenant} />
                </div>
            </div>
        </div>
    );
}