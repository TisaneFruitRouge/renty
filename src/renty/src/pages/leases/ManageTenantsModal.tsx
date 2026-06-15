"use client";

import { useMutation, useQuery } from "convex/react";
import { Loader2, UserMinus, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { lease, tenant, tenantAuth } from "@/lib/types";
import { reviveDates } from "../../lib/revive-dates";
import { useCurrentUserId } from "../../lib/current-user";

type LeaseWithTenants = lease & {
  tenants: (tenant & { auth: tenantAuth | null })[];
};

interface ManageTenantsModalProps {
  lease: LeaseWithTenants;
  children: React.ReactNode;
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
  );
}

export default function ManageTenantsModal({ lease, children }: ManageTenantsModalProps) {
  const t = useTranslations("lease");
  const mt = useTranslations("lease.manage-tenants-modal");
  const { toast } = useToast();
  const userId = useCurrentUserId();
  const updateTenant = useMutation(api.tenants.update);
  const addToPropertyChannel = useMutation(api.tenants.addToPropertyChannelByLease);
  const removeFromPropertyChannel = useMutation(api.tenants.removeFromPropertyChannelByLease);
  const rawAvailableTenants = useQuery(api.tenants.listAvailableForUser, userId ? { userId } : "skip");
  const availableTenants = reviveDates(rawAvailableTenants ?? []) as unknown as tenant[];

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [removingTenantId, setRemovingTenantId] = useState<string | null>(null);
  const tenantCount = lease.tenants.length;
  const isSingleTenantLease = lease.leaseType === "INDIVIDUAL" || lease.leaseType === "COLOCATION";
  const canAddTenant = lease.leaseType === "SHARED" || tenantCount === 0;
  const canRemoveTenant = lease.leaseType === "SHARED" ? tenantCount > 2 : tenantCount > 1;
  const tenantRule = isSingleTenantLease ? mt("single-tenant-rule") : mt("shared-tenant-rule");
  const addDisabledReason = isSingleTenantLease && tenantCount >= 1 ? mt("cannot-add-single") : null;

  const handleAddTenant = async () => {
    if (!selectedId || !userId) return;
    if (!canAddTenant) {
      toast({
        variant: "destructive",
        title: mt("error"),
        description: addDisabledReason ?? mt("add-error"),
      });
      return;
    }
    setIsAddingTenant(true);
    try {
      await updateTenant({ id: selectedId, userId, leaseId: lease.id });
      await addToPropertyChannel({ leaseId: lease.id, tenantId: selectedId });
      toast({ title: mt("tenant-added"), description: mt("tenant-added-description") });
      setSelectedId(null);
      setOpen(false);
    } catch (error) {
      console.error("Error adding tenant to lease:", error);
      toast({
        variant: "destructive",
        title: mt("error"),
        description: mt("add-error"),
      });
    } finally {
      setIsAddingTenant(false);
    }
  };

  const handleRemoveTenant = async (tenantId: string) => {
    if (!userId) return;
    if (!canRemoveTenant) {
      toast({
        variant: "destructive",
        title: mt("error"),
        description: lease.leaseType === "SHARED" ? mt("cannot-remove-shared") : mt("cannot-remove-single"),
      });
      return;
    }
    setRemovingTenantId(tenantId);
    try {
      await removeFromPropertyChannel({ leaseId: lease.id, tenantId });
      await updateTenant({ id: tenantId, userId, leaseId: null });
      toast({ title: mt("tenant-removed"), description: mt("tenant-removed-description") });
      setOpen(false);
    } catch (error) {
      console.error("Error removing tenant from lease:", error);
      toast({
        variant: "destructive",
        title: mt("error"),
        description: mt("remove-error"),
      });
    } finally {
      setRemovingTenantId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("manage-tenants")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
            {tenantRule}
          </div>

          <SectionHeader label={mt("current-tenants")} count={lease.tenants.length} />

          {lease.tenants.length > 0 ? (
            <div className="space-y-2">
              {lease.tenants.map((tenant) => {
                const initials = `${tenant.firstName[0]}${tenant.lastName[0]}`.toUpperCase();
                return (
                  <div key={tenant.id} className="flex items-center gap-3 p-3 rounded-md border bg-muted/20">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{tenant.firstName} {tenant.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{tenant.email}</p>
                    </div>
                    <Badge variant={tenant.auth?.isActivated ? "default" : "outline"} className="text-xs shrink-0">
                      {tenant.auth?.isActivated ? t("activated") : t("pending")}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveTenant(tenant.id)}
                      disabled={removingTenantId === tenant.id || !canRemoveTenant}
                      title={!canRemoveTenant ? (lease.leaseType === "SHARED" ? mt("cannot-remove-shared") : mt("cannot-remove-single")) : undefined}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      {removingTenantId === tenant.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground rounded-md border bg-muted/10">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t("no-tenants-assigned")}</p>
            </div>
          )}

          <SectionHeader label={t("add-tenant")} />

          {rawAvailableTenants === undefined ? (
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
              <p className="text-sm text-muted-foreground">
                {addDisabledReason ?? mt("select-hint")}
              </p>
              <div className="space-y-2">
                {availableTenants.map((tenant) => {
                  const isSelected = selectedId === tenant.id;
                  const initials = `${tenant.firstName[0]}${tenant.lastName[0]}`.toUpperCase();
                  return (
                    <div
                      key={tenant.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                        !canAddTenant && "cursor-not-allowed opacity-60",
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30",
                      )}
                      onClick={() => {
                        if (canAddTenant) setSelectedId(isSelected ? null : tenant.id);
                      }}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                        isSelected ? "border-primary" : "border-muted-foreground",
                      )}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                        isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                      )}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{tenant.firstName} {tenant.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{tenant.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">{mt("available-hint")}</p>
              <div className="flex justify-end pt-1">
                <Button onClick={handleAddTenant} disabled={!selectedId || isAddingTenant || !canAddTenant}>
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
  );
}
