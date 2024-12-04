import TenantsList from "@/features/tenant/components/TenantsList";
import CreateTenantModal from "@/features/tenant/components/CreateTenantModal";
import { getAllTenants } from "@/features/tenant/actions";
import { getTranslations } from "next-intl/server";

export default async function TenantsPage() {
  const t = await getTranslations('tenants');

  const tenants = await getAllTenants();

  return (
    <div className="p-4 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {t("title")}
        </h1>
        <CreateTenantModal />
      </div>
      <TenantsList tenants={tenants} />
    </div>
  )
}
