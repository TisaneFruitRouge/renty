"use client"


import { useTranslations } from "next-intl"
import type { lease, property, document as DocumentType } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
    FileText, 
    Upload, 
    Download, 
    Eye, 
    ExternalLink,
    Folder,
    Plus
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

type LeaseWithProperty = lease & {
    property: property
}

interface LeaseDocumentsSectionProps {
    lease: LeaseWithProperty
    documents: DocumentType[]
}

export default function LeaseDocumentsSection({ lease, documents }: LeaseDocumentsSectionProps) {

    const docT = useTranslations('documents')

    // Filter documents that are lease-related
    const leaseDocuments = documents.filter(doc => 
        doc.category === 'LEASE' || 
        doc.name.toLowerCase().includes('bail') ||
        doc.name.toLowerCase().includes('lease') ||
        doc.description?.toLowerCase().includes('bail') ||
        doc.description?.toLowerCase().includes('lease')
    )

    // Get category label
    const getCategoryLabel = (category: string) => {
        const categories: Record<string, string> = {
            'LEASE': docT('category-lease'),
            'INVENTORY': docT('category-inventory'),
            'INSURANCE': docT('category-insurance'),
            'MAINTENANCE': docT('category-maintenance'),
            'PAYMENT': docT('category-payment'),
            'CORRESPONDENCE': docT('category-correspondence'),
            'LEGAL': docT('category-legal'),
            'UTILITY': docT('category-utility'),
            'OTHER': docT('category-other')
        }
        return categories[category] || category
    }

    // Format file size for display
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
        else return (bytes / 1048576).toFixed(1) + ' MB'
    }

    // Get file icon based on type
    const getFileIcon = (fileType: string) => {
        const type = fileType.toLowerCase()
        
        if (['pdf'].includes(type)) {
            return <FileText className="h-4 w-4 text-red-500" />
        } else if (['doc', 'docx'].includes(type)) {
            return <FileText className="h-4 w-4 text-blue-500" />
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) {
            return <FileText className="h-4 w-4 text-green-500" />
        } else {
            return <FileText className="h-4 w-4 text-gray-500" />
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Folder className="h-5 w-5" />
                        Documents du bail
                        <Badge variant="secondary" className="ml-2">
                            {leaseDocuments.length}
                        </Badge>
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link 
                                href={`/properties/${lease.propertyId}/vault`}
                                className="flex items-center gap-2"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Voir le coffre-fort
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {leaseDocuments.length > 0 ? (
                    <div className="space-y-3">
                        {leaseDocuments.map((document) => (
                            <div 
                                key={document.id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {getFileIcon(document.fileType)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-sm truncate">
                                                {document.name}
                                            </h4>
                                            <span className="text-xs text-muted-foreground">
                                                {formatFileSize(document.fileSize)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>
                                                Ajouté le {format(new Date(document.uploadedAt), 'dd/MM/yyyy')}
                                            </span>
                                            <span>•</span>
                                            <Badge variant="outline" className="text-xs">
                                                {getCategoryLabel(document.category)}
                                            </Badge>
                                            {document.sharedWithTenant && (
                                                <>
                                                    <span>•</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        Partagé avec locataire
                                                    </Badge>
                                                </>
                                            )}
                                        </div>
                                        
                                        {document.description && (
                                            <p className="text-xs text-muted-foreground mt-1 truncate">
                                                {document.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 ml-3">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-blue-600 hover:text-blue-800"
                                        asChild
                                    >
                                        <a 
                                            href={document.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </a>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-green-600 hover:text-green-800"
                                        asChild
                                    >
                                        <a 
                                            href={document.fileUrl} 
                                            download
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                        <p className="font-medium mb-2">Aucun document de bail</p>
                        <p className="text-sm mb-4">
                            Les documents liés au bail seront affichés ici
                        </p>
                        <Button asChild variant="outline" size="sm">
                            <Link 
                                href={`/properties/${lease.propertyId}/vault`}
                                className="flex items-center gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                Ajouter des documents
                            </Link>
                        </Button>
                    </div>
                )}

                <Separator className="my-4" />
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span>
                            Total: {leaseDocuments.length} document{leaseDocuments.length > 1 ? 's' : ''}
                        </span>
                        {leaseDocuments.some(doc => doc.sharedWithTenant) && (
                            <span className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                    {leaseDocuments.filter(doc => doc.sharedWithTenant).length} partagé{leaseDocuments.filter(doc => doc.sharedWithTenant).length > 1 ? 's' : ''}
                                </Badge>
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm">
                            <Link 
                                href={`/properties/${lease.propertyId}/vault`}
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-3 w-3" />
                                Gérer documents
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}