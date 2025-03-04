"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { DocumentCategory } from "@prisma/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Upload, FileUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { uploadDocumentAction } from "../actions"

interface UploadDocumentDialogProps {
    propertyId: string
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    category: z.nativeEnum(DocumentCategory),
})

type FormValues = z.infer<typeof formSchema>

export function UploadDocumentDialog({ propertyId }: UploadDocumentDialogProps) {
    const t = useTranslations('documents')
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            category: DocumentCategory.OTHER,
        },
    })

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files && files.length > 0) {
            setSelectedFile(files[0])
            // Auto-fill name field with file name (without extension)
            const fileName = files[0].name.split('.').slice(0, -1).join('.')
            form.setValue('name', fileName)
        }
    }

    const onSubmit = async (values: FormValues) => {
        if (!selectedFile) {
            toast({
                variant: 'destructive',
                title: t('error'),
                description: t('please-select-file'),
            })
            return
        }

        setIsSubmitting(true)
        try {
            const result = await uploadDocumentAction(propertyId, selectedFile, values)
            if (!result.success) {
                throw new Error(result.error)
            }
            toast({
                title: t('success'),
                description: t('document-uploaded-successfully'),
            })
            // Reset form and close dialog
            form.reset()
            setSelectedFile(null)
            setOpen(false)
        } catch (error) {
            console.error('Error uploading document:', error)
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error instanceof Error ? error.message : t('error-uploading-document'),
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Upload className="h-4 w-4" />
                    {t('upload-document')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('upload-document')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* File upload area */}
                        <div className="grid w-full place-items-center gap-1.5">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                            />
                            <div 
                                onClick={triggerFileInput}
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-gray-300 hover:border-gray-400 cursor-pointer bg-gray-50"
                            >
                                {selectedFile ? (
                                    <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
                                        <FileUp className="h-8 w-8 text-blue-500" />
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <p>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-sm text-gray-600">
                                        <FileUp className="h-8 w-8" />
                                        <p>{t('drag-drop-or-click')}</p>
                                        <p className="text-xs text-gray-500">{t('supported-formats')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('document-name')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('description')}</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('category')}</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('select-category')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
                                {t('cancel')}
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !selectedFile}>
                                {isSubmitting ? t('uploading') : t('upload')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
