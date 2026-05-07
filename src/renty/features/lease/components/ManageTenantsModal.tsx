"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import type { lease, tenant, tenantAuth } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, UserMinus, Loader2 } from "lucide-react"
import { addTenantToLease, removeTenantFromLease, getAvailableTenantsForLease } from "../actions"
import { cn } from "@/lib/utils"

type LeaseWithTenants = lease & {
    tenants: (tenant & {
        auth: tenantAuth | null
    })[]
}

interface ManageTenantsModalProps {
    lease: LeaseWithTenants
    children: React.ReactNode
}

function SectionHeader({ label, count }: { label: string; count?: number }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                {label}
            </span>
            {count !== undefined && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">{count}</Badge>
            )}
            <div className="flex-1 h-px bg-border" />
        </div>
    )
}

export default function ManageTenantsModal({ lease, children }: ManageTenantsModalProps) {
    const t = useTranslations('lease')
    const mt = useTranslations('lease.manage-tenants-modal')
    const { toast } = useToast()
    const router = useRouter()

    const [open, setOpen] = useState(false)
    const [availableTenants, setAvailableTenants] = useState<tenant[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isAddingTenant, setIsAddingTenant] = useState(false)
    const [removingTenantId, setRemovingTenantId] = useState<string | null>(null)

    const loadAvailableTenants = useCallback(async () => {
        setIsLoading(true)
        try {
            const tenants = await getAvailableTenantsForLease()
            setAvailableTenants(tenants)
        } catch (error) {
            console.error('Error loading available tenants:', error)
            toast({ variant: 'destructive', title: mt("error"), description: mt("load-error") })
        } finally {
            setIsLoading(false)
        }
    }, [toast, mt])

    useEffect(() => {
        if (open) loadAvailableTenants()
    }, [open, loadAvailableTenants])

    const handleAddTenant = async () => {
        if (!selectedId) return
        setIsAddingTenant(true)
        try {
            await addTenantToLease(lease.id, selectedId)
            toast({ title: mt("tenant-added"), description: mt("tenant-added-description") })
            setSelectedId(null)
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Error adding tenant to lease:', error)
            toast({
                variant: 'destructive',
                title: mt("error"),
                description: error instanceof Error ? error.message : mt("add-error"),
            })
        } finally {
            setIsAddingTenant(false)
        }
    }

    const handleRemoveTenant = async (tenantId: string) => {
        setRemovingTenantId(tenantId)
        try {
            await removeTenantFromLease(tenantId)
            toast({ title: mt("tenant-removed"), description: mt("tenant-removed-description") })
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Error removing tenant from lease:', error)
            toast({
                variant: 'destructive',
                title: mt("error"),
                description: error instanceof Error ? error.message : mt("remove-error"),
            })
        } finally {
            setRemovingTenantId(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {t('manage-tenants')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 pt-1">
                    {/* Current Tenants */}
                    <SectionHeader label={mt("current-tenants")} count={lease.tenants.length} />

                    {lease.tenants.length > 0 ? (
                        <div className="space-y-2">
                            {lease.tenants.map((tenant) => {
                                const initials = `${tenant.firstName[0]}${tenant.lastName[0]}`.toUpperCase()
                                return (
                                    <div
                                        key={tenant.id}
                                        className="flex items-center gap-3 p-3 rounded-md border bg-muted/20"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                                            {initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{tenant.firstName} {tenant.lastName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{tenant.email}</p>
                                        </div>
                                        <Badge
                                            variant={tenant.auth?.isActivated ? "default" : "outline"}
                                            className="text-xs shrink-0"
                                        >
                                            {tenant.auth?.isActivated ? t('activated') : t('pending')}
                                        </Badge>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleRemoveTenant(tenant.id)}
                                            disabled={removingTenantId === tenant.id}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                        >
                                            {removingTenantId === tenant.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <UserMinus className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground rounded-md border bg-muted/10">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">{t('no-tenants-assigned')}</p>
                        </div>
                    )}

                    {/* Add Tenant */}
                    <SectionHeader label={t('add-tenant')} />

                    {isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground py-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">{mt("loading")}</span>
                        </div>
                    ) : availableTenants.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground rounded-md border bg-muted/10">
                            <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm font-medium">{mt("no-available")}</p>
                            <p className="text-xs mt-1">{mt("all-assigned")}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">{mt("select-hint")}</p>
                            <div className="space-y-2">
                                {availableTenants.map((tenant) => {
                                    const isSelected = selectedId === tenant.id
                                    const initials = `${tenant.firstName[0]}${tenant.lastName[0]}`.toUpperCase()
                                    return (
                                        <div
                                            key={tenant.id}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                                                isSelected
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                                            )}
                                            onClick={() => setSelectedId(isSelected ? null : tenant.id)}
                                        >
                                            <div className={cn(
                                                "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                                                isSelected ? "border-primary" : "border-muted-foreground"
                                            )}>
                                                {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                                            </div>
                                            <div className={cn(
                                                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                                                isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                            )}>
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{tenant.firstName} {tenant.lastName}</p>
                                                <p className="text-xs text-muted-foreground truncate">{tenant.email}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground">{mt("available-hint")}</p>
                            <div className="flex justify-end pt-1">
                                <Button
                                    onClick={handleAddTenant}
                                    disabled={!selectedId || isAddingTenant}
                                >
                                    {isAddingTenant ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            {mt("loading")}
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            {mt("add")}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
