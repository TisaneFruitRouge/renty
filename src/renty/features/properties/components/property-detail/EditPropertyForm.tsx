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
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CalendarIcon, Home, Euro } from "lucide-react"
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
            rentDetails: property.rentDetails as { baseRent: number; charges: number } ?? {
                baseRent: 0,
                charges: 0,
            },
            currency: property.currency ?? 'EUR',
            paymentFrequency: property.paymentFrequency as "biweekly" | "monthly" | "quarterly" | "yearly" ?? 'monthly',
            depositAmount: property.depositAmount ?? 0,
            rentedSince: property.rentedSince ?? new Date(),
            isFurnished: property.isFurnished ?? false,
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
                <Tabs defaultValue="property" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="property" className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            {t('form.property-details')}
                        </TabsTrigger>
                        <TabsTrigger value="rental" className="flex items-center gap-2">
                            <Euro className="h-4 w-4" />
                            {t('form.rental-details')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="property" className="mt-4 space-y-4">
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
                    </TabsContent>

                    <TabsContent value="rental" className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="rentDetails.baseRent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('form.base-rent')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="rentDetails.charges"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('form.charges')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('form.currency')}</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('form.select-currency')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentFrequency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('form.payment-frequency')}</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('form.select-frequency')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="biweekly">{t('form.biweekly')}</SelectItem>
                                                <SelectItem value="monthly">{t('form.monthly')}</SelectItem>
                                                <SelectItem value="quarterly">{t('form.quarterly')}</SelectItem>
                                                <SelectItem value="yearly">{t('form.yearly')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="depositAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('form.deposit-amount')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="rentedSince"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>{t('form.rented-since')}</FormLabel>
                                    <Popover modal>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(new Date(field.value), "PPP")
                                                    ) : (
                                                        <span>{t('form.pick-date')}</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={new Date(field.value)}
                                                onSelect={(date) => field.onChange(date)}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isFurnished"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            {t('form.furnished')}
                                        </FormLabel>
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
                    </TabsContent>
                </Tabs>
                
                <Button type="submit" className="w-full">
                    {t('edit-form.submit')}
                </Button>
            </form>
        </Form>
    )
}
