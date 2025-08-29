"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { type document as DocumentType } from "@prisma/client"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DocumentCard } from "./DocumentCard"
import { UploadDocumentDialog } from "./UploadDocumentDialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DocumentVaultProps {
    documents: DocumentType[]
    propertyId: string
}

export function DocumentVault({ documents, propertyId }: DocumentVaultProps) {
    const t = useTranslations('documents')
    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL")

    // Filter documents based on search query and category
    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = 
            doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
        
        const matchesCategory = categoryFilter === "ALL" || doc.category === categoryFilter
        
        return matchesSearch && matchesCategory
    })

    // Group documents by category for better organization
    const groupedDocuments: Record<string, DocumentType[]> = {}
    
    if (categoryFilter === "ALL") {
        // If no category filter, group by category
        filteredDocuments.forEach(doc => {
            if (!groupedDocuments[doc.category]) {
                groupedDocuments[doc.category] = []
            }
            groupedDocuments[doc.category].push(doc)
        })
    } else {
        // If category filter is applied, just use a single group
        groupedDocuments[categoryFilter] = filteredDocuments
    }

    // Get category label for display
    const getCategoryLabel = (category: string) => {
        const categories: Record<string, string> = {
            'LEASE': t('category-lease'),
            'INVENTORY': t('category-inventory'),
            'INSURANCE': t('category-insurance'),
            'MAINTENANCE': t('category-maintenance'),
            'PAYMENT': t('category-payment'),
            'CORRESPONDENCE': t('category-correspondence'),
            'LEGAL': t('category-legal'),
            'UTILITY': t('category-utility'),
            'OTHER': t('category-other'),
            'ALL': t('all-categories')
        }
        return categories[category] || category
    }

    return (
        <div className="bg-card rounded-xl shadow-sm border border-border">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">{t('document-vault')}</h2>
                    <UploadDocumentDialog propertyId={propertyId} />
                </div>

                {/* Search and filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('search-documents')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full sm:w-48 flex items-center">
                        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Select
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('filter-by-category')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{t('all-categories')}</SelectItem>
                                <SelectItem value="LEASE">{t('category-lease')}</SelectItem>
                                <SelectItem value="INVENTORY">{t('category-inventory')}</SelectItem>
                                <SelectItem value="INSURANCE">{t('category-insurance')}</SelectItem>
                                <SelectItem value="MAINTENANCE">{t('category-maintenance')}</SelectItem>
                                <SelectItem value="PAYMENT">{t('category-payment')}</SelectItem>
                                <SelectItem value="CORRESPONDENCE">{t('category-correspondence')}</SelectItem>
                                <SelectItem value="LEGAL">{t('category-legal')}</SelectItem>
                                <SelectItem value="UTILITY">{t('category-utility')}</SelectItem>
                                <SelectItem value="OTHER">{t('category-other')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Document list */}
                {filteredDocuments.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">{t('no-documents-found')}</p>
                        {documents.length > 0 && (
                            <Button 
                                variant="link" 
                                onClick={() => {
                                    setSearchQuery("")
                                    setCategoryFilter("ALL")
                                }}
                            >
                                {t('clear-filters')}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedDocuments).map(([category, docs]) => (
                            <div key={category}>
                                {categoryFilter === "ALL" && (
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                                        {getCategoryLabel(category)} ({docs.length})
                                    </h3>
                                )}
                                <div className="space-y-3">
                                    {docs.map(doc => (
                                        <DocumentCard 
                                            key={doc.id} 
                                            document={doc} 
                                            propertyId={propertyId} 
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
