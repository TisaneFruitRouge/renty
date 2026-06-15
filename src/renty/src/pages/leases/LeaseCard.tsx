"use client";

import { format } from "date-fns";
import { CalendarIcon, MapPin, Users } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import Link from "@/components/Link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { lease, property, tenant, tenantAuth } from "@/lib/types";
import { formatCurrency, getLeaseStatusColor, getLeaseTypeColor, isLeaseExpired, isLeaseExpiringSoon } from "./lease-utils";

type LeaseWithDetails = lease & {
  property: property;
  tenants: (tenant & {
    auth: tenantAuth | null;
  })[];
};

interface LeaseCardProps {
  lease: LeaseWithDetails;
}

export default function LeaseCard({ lease }: LeaseCardProps) {
  const t = useTranslations("lease");

  const isExpired = isLeaseExpired(lease.endDate);
  const isExpiringSoon = isLeaseExpiringSoon(lease.endDate);

  return (
    <Link href={`/leases/${lease.id}`}>
      <Card className={cn(
        "overflow-hidden hover:border-primary/50 hover:shadow-md hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer",
        isExpired && "border-destructive",
        isExpiringSoon && !isExpired && "border-warning",
      )}>
        <div className={cn(
          "relative w-full h-32 bg-muted flex flex-col items-center justify-center gap-1",
          isExpired && "bg-destructive/10",
          isExpiringSoon && !isExpired && "bg-warning-muted",
        )}>
          <p className="text-2xl font-bold tabular-nums">
            {formatCurrency(lease.rentAmount, lease.currency)}
          </p>
          <p className="text-xs text-muted-foreground">
            /{t(`frequency.${lease.paymentFrequency}`)}
            {lease.charges && lease.charges > 0 && (
              <span> + {formatCurrency(lease.charges, lease.currency)} {t("charges")}</span>
            )}
          </p>
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge className={cn(getLeaseStatusColor(lease.status), "text-xs")}>
              {t(`status.${lease.status.toLowerCase()}`)}
            </Badge>
            <Badge className={cn(getLeaseTypeColor(lease.leaseType), "text-xs")}>
              {t(`type.${lease.leaseType.toLowerCase()}`)}
            </Badge>
          </div>
          {lease.isFurnished && (
            <div className="absolute top-2 left-2">
              <Badge variant="outline" className="text-xs">
                {t("furnished")}
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-2 pt-3">
          <h3 className="text-base font-semibold line-clamp-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {lease.property.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {lease.property.address}, {lease.property.city}
          </p>
        </CardHeader>

        <CardContent className="pb-0">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>
              {lease.tenants.length > 0
                ? lease.tenants.map(t => `${t.firstName} ${t.lastName}`).join(", ")
                : t("no-tenants-assigned")}
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-3 pb-3">
          <div className={cn(
            "flex items-center gap-1.5 text-xs text-muted-foreground",
            isExpired && "text-destructive font-medium",
            isExpiringSoon && !isExpired && "text-warning-foreground font-medium",
          )}>
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
            <span>{format(new Date(lease.startDate), "dd/MM/yyyy")}</span>
            <span>→</span>
            {lease.endDate ? (
              <span>
                {format(new Date(lease.endDate), "dd/MM/yyyy")}
                {isExpired && ` (${t("expired")})`}
                {isExpiringSoon && !isExpired && ` (${t("expires-soon")})`}
              </span>
            ) : (
              <span>{t("indefinite")}</span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
