import { api } from "@/lib/api";
import { EditProfileForm } from "@/schemas/profile";
import { Tenant } from "@/lib/types";

export async function updateTenant(data: EditProfileForm) {
  const response = await api.put('/api/tenants/profile', data);
  return response.data as { tenant: Tenant };
}