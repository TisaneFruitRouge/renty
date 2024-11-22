'use client'

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { updateUserAction } from "../actions"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import type { user } from "@prisma/client"
import { updateUserSchema, type UpdateUserInput } from "../schemas"

type UserInfoFormProps = {
    user: user;
    isPending: boolean;
    error: unknown;
}

export function UserInfoForm({ user, isPending, error }: UserInfoFormProps) {
    const t = useTranslations('settings.personal-info-form')
    const { toast } = useToast()

    const form = useForm<UpdateUserInput>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address || "",
            city: user.city || "",
            state: user.state || "",
            country: user.country || "",
            postalCode: user.postalCode || "",
        },
    })

    async function onSubmit(values: UpdateUserInput) {
        try {
            await updateUserAction(values);
            toast({
                title: t('success')
            });
        } catch (error) {
            console.error("Form submission error", error)
            toast({
                variant: "destructive",
                title: t('error'),
                description: error instanceof Error ? error.message : t('error'),
            })
        }
    }

    if (error) {
        return <div>Error loading user data</div>
    }

    if (isPending) {
        return <div>Loading...</div>
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('name.label')}</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={t('name.placeholder')}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('email.label')}</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={t('email.placeholder')}
                                        type="email"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
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
                </div>

                <Button 
                    type="submit" 
                    disabled={form.formState.isSubmitting}
                    className="w-full"
                >
                    {form.formState.isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t('submit')}
                </Button>
            </form>
        </Form>
    )
}
