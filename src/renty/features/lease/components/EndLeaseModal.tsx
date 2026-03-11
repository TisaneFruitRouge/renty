"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTranslations } from "next-intl"
import type { lease } from "@prisma/client"
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { terminateLeaseAction } from "../actions"

const formSchema = z.object({
    terminationDate: z.date({ required_error: "Veuillez sélectionner une date." }),
    terminationReason: z.enum([
        "MUTUAL_AGREEMENT",
        "TENANT_REQUEST",
        "LANDLORD_REQUEST",
        "NON_PAYMENT",
        "BREACH_OF_CONTRACT",
        "OTHER",
    ] as const, { required_error: "Veuillez sélectionner un motif." }),
    notes: z.string().optional(),
})

type EndLeaseFormData = z.infer<typeof formSchema>

interface EndLeaseModalProps {
    lease: lease
    children: React.ReactNode
}

export default function EndLeaseModal({ lease, children }: EndLeaseModalProps) {
    const t = useTranslations("lease.end-lease")
    const { toast } = useToast()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    const form = useForm<EndLeaseFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            terminationDate: new Date(),
            notes: "",
        },
    })

    const isSubmitting = form.formState.isSubmitting

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            form.reset()
            setTimeout(() => { document.body.style.pointerEvents = "" }, 0)
        }
    }

    async function onSubmit(values: EndLeaseFormData) {
        try {
            await terminateLeaseAction(
                lease.id,
                values.terminationDate,
                values.terminationReason,
                values.notes || undefined
            )
            toast({ title: t("success") })
            setIsOpen(false)
            router.refresh()
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("title")}</DialogTitle>
                    <DialogDescription>{t("description")}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="terminationDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>{t("termination-date")}</FormLabel>
                                    <DatePicker value={field.value} onChange={field.onChange} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="terminationReason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("termination-reason")}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("termination-reason")} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="MUTUAL_AGREEMENT">{t("reasons.MUTUAL_AGREEMENT")}</SelectItem>
                                            <SelectItem value="TENANT_REQUEST">{t("reasons.TENANT_REQUEST")}</SelectItem>
                                            <SelectItem value="LANDLORD_REQUEST">{t("reasons.LANDLORD_REQUEST")}</SelectItem>
                                            <SelectItem value="NON_PAYMENT">{t("reasons.NON_PAYMENT")}</SelectItem>
                                            <SelectItem value="BREACH_OF_CONTRACT">{t("reasons.BREACH_OF_CONTRACT")}</SelectItem>
                                            <SelectItem value="OTHER">{t("reasons.OTHER")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("notes")}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t("notes-placeholder")}
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t("terminating") : t("confirm")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
