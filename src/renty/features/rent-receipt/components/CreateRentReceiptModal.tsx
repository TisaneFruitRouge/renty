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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Send } from "lucide-react"
import { useState } from "react"
import { createReceiptSchema } from "../schemas"
import { createRentReceiptAction } from "../actions"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import { DatePicker } from "@/components/ui/date-picker"
import type { property } from "@prisma/client"
import { useRouter } from "next/navigation"

interface CreateRentReceiptModalProps { 
    properties: property[]
}

export default function CreateRentReceiptModal({ properties }: CreateRentReceiptModalProps) {
    const t = useTranslations('rent-receipts.create-modal');
    const { toast } = useToast();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof createReceiptSchema>>({
        resolver: zodResolver(createReceiptSchema),
        defaultValues: {
            propertyId: "",
            startDate: new Date(),
            endDate: new Date(),
            baseRent: 0,
            charges: 0,
        },
    });

    async function onSubmit(data: z.infer<NonNullable<typeof createReceiptSchema>>, sendMail: boolean) {
        try {
            // Normalize dates to midnight UTC to avoid timezone issues
            const normalizedData = {
                ...data,
                startDate: normalizeToUTCMidnight(data.startDate),
                endDate: normalizeToUTCMidnight(data.endDate)
            };
            
            const result = await createRentReceiptAction(
                sendMail, 
                normalizedData
            );
            if (!result) {
                throw new Error("Error while creating the rent receipt");
            }
            router.refresh();
            setOpen(false);
        } catch {
            toast({
                variant: "destructive",
                title: t('edit-form.error'),
                description: t('edit-form.error-description'),
            });
        }
    }
    
    // Helper function to normalize dates to midnight UTC
    function normalizeToUTCMidnight(date: Date): Date {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }

    function handleOpenChange(open: boolean) {
        if (!open) {
            form.reset();
        }
        setOpen(open);
    }

    return (
        <Dialog 
            open={open} 
            onOpenChange={handleOpenChange}
        >
            <DialogTrigger asChild>
                <Button className="px-4 py-4 rounded-full">
                    <Plus className="mr-2 h-4 w-4"/> {t('create-receipt')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('modal-title')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-6">
                        <FormField
                            control={form.control}
                            name="propertyId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('property')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('select-property')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {properties.map(property => (
                                                <SelectItem key={property.id} value={property.id}>
                                                    {property.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('start-date')}</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder={t('start-date')}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('end-date')}</FormLabel>
                                        <DatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder={t('end-date')}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="baseRent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('base-rent')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
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
                                name="charges"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('charges')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button 
                                variant="outline" 
                                onClick={form.handleSubmit((values) => onSubmit(values, false))}
                            >
                                <Plus className="mr-2 h-4 w-4" /> 
                                {t('create')}
                            </Button>
                            <Button
                                onClick={form.handleSubmit((values) => onSubmit(values, true))}
                            >
                                <Send className="mr-2 h-4 w-4"/> 
                                {t('create-and-send')}
                            </Button>
                        </div> 
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
