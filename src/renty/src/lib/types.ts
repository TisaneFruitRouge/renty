export const RentReceiptStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  LATE: "LATE",
  UNPAID: "UNPAID",
  CANCELLED: "CANCELLED",
  DRAFT: "DRAFT",
} as const;
export type RentReceiptStatus = (typeof RentReceiptStatus)[keyof typeof RentReceiptStatus];

export const ChannelType = {
  PROPERTY: "PROPERTY",
  MAINTENANCE: "MAINTENANCE",
  PAYMENT: "PAYMENT",
  CUSTOM: "CUSTOM",
} as const;
export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType];

export const ParticipantType = {
  LANDLORD: "LANDLORD",
  TENANT: "TENANT",
} as const;
export type ParticipantType = (typeof ParticipantType)[keyof typeof ParticipantType];

export const LeaseType = {
  INDIVIDUAL: "INDIVIDUAL",
  SHARED: "SHARED",
  COLOCATION: "COLOCATION",
} as const;
export type LeaseType = (typeof LeaseType)[keyof typeof LeaseType];

export const LeaseStatus = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  TERMINATED: "TERMINATED",
  PENDING: "PENDING",
} as const;
export type LeaseStatus = (typeof LeaseStatus)[keyof typeof LeaseStatus];

export const TerminationReason = {
  MUTUAL_AGREEMENT: "MUTUAL_AGREEMENT",
  TENANT_REQUEST: "TENANT_REQUEST",
  LANDLORD_REQUEST: "LANDLORD_REQUEST",
  NON_PAYMENT: "NON_PAYMENT",
  BREACH_OF_CONTRACT: "BREACH_OF_CONTRACT",
  OTHER: "OTHER",
} as const;
export type TerminationReason = (typeof TerminationReason)[keyof typeof TerminationReason];

export const DocumentCategory = {
  LEASE: "LEASE",
  INVENTORY: "INVENTORY",
  INSURANCE: "INSURANCE",
  MAINTENANCE: "MAINTENANCE",
  PAYMENT: "PAYMENT",
  CORRESPONDENCE: "CORRESPONDENCE",
  LEGAL: "LEGAL",
  UTILITY: "UTILITY",
  OTHER: "OTHER",
} as const;
export type DocumentCategory = (typeof DocumentCategory)[keyof typeof DocumentCategory];

export type user = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  state: string | null;
  stripeCustomerId: string | null;
};

export type session = {
  id: string;
  expiresAt: Date;
  token: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type property = {
  id: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  state: string;
  title: string;
  images: string[];
  userId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type rentReceipt = {
  id: string;
  startDate: Date;
  endDate: Date;
  paymentFrequency: string;
  propertyId: string;
  tenantId: string;
  leaseId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  baseRent: number;
  charges: number;
  blobUrl: string | null;
  status: RentReceiptStatus;
};

export type tenant = {
  id: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  leaseId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  firstName: string;
};

export type lease = {
  id: string;
  propertyId: string;
  startDate: Date;
  endDate: Date | null;
  rentAmount: number;
  depositAmount: number | null;
  charges: number | null;
  leaseType: LeaseType;
  isFurnished: boolean;
  paymentFrequency: string;
  currency: string;
  status: LeaseStatus;
  notes: string | null;
  terminationReason: TerminationReason | null;
  renewedFromLeaseId: string | null;
  autoGenerateReceipts: boolean;
  receiptGenerationDate: number | null;
  nextReceiptDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type tenantAuth = {
  id: string;
  tenantId: string;
  phoneNumber: string;
  passcode: string;
  tempCode: string | null;
  tempCodeExpiresAt: Date | null;
  isActivated: boolean;
  refreshToken: string | null;
  refreshTokenExpiresAt: Date | null;
  biometricEnabled: boolean;
  biometricPublicKey: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Message = {
  id: string;
  content: string;
  channelId: string;
  senderId: string;
  senderType: ParticipantType;
  createdAt: Date;
};

export type document = {
  id: string;
  name: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: DocumentCategory;
  propertyId: string;
  uploadedAt: Date;
  updatedAt: Date;
  sharedWithTenant: boolean;
};

export type subscription = {
  id: string;
  plan: string;
  referenceId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  cancelAtPeriodEnd: boolean | null;
  seats: number | null;
};

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export namespace QueryTypes {
  export type propertyUpdateInput = Partial<
    Pick<property, "title" | "images" | "address" | "city" | "state" | "country" | "postalCode">
  >;

  export type rentReceiptWhereInput = {
    tenantId?: string;
    propertyId?: string;
    property?: { userId?: string };
    status?: { in?: RentReceiptStatus[] } | RentReceiptStatus;
    createdAt?: {
      gte?: Date;
      lte?: Date;
    };
  };
}
