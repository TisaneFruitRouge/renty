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
import { Plus } from "lucide-react"
import { createPropertySchema } from "../schemas"
import { createPropertyAction } from "../actions"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { z } from "zod"

export default function CreatePropertyModal() {
    const { toast } = useToast()
    const router = useRouter()
    const t = useTranslations('property-form')

    const form = useForm<z.infer<typeof createPropertySchema>>({
        resolver: zodResolver(createPropertySchema),
        defaultValues: {
            title: "",
            address: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
        }
    })

    async function onSubmit(values: z.infer<typeof createPropertySchema>) {
        try {
            const {data: property} = await createPropertyAction(values)
            toast({
                title: t('success'),
                description: property?.title || "",
            });
            router.push(`property/${property?.id}`)
        } catch (error) {
            console.error("Form submission error", error)
            toast({
                title: t('error'),
                description: error instanceof Error ? error.message : t('error'),
            })
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('add-property')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('create-title')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('title.label')}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder={t('title.placeholder')}
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>{t('title.description')}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('address.label')}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder={t('address.placeholder')}
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>{t('address.description')}</FormDescription>
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
                                        <FormLabel>{t('city.label')}</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder={t('city.placeholder')}
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
                                        <FormLabel>{t('state.label')}</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder={t('state.placeholder')}
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
                                        <FormLabel>{t('country.label')}</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder={t('country.placeholder')}
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
                                        <FormLabel>{t('postal-code.label')}</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder={t('postal-code.placeholder')}
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" className="w-full">{t('submit')}</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}