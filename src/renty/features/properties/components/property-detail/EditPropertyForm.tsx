'use client'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import type { property } from "@prisma/client"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { updatePropertySchema } from "../../schemas"
import { updatePropertyAction } from "../../actions"
import { useToast } from "@/hooks/use-toast"
import type { z } from "zod"

interface EditPropertyFormProps {
    property: property
    onSuccess?: () => void
}

type PropertyFormValues = z.infer<typeof updatePropertySchema>

export function EditPropertyForm({ property, onSuccess }: EditPropertyFormProps) {
    const t = useTranslations('property')
    const { toast } = useToast()

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(updatePropertySchema),
        defaultValues: {
            title: property.title,
            address: property.address,
            city: property.city,
            state: property.state,
            country: property.country,
            postalCode: property.postalCode,

        },
    })

    const onSubmit = async (values: PropertyFormValues) => {

        try {
            const result = await updatePropertyAction({
                id: property.id,
                ...values,
            })

            if (!result.data) {
                throw new Error("Couldn't update property")
            }

            toast({
                title: t('edit-form.success-title'),
                description: t('edit-form.success-description'),
            })

            onSuccess?.()
        } catch {
            toast({
                variant: "destructive",
                title: t('edit-form.error-title'),
                description: t('edit-form.error-description'),
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('form.title')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('form.address')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
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
                                        <FormLabel>{t('form.city')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                                        <FormLabel>{t('form.state')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                                        <FormLabel>{t('form.country')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                                        <FormLabel>{t('form.postal-code')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                </div>

                <Button type="submit" className="w-full">
                    {t('edit-form.submit')}
                </Button>
            </form>
        </Form>
    )
}
