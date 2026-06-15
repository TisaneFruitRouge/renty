import { useMemo } from "react";
import { useQuery } from "convex/react";
import { FileText } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  PageDescription,
  PageTitle,
  SectionTitle,
} from "@/components/ui/typography";
import type { lease, property, tenant, tenantAuth } from "@/lib/types";
import { reviveDates } from "../../lib/revive-dates";
import { useCurrentUserId } from "../../lib/current-user";
import CreateLeaseModal from "./CreateLeaseModal";
import LeasesListSearch from "./LeasesListSearch";

type LeaseWithDetails = lease & {
  property: property;
  tenants: (tenant & { auth: tenantAuth | null })[];
};

export function LeasesPage() {
  const t = useTranslations("leases");
  const userId = useCurrentUserId();
  const rawLeases = useQuery(api.leases.listForUser, userId ? { userId } : "skip");
  const rawProperties = useQuery(api.properties.listForUser, userId ? { userId } : "skip");

  const leases = useMemo(
    () => reviveDates(rawLeases ?? []) as unknown as LeaseWithDetails[],
    [rawLeases],
  );

  const properties = useMemo(() => {
    const revived = reviveDates(rawProperties ?? []) as unknown as property[];
    return [...revived].sort((a, b) => a.title.localeCompare(b.title));
  }, [rawProperties]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-start">
        <div>
          <PageTitle>{t("title")}</PageTitle>
          <PageDescription className="mt-1">{t("subtitle")}</PageDescription>
        </div>
        <CreateLeaseModal properties={properties} />
      </div>

      <div>
        {leases.length > 0 ? (
          <LeasesListSearch leases={leases} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <SectionTitle className="mb-2">
                {t("no-leases-title")}
              </SectionTitle>
              <PageDescription className="text-center mb-4 max-w-md">
                {t("no-leases-description")}
              </PageDescription>
              <CreateLeaseModal properties={properties} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
