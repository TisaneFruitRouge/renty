"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Pencil } from "lucide-react"
import { updatePropertySchema } from "../../schemas"
import { updatePropertyAction } from "../../actions"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { z } from "zod"
import { useState } from "react"
import type { property } from "@prisma/client"

interface EditPropertyModalProps {
    property: property
}

export default function EditPropertyModal({ property }: EditPropertyModalProps) {
    const { toast } = useToast()
    const router = useRouter()
    const t = useTranslations('property')
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof updatePropertySchema>>({
        resolver: zodResolver(updatePropertySchema),
        defaultValues: {
            title: property.title,
            address: property.address,
            city: property.city,
            state: property.state,
            country: property.country,
            postalCode: property.postalCode,
        }
    })

    async function onSubmit(values: z.infer<typeof updatePropertySchema>) {
        try {
            setLoading(true)
            const { data: updatedProperty } = await updatePropertyAction({
                id: property.id,
                ...values
            })
            toast({
                title: t('edit-form.success'),
                description: updatedProperty?.title || "",
            })
            router.refresh()
        } catch (error) {
            console.error("Form submission error", error)
            toast({
                variant: "destructive",
                title: t('edit-form.error'),
                description: error instanceof Error ? error.message : t('edit-form.error'),
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('edit-form.title')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('form.title.label')}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder={t('form.title.placeholder')}
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>{t('form.title.description')}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('form.address.label')}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder={t('form.address.placeholder')}
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>{t('form.address.description')}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('form.city.label')}</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder={t('form.city.placeholder')}
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('form.state.label')}</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder={t('form.state.placeholder')}
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('form.country.label')}</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder={t('form.country.placeholder')}
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="postalCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('form.postal-code.label')}</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder={t('form.postal-code.placeholder')}
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button 
                            disabled={loading}
                            type="submit" 
                            className="w-full"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('edit-form.submit')}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
