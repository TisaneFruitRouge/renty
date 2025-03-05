
export enum ChannelType {
    PROPERTY    = "PROPERTY",
    MAINTENANCE = "MAINTENANCE",
    PAYMENT     = "PAYMENT",
    CUSTOM      = "CUSTOM"
}

export enum ParticipantType {
    LANDLORD = "LANDLORD",
    TENANT = "TENANT"
}

export enum RentReceiptStatus {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    PAID = "PAID",
    LATE = "LATE",
    UNPAID = "UNPAID",
    CANCELLED = "CANCELLED"
}

export type Account = {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: Date;
    refreshTokenExpiresAt?: Date;
    scope?: string;
    idToken?: string;
    expiresAt?: Date;
    password?: string;
    createdAt?: Date;
    updatedAt?: Date;
    user: User;
}

export type Session = {
    id: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    userId: string;
    token?: string;
    createdAt?: Date;
    updatedAt?: Date;
    user: User;
}

export type User = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    state?: string;
    createdAt: Date;
    updatedAt: Date;
    property: Property[];
    account: Account[];
    session: Session[];
    tenants: Tenant[];
}

export type Verification = {
    id: string;
    identifier: string;
    value: string;
    expiresAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export type Property = {
    id: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    state: string;
    title: string;
    images: string[];
    userId: string;
    user: User;
    tenants: Tenant[];
    rentReceipt: RentReceipt[];
    channels: Channel[];
    rentReceiptStartDate?: Date;
    rentDetails?: { baseRent: number; charges: number };
    currency?: string;
    paymentFrequency: string;
    depositAmount?: number;
    rentedSince?: Date;
    isFurnished: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type RentReceipt = {
    id: string;
    startDate: Date;
    endDate: Date;
    baseRent: number;
    charges: number;
    paymentFrequency: string;
    propertyId: string;
    tenantId: string;
    status: RentReceiptStatus;
    blobUrl?: string;
    property: Property;
    tenant: Tenant;
    createdAt?: Date;
    updatedAt?: Date;
}

export type Tenant = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    userId: string;
    propertyId?: string;
    notes?: string;
    startDate?: Date;
    endDate?: Date;
    user: User;
    property?: Property;
    rentReceipt: RentReceipt[];
    auth?: TenantAuth;
    createdAt: Date;
    updatedAt: Date;
}

export type TenantAuth = {
    id: string;
    tenantId: string;
    phoneNumber: string;
    passcode: string;
    tempCode?: string;
    tempCodeExpiresAt?: Date;
    isActivated: boolean;
    tenant: Tenant;
    refreshToken?: string;
    refreshTokenExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    biometricEnabled: boolean;
    biometricPublicKey?: string;
}

export type Channel = {
    id: string;
    propertyId: string;
    name?: string;
    type: ChannelType;
    createdAt: Date;
    updatedAt: Date;
    property: Property;
    messages: Message[];
    participants: ChannelParticipant[];
}

export type ChannelParticipant = {
    id: string;
    channelId: string;
    participantId: string;
    participantType: ParticipantType;
    joinedAt: Date;
    leftAt?: Date;
    channel: Channel;
}

export type Message = {
    id: string;
    content: string;
    channelId: string;
    senderId: string;
    senderType: ParticipantType;
    createdAt: Date;
    channel: Channel;
}

export type MessageWithSender = Message & {
    sender: Tenant | User | null; // Adjust the type of sender based on your actual sender type, e.g., User or Tenant
}

export type Document = {
    id: string;
    name: string;
    description?: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category: string;
    propertyId: string;
    sharedWithTenant: boolean;
    property?: Property;
    uploadedAt: Date;
    updatedAt: Date;
}