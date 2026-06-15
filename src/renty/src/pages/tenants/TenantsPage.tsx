import { useMemo } from "react";
import { useQuery } from "convex/react";
import { useTranslations } from "@/lib/i18n";
import { api } from "@/convex/_generated/api";
import { PageDescription, PageTitle } from "@/components/ui/typography";
import type { lease, property, tenant } from "@/lib/types";
import { reviveDates } from "../../lib/revive-dates";
import { useCurrentUserId } from "../../lib/current-user";
import CreateTenantModal from "./CreateTenantModal";
import TenantsList from "./TenantsList";

type LeaseWithProperty = lease & { property: property };
type TenantWithLease = tenant & { lease?: (lease & { property: property | null }) | null };
type TenantRow = tenant & { property: property | null; startDate: Date | null; endDate: Date | null };

export function TenantsPage() {
  const t = useTranslations("tenants");
  const userId = useCurrentUserId();
  const rawTenants = useQuery(api.tenants.listForUser, userId ? { userId } : "skip");
  const rawLeases = useQuery(api.leases.listActiveForUser, userId ? { userId } : "skip");

  const leases = useMemo(
    () => reviveDates(rawLeases ?? []) as unknown as LeaseWithProperty[],
    [rawLeases],
  );

  const tenants = useMemo(() => {
    const revived = reviveDates(rawTenants ?? []) as unknown as TenantWithLease[];
    return revived.map((tenant): TenantRow => {
      const { lease: tenantLease, ...rest } = tenant;
      return {
        ...rest,
        property: tenantLease?.property || null,
        startDate: tenantLease?.startDate || null,
        endDate: tenantLease?.endDate || null,
      };
    });
  }, [rawTenants]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div>
          <PageTitle>{t("title")}</PageTitle>
          <PageDescription className="mt-1">{t("subtitle")}</PageDescription>
        </div>
        <CreateTenantModal leases={leases} />
      </div>

      <TenantsList leases={leases} tenants={tenants} />
    </div>
  );
}
