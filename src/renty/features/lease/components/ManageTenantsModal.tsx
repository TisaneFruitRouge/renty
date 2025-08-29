"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Users, UserPlus, UserMinus, Loader2 } from "lucide-react"
import { addTenantToLease, removeTenantFromLease, getAvailableTenantsForLease } from "../actions"

type LeaseWithTenants = lease & {
    tenants: (tenant & {
        auth: tenantAuth | null
    })[]
}

type AvailableTenant = tenant

interface ManageTenantsModalProps {
    lease: LeaseWithTenants
    children: React.ReactNode
}

export default function ManageTenantsModal({ lease, children }: ManageTenantsModalProps) {
    const t = useTranslations('lease')
    const { toast } = useToast()
    
    const [open, setOpen] = useState(false)
    const [availableTenants, setAvailableTenants] = useState<AvailableTenant[]>([])
    const [selectedTenantId, setSelectedTenantId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [isAddingTenant, setIsAddingTenant] = useState(false)
    const [removingTenantId, setRemovingTenantId] = useState<string | null>(null)

    // Load available tenants when modal opens
    const loadAvailableTenants = useCallback(async () => {
        setIsLoading(true)
        try {
            const tenants = await getAvailableTenantsForLease()
            setAvailableTenants(tenants)
        } catch (error) {
            console.error('Error loading available tenants:', error)
            toast({
                variant: 'destructive',
                title: "Erreur",
                description: "Impossible de charger les locataires disponibles",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        if (open) {
            loadAvailableTenants()
        }
    }, [open, loadAvailableTenants])

    const handleAddTenant = async () => {
        if (!selectedTenantId) return

        setIsAddingTenant(true)
        try {
            await addTenantToLease(lease.id, selectedTenantId)
            toast({
                title: "Locataire ajouté",
                description: "Le locataire a été ajouté au bail avec succès",
            })
            
            // Refresh available tenants
            await loadAvailableTenants()
            setSelectedTenantId("")
            
            // Close modal to trigger parent refresh
            setOpen(false)
        } catch (error) {
            console.error('Error adding tenant to lease:', error)
            toast({
                variant: 'destructive',
                title: "Erreur",
                description: error instanceof Error ? error.message : "Impossible d'ajouter le locataire",
            })
        } finally {
            setIsAddingTenant(false)
        }
    }

    const handleRemoveTenant = async (tenantId: string) => {
        setRemovingTenantId(tenantId)
        try {
            await removeTenantFromLease(tenantId)
            toast({
                title: "Locataire retiré",
                description: "Le locataire a été retiré du bail avec succès",
            })
            
            // Refresh available tenants
            await loadAvailableTenants()
            
            // Close modal to trigger parent refresh
            setOpen(false)
        } catch (error) {
            console.error('Error removing tenant from lease:', error)
            toast({
                variant: 'destructive',
                title: "Erreur",
                description: error instanceof Error ? error.message : "Impossible de retirer le locataire",
            })
        } finally {
            setRemovingTenantId(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {t('manage-tenants')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Current Tenants */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span>Locataires actuels ({lease.tenants.length})</span>
                                <Badge variant="secondary">{lease.tenants.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lease.tenants.length > 0 ? (
                                <div className="space-y-3">
                                    {lease.tenants.map((tenant) => (
                                        <div 
                                            key={tenant.id} 
                                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <p className="font-medium">
                                                            {tenant.firstName} {tenant.lastName}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {tenant.email}
                                                        </p>
                                                        {tenant.phoneNumber && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {tenant.phoneNumber}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="ml-auto flex items-center gap-2">
                                                        {tenant.auth?.isActivated ? (
                                                            <Badge variant="default" className="text-xs">
                                                                {t('activated')}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs">
                                                                {t('pending')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRemoveTenant(tenant.id)}
                                                disabled={removingTenantId === tenant.id}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                {removingTenantId === tenant.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <UserMinus className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>{t('no-tenants-assigned')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Add New Tenant */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Ajouter un locataire
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <span>Chargement des locataires...</span>
                                </div>
                            ) : availableTenants.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <Select
                                            value={selectedTenantId}
                                            onValueChange={setSelectedTenantId}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Sélectionner un locataire..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableTenants.map((tenant) => (
                                                    <SelectItem key={tenant.id} value={tenant.id}>
                                                        {tenant.firstName} {tenant.lastName} - {tenant.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button 
                                            onClick={handleAddTenant}
                                            disabled={!selectedTenantId || isAddingTenant}
                                        >
                                            {isAddingTenant ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <UserPlus className="h-4 w-4 mr-2" />
                                            )}
                                            Ajouter
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Seuls les locataires non assignés à un bail sont affichés.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Aucun locataire disponible</p>
                                    <p className="text-sm">
                                        Tous vos locataires sont déjà assignés à des baux.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}