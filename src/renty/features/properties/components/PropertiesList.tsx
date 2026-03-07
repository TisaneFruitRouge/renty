'use client'

import { useState } from 'react'
import type { property } from "@prisma/client"
import { Building2, ArrowRight, Search } from "lucide-react"
import Property from "./Property"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import CreatePropertyModal from "./CreatePropertyModal"

interface PropertiesListProps {
    properties: property[]
}

export default function PropertiesList({ properties }: PropertiesListProps) {
    const t = useTranslations('property');
    const propertiesT = useTranslations('properties');
    const [search, setSearch] = useState('')

    const filtered = search.trim()
        ? properties.filter(p =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.city.toLowerCase().includes(search.toLowerCase())
        )
        : properties

    return (
        <div className="relative space-y-4">
            {properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-6 mt-12 bg-muted/20 border border-border rounded-md p-12 text-center">
                    <div className="bg-background p-4 rounded-md border border-border">
                        <Building2 className="h-16 w-16 text-primary" />
                    </div>

                    <div className="space-y-2 max-w-md">
                        <h2 className="text-xl font-semibold">{t("no-properties-found")}</h2>
                        <p className="text-muted-foreground">
                            {t("empty-state-description")}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                        <CreatePropertyModal />

                        <Link href="/tenants">
                            <Button variant="outline" className="gap-2 w-full">
                                {propertiesT("explore-features")}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={propertiesT('search-placeholder')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 max-w-sm"
                        />
                    </div>
                    {filtered.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">{propertiesT('no-results')}</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((property) => (
                                <Property key={property.id} property={property} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
