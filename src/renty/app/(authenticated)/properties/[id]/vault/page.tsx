import { getPropertyById } from "@/features/properties/db"
import { getDocumentsForProperty } from "@/features/vault/db"
import { ChevronLeft, MapPin } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { DocumentVault } from "@/features/vault/components/DocumentVault"

interface VaultPageProps {
    params: Promise<{ id: string }>
}

export default async function VaultPage({ params }: VaultPageProps) {
    const t = await getTranslations('documents');
    
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

    // Get all documents for this property
    const documents = await getDocumentsForProperty(id);

    return (
        <div className="p-8">
            {/* Back button and header */}
            <div className="mb-8">
                <Link href={`/properties/${id}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {t("back-to-property")}
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{property.title} - {t("document-vault")}</h1>
                    <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{property.address}, {property.postalCode} {property.city}</span>
                    </div>
                </div>
            </div>

            {/* Document Vault */}
            <DocumentVault documents={documents} propertyId={id} />
        </div>
    );
}
