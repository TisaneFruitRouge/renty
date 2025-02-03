import { Users, Building2, Mail, Phone } from "lucide-react";
import EditTenantModal from "@/features/tenant/components/EditTenantModal";
import DeleteTenantModal from "@/features/tenant/components/DeleteTenantModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllTenants } from "@/features/tenant/actions";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CreateTenantModal from "@/features/tenant/components/CreateTenantModal";
import { getAllProperties } from "@/features/properties/actions";

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

      {/* Filters */}
      {/** TODO: FOR LATER */}
      {/*<div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder={t("search-placeholder")}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filter-all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter-all")}</SelectItem>
              <SelectItem value="active">{t("filter-active")}</SelectItem>
              <SelectItem value="former">{t("filter-former")}</SelectItem>
            </SelectContent>
          </Select>
        </div> 
      </div>
      */}

      {/* Tenants Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table-tenant")}</TableHead>
              <TableHead>{t("table-contact")}</TableHead>
              <TableHead>{t("table-property")}</TableHead>
              {/* <TableHead>{t("table-status")}</TableHead> */}
              <TableHead>{t("table-notes")}</TableHead>
              <TableHead className="text-right">{t("table-actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="font-medium">{tenant.firstName} {tenant.lastName}</div>
                      {(tenant.startDate && tenant.startDate.getTime() !== 0) && (<div className="text-sm text-gray-500">
                        {tenant.startDate.toLocaleDateString()}
                      </div>)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{tenant.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{tenant.phoneNumber || "N/A"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {tenant.property ? (
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{tenant.property.title}</div>
                        <div className="text-sm text-gray-500">{tenant.property.address}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">{t("no-property")}</span>
                  )}
                </TableCell>
                <TableCell>
                  <p className="text-sm text-gray-500 max-w-xs truncate">
                    {tenant.notes}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <EditTenantModal properties={properties} tenant={tenant} />
                    <DeleteTenantModal tenant={tenant} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
