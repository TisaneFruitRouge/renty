"use client"

import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { 
    Download, 
    Trash2, 
    FileText, 
    FileImage, 
    FileArchive,
    FileSpreadsheet,
    FileCode,
    MoreVertical,
    Pencil
} from "lucide-react"
import { type document as DocumentType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditDocumentDialog } from "./EditDocumentDialog"
import { DeleteDocumentAlert } from "./DeleteDocumentAlert"

interface DocumentCardProps {
    document: DocumentType
    propertyId: string
}

export function DocumentCard({ document, propertyId }: DocumentCardProps) {
    const t = useTranslations('documents')

    // Function to get the appropriate icon based on file type
    const getFileIcon = () => {
        const fileType = document.fileType.toLowerCase()
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileType)) {
            return <FileImage className="h-5 w-5" />
        } else if (['pdf'].includes(fileType)) {
            return <FileText className="h-5 w-5" />
        } else if (['xlsx', 'xls', 'csv'].includes(fileType)) {
            return <FileSpreadsheet className="h-5 w-5" />
        } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(fileType)) {
            return <FileArchive className="h-5 w-5" />
        } else if (['html', 'css', 'js', 'json', 'xml'].includes(fileType)) {
            return <FileCode className="h-5 w-5" />
        } else {
            return <FileText className="h-5 w-5" />
        }
    }

    // Format file size for display
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
        else return (bytes / 1048576).toFixed(1) + ' MB'
    }



    // Get category label
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
            'OTHER': t('category-other')
        }
        return categories[category] || category
    }

    return (
        <>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:border-border/80 transition-colors">
                <div className="flex items-center flex-1 min-w-0">
                    <div className="text-muted-foreground mr-3">
                        {getFileIcon()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium truncate">{document.name}</h3>
                            <span className="text-xs text-muted-foreground ml-2">{formatFileSize(document.fileSize)}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span className="truncate">
                                {document.description && `${document.description} • `}
                                {t('uploaded-on')} {format(new Date(document.uploadedAt), 'PPP')}
                            </span>
                        </div>
                        <div className="mt-1">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                                {getCategoryLabel(document.category)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center ml-4 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        asChild
                    >
                        <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" download>
                            <Download className="h-4 w-4" />
                            <span className="sr-only">{t('download')}</span>
                        </a>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">{t('actions')}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <EditDocumentDialog 
                                document={document} 
                                propertyId={propertyId}
                            >
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    {t('edit')}
                                </DropdownMenuItem>
                            </EditDocumentDialog>
                            <DeleteDocumentAlert
                                document={document}
                                propertyId={propertyId}
                            >
                                <DropdownMenuItem 
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t('delete')}
                                </DropdownMenuItem>
                            </DeleteDocumentAlert>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>




        </>
    )
}
