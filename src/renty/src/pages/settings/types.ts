import type { user } from "@/lib/types";

export type SettingsUser = user;

export type Plan = {
  name: string;
  title: string;
  price: string;
  features: string[];
  limits: {
    properties: number;
    tenants?: number;
    receipts?: number;
  };
};

export type SessionInfo = {
  id: string;
  token?: string;
  userId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  isCurrentSession?: boolean;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
};
