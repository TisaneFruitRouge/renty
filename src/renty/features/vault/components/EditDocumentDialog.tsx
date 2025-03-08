"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { type document as DocumentType, DocumentCategory } from "@prisma/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
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
import { Switch } from "@/components/ui/switch"
import { updateDocumentAction } from "../actions"

interface EditDocumentDialogProps {
    document: DocumentType
    propertyId: string
    children?: React.ReactNode
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    category: z.nativeEnum(DocumentCategory),
    sharedWithTenant: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

export function EditDocumentDialog({ document, propertyId, children }: EditDocumentDialogProps) {
    const t = useTranslations('documents')
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [open, setOpen] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: document.name,
            description: document.description || "",
            category: document.category,
            sharedWithTenant: document.sharedWithTenant || false,
        },
    })

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true)
        try {
            const result = await updateDocumentAction(document.id, propertyId, values)
            if (!result.success) {
                throw new Error(result.error)
            }
            toast({
                title: t('success'),
                description: t('document-updated-successfully'),
            })
            setOpen(false)
        } catch (error) {
            console.error('Error updating document:', error)
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error instanceof Error ? error.message : t('error-updating-document'),
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('edit-document')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <FormField
                            control={form.control}
                            name="sharedWithTenant"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">{t('share-with-tenant')}</FormLabel>
                                        <FormDescription>
                                            {t('share-with-tenant-description')}
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
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
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t('saving') : t('save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
