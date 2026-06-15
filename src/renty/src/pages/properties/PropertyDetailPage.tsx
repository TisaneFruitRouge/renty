import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import Link from "@/components/Link";
import { api } from "@/convex/_generated/api";
import type { lease, property } from "@/lib/types";
import { PageTitle } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { reviveDates } from "../../lib/revive-dates";
import EditPropertyModal from "./detail/EditPropertyModal";
import PhotosSection from "./detail/PhotosSection";
import { PropertyQuickActions } from "./detail/PropertyQuickActions";
import RecentPaymentsSection from "./detail/RecentPaymentsSection";
import SimpleLeasesSection from "./detail/SimpleLeasesSection";
import { useCurrentUserId } from "../../lib/current-user";

function LoadingPropertyDetail() {
  return (
    <div className="p-4 md:p-8">
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="h-10 w-80 rounded bg-muted" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-72 rounded-md bg-muted" />
            <div className="h-64 rounded-md bg-muted" />
          </div>
          <div className="h-48 rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function PropertyDetailPage() {
  const t = useTranslations("property");
  const { id = "" } = useParams();
  const userId = useCurrentUserId();
  const rawProperty = useQuery(api.properties.getById, id ? { id } : "skip");
  const rawLeases = useQuery(api.leases.listActiveByProperty, id ? { propertyId: id } : "skip");
  const rawRecentPayments = useQuery(
    api.rentReceipts.listByProperty,
    id ? { propertyId: id, limit: 2 } : "skip",
  );

  const property = useMemo(() => reviveDates(rawProperty) as property | null | undefined, [rawProperty]);
  const leases = useMemo(() => reviveDates(rawLeases ?? []) as any[], [rawLeases]);
  const recentPayments = useMemo(() => reviveDates(rawRecentPayments ?? []) as any[], [rawRecentPayments]);

  if (property === undefined || rawLeases === undefined || rawRecentPayments === undefined) {
    return <LoadingPropertyDetail />;
  }

  if (!property || (userId && property.userId !== userId)) {
    return (
      <div className="p-4 md:p-8">
        <Card className="p-6">
          <PageTitle>{t("no-properties-found")}</PageTitle>
          <Button asChild className="mt-4">
            <Link href="/properties">{t("back-to-properties")}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const simpleLeases = leases.map((lease) => ({
    id: lease.id,
    startDate: lease.startDate instanceof Date ? lease.startDate.toISOString() : new Date(lease.startDate).toISOString(),
    endDate: lease.endDate ? (lease.endDate instanceof Date ? lease.endDate.toISOString() : new Date(lease.endDate).toISOString()) : null,
    rentAmount: lease.rentAmount,
    charges: lease.charges,
    leaseType: lease.leaseType,
    status: lease.status,
    isFurnished: lease.isFurnished,
    tenants: lease.tenants,
  }));

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
          <Link href="/properties" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            {t("back-to-properties")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-foreground font-medium truncate">{property.title}</span>
        </nav>
        <div className="flex justify-between items-start">
          <div>
            <PageTitle>{property.title}</PageTitle>
            <div className="flex items-center text-muted-foreground mt-1">
              <MapPin className="w-4 h-4 mr-2" />
              <span>
                {property.address}, {property.postalCode} {property.city}
              </span>
            </div>
          </div>
          <EditPropertyModal property={property} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PhotosSection property={property} />
          <SimpleLeasesSection leases={simpleLeases} property={property} />
          {recentPayments.length > 0 && (
            <RecentPaymentsSection propertyId={id} recentPayments={recentPayments} />
          )}

          <Card className="shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="p-6 flex-1">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-lg font-semibold">{t("documents")}</h2>
                </div>
                <p className="text-muted-foreground mb-4">{t("documents-description")}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                    {t("category-lease")}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-warning-muted px-2 py-1 text-xs font-medium text-warning-foreground ring-1 ring-inset ring-warning/20">
                    {t("category-inventory")}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-success-muted px-2 py-1 text-xs font-medium text-success-foreground ring-1 ring-inset ring-success/20">
                    {t("category-insurance")}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
                    {t("category-legal")}
                  </span>
                </div>
                <Button asChild>
                  <Link href={`/properties/${id}/vault`}>{t("view-document-vault")}</Link>
                </Button>
              </div>
              <div className="bg-primary/5 dark:bg-primary/10 p-6 flex flex-col justify-center items-center md:w-1/3 border-t md:border-t-0 md:border-l border-border">
                <svg className="w-16 h-16 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <p className="text-center text-sm font-medium mb-1">{t("secure-storage")}</p>
                <p className="text-center text-xs text-muted-foreground">{t("secure-storage-description")}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <PropertyQuickActions
            property={property}
            leases={leases.map((lease) => ({
              ...(lease as lease),
              property,
              tenants: lease.tenants,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
