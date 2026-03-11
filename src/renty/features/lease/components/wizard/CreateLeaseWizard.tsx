"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTranslations } from "next-intl"
import type { property, tenant } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown, Loader2, Users } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"
import { createLease, addTenantToLease, getAvailableTenantsForLease } from "../../actions"

// ─── Step 1 schema (same as CreateLeaseModal) ───────────────────────────────

const step1Schema = z.object({
    propertyId: z.string({ required_error: "Veuillez sélectionner une propriété." }),
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
    leaseType: z.enum(["INDIVIDUAL", "SHARED", "COLOCATION"] as const, {
        required_error: "Veuillez sélectionner un type de bail.",
    }),
    isFurnished: z.boolean().default(false),
    paymentFrequency: z.enum(["monthly", "quarterly", "yearly"] as const).default("monthly"),
    currency: z.string().default("EUR"),
    notes: z.string().optional(),
})

type Step1Data = z.infer<typeof step1Schema>

// ─── Props ───────────────────────────────────────────────────────────────────

interface CreateLeaseWizardProps {
    properties: property[]
    propertyId?: string
    onSuccess?: () => void
}

// ─── Step 2: Tenant Assignment ────────────────────────────────────────────────

interface TenantAssignmentStepProps {
    leaseType: "INDIVIDUAL" | "SHARED" | "COLOCATION"
    onBack: () => void
    onSubmit: (tenantIds: string[]) => Promise<void>
    isSubmitting: boolean
}

function TenantAssignmentStep({ leaseType, onBack, onSubmit, isSubmitting }: TenantAssignmentStepProps) {
    const t = useTranslations("lease.wizard")
    const [availableTenants, setAvailableTenants] = useState<tenant[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [validationError, setValidationError] = useState<string | null>(null)

    useEffect(() => {
        getAvailableTenantsForLease()
            .then((tenants) => setAvailableTenants(tenants ?? []))
            .finally(() => setLoading(false))
    }, [])

    const handleSelect = (id: string) => {
        if (leaseType === "INDIVIDUAL" || leaseType === "COLOCATION") {
            setSelectedIds([id])
        } else {
            setSelectedIds(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            )
        }
        setValidationError(null)
    }

    const handleSubmit = async () => {
        if (leaseType === "INDIVIDUAL" || leaseType === "COLOCATION") {
            if (selectedIds.length !== 1) {
                setValidationError(t("individual-validation"))
                return
            }
        } else {
            if (selectedIds.length < 2) {
                setValidationError(t("shared-validation"))
                return
            }
        }
        await onSubmit(selectedIds)
    }

    return (
        <div className="space-y-6">
            {leaseType === "COLOCATION" && (
                <div className="rounded-md border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10 p-3 text-sm text-blue-700 dark:text-blue-300">
                    {t("colocation-info")}
                </div>
            )}

            <div>
                <p className="text-sm font-medium mb-3">
                    {leaseType === "SHARED" ? t("select-tenants-shared") : t("select-tenant-individual")}
                </p>

                {loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Chargement...</span>
                    </div>
                ) : availableTenants.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{t("no-tenants-available")}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {availableTenants.map((tenant) => {
                            const isSelected = selectedIds.includes(tenant.id)
                            return (
                                <div
                                    key={tenant.id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                                        isSelected
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50 hover:bg-muted/30"
                                    )}
                                    onClick={() => handleSelect(tenant.id)}
                                >
                                    {leaseType === "SHARED" ? (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => handleSelect(tenant.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <div className={cn(
                                            "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                            isSelected ? "border-primary" : "border-muted-foreground"
                                        )}>
                                            {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{tenant.firstName} {tenant.lastName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{tenant.email}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {validationError && (
                    <p className="text-sm text-destructive mt-2">{validationError}</p>
                )}
            </div>

            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                    {t("back")}
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || loading}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("submitting")}
                        </>
                    ) : t("submitting").replace("...", "")}
                </Button>
            </div>
        </div>
    )
}

// ─── Wizard root ─────────────────────────────────────────────────────────────

export default function CreateLeaseWizard({ properties, propertyId, onSuccess }: CreateLeaseWizardProps) {
    const t = useTranslations("lease.create-form")
    const wizardT = useTranslations("lease.wizard")
    const { toast } = useToast()
    const router = useRouter()
    const [step, setStep] = useState<1 | 2>(1)
    const [leaseTermsData, setLeaseTermsData] = useState<Step1Data | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [propertyOpen, setPropertyOpen] = useState(false)

    const form = useForm<Step1Data>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            propertyId: propertyId || "",
            rentAmount: "",
            depositAmount: "",
            charges: "",
            leaseType: "INDIVIDUAL",
            isFurnished: false,
            paymentFrequency: "monthly",
            currency: "EUR",
            notes: "",
        },
    })

    const handleStep1Next = async () => {
        const valid = await form.trigger()
        if (valid) {
            setLeaseTermsData(form.getValues())
            setStep(2)
        }
    }

    const handleTenantSubmit = async (tenantIds: string[]) => {
        if (!leaseTermsData) return
        setIsSubmitting(true)
        try {
            const newLease = await createLease({
                propertyId: leaseTermsData.propertyId,
                startDate: leaseTermsData.startDate,
                endDate: leaseTermsData.endDate,
                rentAmount: parseFloat(leaseTermsData.rentAmount),
                depositAmount: leaseTermsData.depositAmount && leaseTermsData.depositAmount !== ""
                    ? parseFloat(leaseTermsData.depositAmount) : undefined,
                charges: leaseTermsData.charges && leaseTermsData.charges !== ""
                    ? parseFloat(leaseTermsData.charges) : 0,
                leaseType: leaseTermsData.leaseType,
                isFurnished: leaseTermsData.isFurnished,
                paymentFrequency: leaseTermsData.paymentFrequency,
                currency: leaseTermsData.currency,
                notes: leaseTermsData.notes,
            })

            for (const tenantId of tenantIds) {
                await addTenantToLease(newLease.id, tenantId)
            }

            toast({ title: t("success.created") })
            form.reset()
            setStep(1)
            setLeaseTermsData(null)
            router.refresh()
            onSuccess?.()
        } catch (error) {
            console.error(error)
            toast({
                variant: "destructive",
                title: t("error.create"),
                description: error instanceof Error ? error.message : t("error.description"),
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Step indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={step === 1 ? "font-medium text-foreground" : ""}>{wizardT("step1-title")}</span>
                <span>›</span>
                <span className={step === 2 ? "font-medium text-foreground" : ""}>{wizardT("step2-title")}</span>
            </div>

            {step === 1 ? (
                <Form {...form}>
                    <div className="space-y-6">
                        {/* Property */}
                        <FormField
                            control={form.control}
                            name="propertyId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>{t("property")}</FormLabel>
                                    <Popover open={propertyOpen} onOpenChange={setPropertyOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={propertyOpen}
                                                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                    disabled={!!propertyId}
                                                >
                                                    {field.value
                                                        ? properties?.find((p) => p.id === field.value)?.title
                                                        : t("select-property")}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder={t("search-property")} />
                                                <CommandList>
                                                    <CommandEmpty>{t("no-property-found")}</CommandEmpty>
                                                    <CommandGroup>
                                                        {properties?.map((p) => (
                                                            <CommandItem
                                                                value={p.id}
                                                                key={p.id}
                                                                onSelect={() => {
                                                                    form.setValue("propertyId", p.id)
                                                                    setPropertyOpen(false)
                                                                }}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", p.id === field.value ? "opacity-100" : "opacity-0")} />
                                                                {p.title}
                                                                <span className="ml-2 text-muted-foreground text-sm">{p.address}</span>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{t("start-date")}</FormLabel>
                                        <DatePicker value={field.value} onChange={field.onChange} placeholder={t("select-start-date")} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{t("end-date.label")}</FormLabel>
                                        <DatePicker value={field.value} onChange={field.onChange} placeholder={t("select-end-date")} />
                                        <FormDescription>{t("end-date.description")}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Financials */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="rentAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("rent-amount")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="1200" type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="depositAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("deposit-amount.label")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="1200" type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormDescription>{t("deposit-amount.description")}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="charges"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("charges.label")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="100" type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormDescription>{t("charges.description")}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Type / Frequency / Furnished */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="leaseType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("lease-type.label")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("select-lease-type")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="INDIVIDUAL">{t("lease-type.individual")}</SelectItem>
                                                <SelectItem value="SHARED">{t("lease-type.shared")}</SelectItem>
                                                <SelectItem value="COLOCATION">{t("lease-type.colocation")}</SelectItem>
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
                                        <FormLabel>{t("payment-frequency.label")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("select-payment-frequency")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="monthly">{t("payment-frequency.monthly")}</SelectItem>
                                                <SelectItem value="quarterly">{t("payment-frequency.quarterly")}</SelectItem>
                                                <SelectItem value="yearly">{t("payment-frequency.yearly")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isFurnished"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("furnished.label")}</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center h-10 gap-2">
                                                <Checkbox
                                                    id="isFurnished"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <label htmlFor="isFurnished" className="text-sm text-muted-foreground cursor-pointer">
                                                    {t("furnished.description")}
                                                </label>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("notes.label")}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t("notes.placeholder")} className="resize-none" {...field} />
                                    </FormControl>
                                    <FormDescription>{t("notes.description")}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Button type="button" onClick={handleStep1Next}>
                                {wizardT("next")}
                            </Button>
                        </div>
                    </div>
                </Form>
            ) : (
                <TenantAssignmentStep
                    leaseType={leaseTermsData?.leaseType ?? "INDIVIDUAL"}
                    onBack={() => setStep(1)}
                    onSubmit={handleTenantSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    )
}
