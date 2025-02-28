export interface Property {
  id: string;
  address: string;
  city: string;
  country: string;
  rentDetails?: {
    baseRent: number;
    charges: number;
  };
}

export interface Tenant {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  phoneVerified?: boolean;
  avatarUrl?: string;
  startDate?: string;
  endDate?: string;
  property: Property;
}
