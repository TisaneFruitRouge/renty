import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAllTenants } from "@/features/tenant/actions";
import { getAllProperties } from "@/features/properties/actions";
import CreateTenantModal from "@/features/tenant/components/CreateTenantModal";
import TenantsList from "@/features/tenant/components/TenantsList";

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

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  const tenants = await getAllTenants();
  const properties = await getAllProperties();

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>
        <CreateTenantModal properties={properties} />
      </div>

      {/* Tenants List */}
      <TenantsList tenants={tenants} properties={properties} />
    </div>
  );
}
