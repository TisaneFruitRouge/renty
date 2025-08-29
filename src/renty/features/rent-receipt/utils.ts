import type { lease, tenant } from "@prisma/client";
import type { JsonValue } from "@prisma/client/runtime/library";

// Define a lease type that includes the tenants relation
export type LeaseWithTenants = lease & {
  tenants: tenant[];
};

interface MonthRange {
  startDate: Date;
  endDate: Date;
}

export function getMonthRange(date: Date): MonthRange {
  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    startDate: new Date(year, month, 1),
    endDate: new Date(year, month + 1, 0)
  };
}

export interface RentDetails {
    baseRent: number;
    charges: number;
}

export function parseRentDetails(rentDetails: JsonValue): RentDetails | null {
    if (!rentDetails || typeof rentDetails !== 'object' || Array.isArray(rentDetails)) {
        return null;
    }

    const details = rentDetails as Record<string, JsonValue>;
    const baseRent = typeof details.baseRent === 'number' ? details.baseRent : null;
    const charges = typeof details.charges === 'number' ? details.charges : null;

    if (baseRent === null || charges === null) {
        return null;
    }

    return { baseRent, charges };
}

export function shouldGenerateReceipt(lease: LeaseWithTenants, today: Date = new Date()): boolean {
    // Check if auto generation is enabled
    if (!lease.autoGenerateReceipts) {
        return false;
    }

    // Check if lease is active
    if (lease.status !== 'ACTIVE') {
        return false;
    }

    // Check if there are tenants
    if (!lease.tenants || lease.tenants.length === 0) {
        return false;
    }

    // Check if next receipt date is due
    if (lease.nextReceiptDate && new Date(lease.nextReceiptDate) <= today) {
        return true;
    }

    return false;
}

/**
 * Determines the receipt generation strategy based on lease type
 */
export function getReceiptStrategy(leaseType: string): 'individual' | 'shared' | 'colocation' {
    switch (leaseType) {
        case 'INDIVIDUAL':
            return 'individual';
        case 'SHARED':
            return 'shared';
        case 'COLOCATION':
            return 'colocation';
        default:
            return 'individual'; // Default fallback
    }
}

/**
 * Validates if a lease can generate receipts
 */
export function validateLeaseForReceiptGeneration(lease: LeaseWithTenants): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!lease.tenants || lease.tenants.length === 0) {
        errors.push('No tenants assigned to lease');
    }

    if (!lease.rentAmount || lease.rentAmount <= 0) {
        errors.push('Invalid rent amount');
    }

    if (lease.charges === null || lease.charges < 0) {
        errors.push('Invalid charges amount');
    }

    if (!lease.propertyId) {
        errors.push('No property associated with lease');
    }

    if (lease.status !== 'ACTIVE') {
        errors.push('Lease is not active');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Gets the expected number of receipts to be generated for a lease
 */
export function getExpectedReceiptCount(lease: LeaseWithTenants): number {
    const strategy = getReceiptStrategy(lease.leaseType);

    switch (strategy) {
        case 'individual':
        case 'colocation':
            return lease.tenants?.length || 0;
        case 'shared':
            return 1; // One receipt for all tenants
        default:
            return 0;
    }
}
