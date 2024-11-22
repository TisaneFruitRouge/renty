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
import { Loader2, Plus } from "lucide-react"
import { createPropertySchema } from "../schemas"
import { createPropertyAction } from "../actions"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { z } from "zod"
import { useState } from "react"

export default function CreatePropertyModal() {
    const { toast } = useToast()
    const router = useRouter()
    const t = useTranslations('property')

    const [loading, setLoading] = useState(false);

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
    });

    async function onSubmit(values: z.infer<typeof createPropertySchema>) {
        try {
            setLoading(true);
            const {data: property} = await createPropertyAction(values)
            toast({
                title: t('create-form.success'),
                description: property?.title || "",
            });
            router.push(`property/${property?.id}`)
        } catch (error) {
            console.error("Form submission error", error)
            toast({
                variant: "destructive",
                title: t('create-form.error'),
                description: error instanceof Error ? error.message : t('create-form.error'),
            })
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('create-form.title')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('create-form.title')}</DialogTitle>
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
                            {loading && <Loader2 className="animate-spin" />}
                            {t('create-form.submit')}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}