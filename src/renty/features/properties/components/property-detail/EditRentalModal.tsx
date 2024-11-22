'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import type { property } from "@prisma/client"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { Pencil } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { rentalFormSchema, type RentalFormValues } from "../../schemas"
import { updatePropertyRentalAction } from "../../actions"
import { useToast } from "@/hooks/use-toast"

interface EditRentalModalProps {
    property: property
}

export default function EditRentalModal({ property }: EditRentalModalProps) {
    const t = useTranslations('property');
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const form = useForm<RentalFormValues>({
        resolver: zodResolver(rentalFormSchema),
        defaultValues: {
            rentDetails: property.rentDetails as { baseRent: number; charges: number } ?? {
                baseRent: 0,
                charges: 0,
            },
            currency: property.currency ?? "EUR",
            paymentFrequency: (property.paymentFrequency as "biweekly" | "monthly" | "quarterly" | "yearly" | undefined ) ?? "monthly",
            depositAmount: property.depositAmount ?? 0,
            rentedSince: property.rentedSince ? new Date(property.rentedSince).toISOString().split('T')[0] : "",
            isFurnished: property.isFurnished ?? false,
        },
    });

    async function onSubmit(data: RentalFormValues) {

        try {
            const result = await updatePropertyRentalAction(property.id, data);
            if (!result.success) {
                throw new Error(result.error);
            }
            setOpen(false);
        } catch (error) {
            console.error("Error updating rental info:", error);
            toast({
                variant: "destructive",
                title: t('edit-form.error'),
                description: error instanceof Error ? error.message : t('edit-form.error'),
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('edit-rental-details')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="rentDetails.baseRent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('base-rent')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="1000"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
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
                                        <FormLabel>{t('charges')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="200"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
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
                                        <FormLabel>{t('rental.currency.select')}</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('rental.currency.select')} />
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
                                        <FormLabel>{t('rental.payment-frequency.select')}</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('rental.payment-frequency.select')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="biweekly">{t('rental.payment-frequency.biweekly')}</SelectItem>
                                                <SelectItem value="monthly">{t('rental.payment-frequency.monthly')}</SelectItem>
                                                <SelectItem value="quarterly">{t('rental.payment-frequency.quarterly')}</SelectItem>
                                                <SelectItem value="yearly">{t('rental.payment-frequency.yearly')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="depositAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('deposit')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="2400"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
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
                                    <FormItem>
                                        <FormLabel>{t('rented-since')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
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
                                name="isFurnished"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('rental.furnished.select')}</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => field.onChange(value === 'true')}
                                                value={String(field.value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('rental.furnished.select')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">{t('rental.furnished.yes')}</SelectItem>
                                                    <SelectItem value="false">{t('rental.furnished.no')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit">{t('save')}</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
