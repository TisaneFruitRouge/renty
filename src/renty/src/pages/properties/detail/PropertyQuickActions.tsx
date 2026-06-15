"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { History, Loader2, Mail, MessageCircle, MessageSquare, Phone } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import Link from "@/components/Link";
import { api } from "@/convex/_generated/api";
import type { lease, property, tenant, tenantAuth } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type LeaseWithDetails = lease & {
  property: property;
  tenants: (tenant & {
    auth: tenantAuth | null;
  })[];
};

interface PropertyQuickActionsProps {
  property: property;
  leases: LeaseWithDetails[];
}

export function PropertyQuickActions({ property, leases }: PropertyQuickActionsProps) {
  const t = useTranslations("property");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const channel = useQuery(
    api.channels.getByPropertyId,
    isContactModalOpen ? { propertyId: property.id } : "skip",
  );

  const allTenants = leases.flatMap((lease) => lease.tenants);
  const hasActiveTenants = allTenants.length > 0;
  const isLoadingChannel = isContactModalOpen && channel === undefined;
  const channelId = channel?.id ?? null;

  return (
    <div className="bg-card rounded-md border border-border">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t("quick-actions")}</h2>
        <div className="space-y-3">
          <Link href={`/rent-receipts?propertyId=${property.id}`} className="w-full">
            <Button variant="outline" className="w-full flex items-center justify-center">
              <History className="w-4 h-4 mr-2" />
              {t("rent-receipts-history")}
            </Button>
          </Link>
          <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("contact-tenant")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("contact-tenant")}</DialogTitle>
              </DialogHeader>

              {hasActiveTenants ? (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {allTenants.map((tenant) => (
                      <div key={tenant.id} className="rounded-lg border p-3">
                        <h3 className="text-sm font-medium mb-2">
                          {tenant.firstName} {tenant.lastName}
                          {leases.length > 1 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({leases.find((lease) => lease.tenants.some((entry) => entry.id === tenant.id))?.leaseType})
                            </span>
                          )}
                        </h3>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{tenant.email}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{tenant.phoneNumber}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-medium">{t("instant-messaging")}</h3>
                    <p className="text-sm text-muted-foreground">{t("instant-messaging-description")}</p>

                    {isLoadingChannel ? (
                      <Button disabled className="w-full p-3">
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        {t("loading")}
                      </Button>
                    ) : channelId ? (
                      <Link
                        href={`/channels/${channelId}`}
                        className="flex items-center justify-center w-full p-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        {t("open-chat")}
                      </Link>
                    ) : (
                      <Button disabled className="w-full p-3">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        {t("chat-unavailable")}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  {t("no-tenants-assigned")}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
