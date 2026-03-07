import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getAllTenants } from "@/features/tenant/actions";
import CreateTenantModal from "@/features/tenant/components/CreateTenantModal";
import TenantsList from "@/features/tenant/components/TenantsList";
import { getAllLeases } from "@/features/lease/actions";
import { PageTitle, PageDescription } from "@/components/ui/typography";

  /**
   * The TenantsPage component displays a list of all tenants.
   *
   * This component is protected by authentication and only accessible by logged-in users.
   * It fetches all tenants from the database and displays them in a table.
   * The table includes columns for the tenant's name, contact information, property,
   * and notes. The component also includes a search bar and filters for the table.
   * The search bar allows users to search for tenants by name or email.
   * The filters allow users to filter the table by active or former tenants.
   * The component also includes a button to create a new tenant.
   */
export default async function TenantsPage() {
  const t = await getTranslations('tenants');

  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const rawTenants = await getAllTenants();
  const leases = await getAllLeases();

  // Transform tenants to include property and lease dates directly from lease
  const tenants = rawTenants.map(tenant => ({
    ...tenant,
    property: tenant.lease?.property || null,
    startDate: tenant.lease?.startDate || null,
    endDate: tenant.lease?.endDate || null,
    lease: undefined // Remove lease from the transformed object
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <PageTitle>{t("title")}</PageTitle>
          <PageDescription className="mt-1">{t("subtitle")}</PageDescription>
        </div>
        <CreateTenantModal leases={leases} />
      </div>

      {/* Tenants List */}
      <TenantsList leases={leases}  tenants={tenants} />
    </div>
  );
}
