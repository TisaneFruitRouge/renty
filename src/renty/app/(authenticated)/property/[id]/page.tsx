import { getPropertyById } from "@/features/properties/db"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import HeaderCard from "@/features/properties/components/property-detail/HeaderCard"
import { getTranslations } from "next-intl/server"

interface PropertyPageProps {
    params: {
        id: string
    }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
    
    const t = await getTranslations('property');
    
    let property;
    const { id } = await params; // weird Next.js 15 thing
    try {
        property = await getPropertyById(id);
    } catch {
        notFound();
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="pl-0">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        {t("back-to-properties")}
                    </Button>
                </Link>
            </div>
            <div className="flex flex-col gap-4">
                <HeaderCard property={property} />
            </div> 
        </div>
    )
}