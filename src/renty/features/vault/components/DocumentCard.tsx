"use client"

import { useState } from "react"
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
import { useToast } from "@/hooks/use-toast"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EditDocumentDialog } from "./EditDocumentDialog"
import { deleteDocumentAction } from "../actions"

interface DocumentCardProps {
    document: DocumentType
    propertyId: string
}

export function DocumentCard({ document, propertyId }: DocumentCardProps) {
    const t = useTranslations('documents')
    const { toast } = useToast()
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

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

    // Handle document deletion
    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteDocumentAction(document.id, propertyId)
            if (!result.success) {
                throw new Error(result.error)
            }
            toast({
                title: t('success'),
                description: t('document-deleted-successfully'),
            })
        } catch (error) {
            console.error('Error deleting document:', error)
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error instanceof Error ? error.message : t('error-deleting-document'),
            })
        } finally {
            setIsDeleting(false)
            setIsDeleteAlertOpen(false)
        }
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
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center flex-1 min-w-0">
                    <div className="text-gray-400 mr-3">
                        {getFileIcon()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{document.name}</h3>
                            <span className="text-xs text-gray-500 ml-2">{formatFileSize(document.fileSize)}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span className="truncate">
                                {document.description && `${document.description} • `}
                                {t('uploaded-on')} {format(new Date(document.uploadedAt), 'PPP')}
                            </span>
                        </div>
                        <div className="mt-1">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
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
                            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                {t('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => setIsDeleteAlertOpen(true)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Delete confirmation dialog */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirm-delete')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('delete-document-confirmation')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }} 
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? t('deleting') : t('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit document dialog */}
            <EditDocumentDialog 
                document={document}
                propertyId={propertyId}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />
        </>
    )
}
