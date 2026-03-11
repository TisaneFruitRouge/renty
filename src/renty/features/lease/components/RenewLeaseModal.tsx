"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTranslations } from "next-intl"
import type { lease, property, tenant } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { renewLeaseAction } from "../actions"

const formSchema = z.object({
    startDate: z.date({ required_error: "Veuillez sélectionner une date de début." }),
    endDate: z.date().optional(),
    rentAmount: z.string().min(1, "Le loyer est requis.").refine(val => {
        const num = parseFloat(val)
        return !Number.isNaN(num) && num > 0
    }, { message: "Le loyer doit être supérieur à 0." }),
    depositAmount: z.string().optional().refine(val => {
        if (!val || val === "") return true
        const num = parseFloat(val)
        return !Number.isNaN(num) && num >= 0
    }, { message: "Le dépôt doit être un nombre valide." }),
    charges: z.string().optional().refine(val => {
        if (!val || val === "") return true
        const num = parseFloat(val)
        return !Number.isNaN(num) && num >= 0
    }, { message: "Les charges doivent être un nombre valide." }),
    leaseType: z.enum(["INDIVIDUAL", "SHARED", "COLOCATION"] as const),
    isFurnished: z.boolean().default(false),
    paymentFrequency: z.enum(["monthly", "quarterly", "yearly"] as const).default("monthly"),
    currency: z.string().default("EUR"),
    notes: z.string().optional(),
})

type RenewLeaseFormData = z.infer<typeof formSchema>

interface RenewLeaseModalProps {
    lease: lease & { tenants: tenant[]; property: property }
    children: React.ReactNode
}

function defaultStartDate(endDate: Date | null): Date {
    if (!endDate) return new Date()
    const next = new Date(endDate)
    next.setDate(next.getDate() + 1)
    return next
}

function SectionHeader({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                {label}
            </span>
            <div className="flex-1 h-px bg-border" />
        </div>
    )
}

export default function RenewLeaseModal({ lease, children }: RenewLeaseModalProps) {
    const t = useTranslations("lease.renew-lease")
    const leaseT = useTranslations("lease")
    const createT = useTranslations("lease.create-form")
    const { toast } = useToast()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    const form = useForm<RenewLeaseFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startDate: defaultStartDate(lease.endDate),
            endDate: undefined,
            rentAmount: lease.rentAmount.toString(),
            depositAmount: lease.depositAmount ? lease.depositAmount.toString() : "",
            charges: lease.charges ? lease.charges.toString() : "",
            leaseType: lease.leaseType,
            isFurnished: lease.isFurnished,
            paymentFrequency: lease.paymentFrequency as "monthly" | "quarterly" | "yearly",
            currency: lease.currency,
            notes: lease.notes || "",
        },
    })

    const isSubmitting = form.formState.isSubmitting
    const watchedRent = useWatch({ control: form.control, name: "rentAmount" })
    const rentDiff = parseFloat(watchedRent || "0") - lease.rentAmount

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            form.reset()
            setTimeout(() => { document.body.style.pointerEvents = "" }, 0)
        }
    }

    async function onSubmit(values: RenewLeaseFormData) {
        try {
            const result = await renewLeaseAction(lease.id, {
                propertyId: lease.propertyId,
                startDate: values.startDate,
                endDate: values.endDate,
                rentAmount: parseFloat(values.rentAmount),
                depositAmount: values.depositAmount && values.depositAmount !== "" ? parseFloat(values.depositAmount) : undefined,
                charges: values.charges && values.charges !== "" ? parseFloat(values.charges) : 0,
                leaseType: values.leaseType,
                isFurnished: values.isFurnished,
                paymentFrequency: values.paymentFrequency,
                currency: values.currency,
                notes: values.notes,
            })
            toast({ title: t("success") })
            setIsOpen(false)
            if (result && "newLeaseId" in result) {
                router.push(`/leases/${result.newLeaseId}`)
            }
        } catch (error) {
            console.error(error)
            toast({
                variant: "destructive",
                title: t("error"),
                description: error instanceof Error ? error.message : t("error"),
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("title")}</DialogTitle>
                    <DialogDescription>{t("description")}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                        {/* Période */}
                        <SectionHeader label={leaseT("section-period")} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{t("new-start-date")}</FormLabel>
                                        <DatePicker value={field.value} onChange={field.onChange} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{t("new-end-date")}</FormLabel>
                                        <DatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder={createT("select-end-date")}
                                        />
                                        <FormDescription>{createT("end-date.description")}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Financier */}
                        <SectionHeader label={leaseT("section-financial")} />
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="rentAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{createT("rent-amount")}</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" placeholder="1500.00" {...field} />
                                        </FormControl>
                                        {rentDiff !== 0 && (
                                            <p className={`text-xs font-medium ${rentDiff > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                                {rentDiff > 0 ? "+" : ""}{rentDiff.toFixed(2)} {lease.currency}
                                            </p>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="depositAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{createT("deposit-amount.label")}</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" placeholder="3000.00" {...field} />
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
                                        <FormLabel>{createT("charges.label")}</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" placeholder="150.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{leaseT("currency")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Configuration */}
                        <SectionHeader label={leaseT("section-configuration")} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="leaseType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{createT("lease-type.label")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="INDIVIDUAL">{leaseT("type.individual")}</SelectItem>
                                                <SelectItem value="SHARED">{leaseT("type.shared")}</SelectItem>
                                                <SelectItem value="COLOCATION">{leaseT("type.colocation")}</SelectItem>
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
                                        <FormLabel>{createT("payment-frequency.label")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="monthly">{leaseT("frequency.monthly")}</SelectItem>
                                                <SelectItem value="quarterly">{leaseT("frequency.quarterly")}</SelectItem>
                                                <SelectItem value="yearly">{leaseT("frequency.yearly")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <FormField
                                control={form.control}
                                name="isFurnished"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 h-10">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">{leaseT("furnished")}</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{leaseT("notes")} <span className="text-muted-foreground font-normal">({leaseT("optional")})</span></FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={leaseT("notes-placeholder")}
                                                className="resize-none"
                                                rows={2}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                {t("cancel")}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t("renewing") : t("confirm")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
