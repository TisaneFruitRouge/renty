import { describe, it, expect } from 'vitest';
import {
  getMonthRange,
  shouldGenerateReceipt,
  getReceiptStrategy,
  validateLeaseForReceiptGeneration,
  getExpectedReceiptCount,
  computeNextReceiptDate,
  type LeaseWithTenants,
} from '@/features/rent-receipt/utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeLease(overrides: Partial<LeaseWithTenants> = {}): LeaseWithTenants {
  return {
    id: 'lease-1',
    propertyId: 'prop-1',
    startDate: new Date('2024-01-01'),
    endDate: null,
    rentAmount: 1000,
    depositAmount: null,
    charges: 50,
    leaseType: 'INDIVIDUAL',
    isFurnished: false,
    paymentFrequency: 'monthly',
    currency: 'EUR',
    status: 'ACTIVE',
    notes: null,
    autoGenerateReceipts: true,
    receiptGenerationDate: null,
    nextReceiptDate: new Date('2024-01-01'),
    terminationReason: null,
    renewedFromLeaseId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tenants: [{ id: 't1', firstName: 'Alice', lastName: 'Martin' } as never],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getMonthRange
// ---------------------------------------------------------------------------

describe('getMonthRange', () => {
  it('returns the correct start and end for a regular month', () => {
    const { startDate, endDate } = getMonthRange(new Date('2024-03-15'));
    expect(startDate).toEqual(new Date(2024, 2, 1));  // March 1
    expect(endDate).toEqual(new Date(2024, 3, 0));    // March 31 (last day)
  });

  it('handles December correctly (year boundary)', () => {
    const { startDate, endDate } = getMonthRange(new Date('2024-12-20'));
    expect(startDate).toEqual(new Date(2024, 11, 1));
    expect(endDate).toEqual(new Date(2025, 0, 0)); // Dec 31
  });

  it('handles January correctly', () => {
    const { startDate, endDate } = getMonthRange(new Date('2024-01-01'));
    expect(startDate).toEqual(new Date(2024, 0, 1));
    expect(endDate).toEqual(new Date(2024, 1, 0)); // Jan 31
  });

  it('handles February in a leap year', () => {
    const { startDate, endDate } = getMonthRange(new Date('2024-02-10'));
    expect(startDate).toEqual(new Date(2024, 1, 1));
    expect(endDate.getDate()).toBe(29); // 2024 is a leap year
  });

  it('handles February in a non-leap year', () => {
    const { startDate, endDate } = getMonthRange(new Date('2023-02-10'));
    expect(startDate).toEqual(new Date(2023, 1, 1));
    expect(endDate.getDate()).toBe(28);
  });
});

// ---------------------------------------------------------------------------
// shouldGenerateReceipt
// ---------------------------------------------------------------------------

describe('shouldGenerateReceipt', () => {
  it('returns true when all conditions are met', () => {
    const lease = makeLease({ nextReceiptDate: new Date('2024-01-01') });
    expect(shouldGenerateReceipt(lease, new Date('2024-01-01'))).toBe(true);
  });

  it('returns false when autoGenerateReceipts is false', () => {
    const lease = makeLease({ autoGenerateReceipts: false });
    expect(shouldGenerateReceipt(lease)).toBe(false);
  });

  it('returns false when lease status is not ACTIVE', () => {
    const lease = makeLease({ status: 'EXPIRED' });
    expect(shouldGenerateReceipt(lease)).toBe(false);
  });

  it('returns false when there are no tenants', () => {
    const lease = makeLease({ tenants: [] });
    expect(shouldGenerateReceipt(lease)).toBe(false);
  });

  it('returns false when nextReceiptDate is in the future', () => {
    const lease = makeLease({ nextReceiptDate: new Date('2099-01-01') });
    expect(shouldGenerateReceipt(lease, new Date('2024-01-01'))).toBe(false);
  });

  it('returns false when nextReceiptDate is null', () => {
    const lease = makeLease({ nextReceiptDate: null });
    expect(shouldGenerateReceipt(lease)).toBe(false);
  });

  it('returns true when nextReceiptDate is exactly today', () => {
    const today = new Date('2024-06-01');
    const lease = makeLease({ nextReceiptDate: today });
    expect(shouldGenerateReceipt(lease, today)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getReceiptStrategy
// ---------------------------------------------------------------------------

describe('getReceiptStrategy', () => {
  it('maps INDIVIDUAL to individual', () => {
    expect(getReceiptStrategy('INDIVIDUAL')).toBe('individual');
  });

  it('maps SHARED to shared', () => {
    expect(getReceiptStrategy('SHARED')).toBe('shared');
  });

  it('maps COLOCATION to colocation', () => {
    expect(getReceiptStrategy('COLOCATION')).toBe('colocation');
  });

  it('falls back to individual for unknown types', () => {
    expect(getReceiptStrategy('UNKNOWN')).toBe('individual');
  });
});

// ---------------------------------------------------------------------------
// validateLeaseForReceiptGeneration
// ---------------------------------------------------------------------------

describe('validateLeaseForReceiptGeneration', () => {
  it('returns valid for a correct lease', () => {
    const result = validateLeaseForReceiptGeneration(makeLease());
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports error when there are no tenants', () => {
    const result = validateLeaseForReceiptGeneration(makeLease({ tenants: [] }));
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('No tenants assigned to lease');
  });

  it('reports error when rentAmount is 0', () => {
    const result = validateLeaseForReceiptGeneration(makeLease({ rentAmount: 0 }));
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid rent amount');
  });

  it('reports error when charges is negative', () => {
    const result = validateLeaseForReceiptGeneration(makeLease({ charges: -10 }));
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid charges amount');
  });

  it('reports error when status is not ACTIVE', () => {
    const result = validateLeaseForReceiptGeneration(makeLease({ status: 'TERMINATED' }));
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Lease is not active');
  });

  it('accumulates multiple errors', () => {
    const result = validateLeaseForReceiptGeneration(
      makeLease({ tenants: [], rentAmount: 0, status: 'EXPIRED' })
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// getExpectedReceiptCount
// ---------------------------------------------------------------------------

describe('getExpectedReceiptCount', () => {
  it('returns tenant count for INDIVIDUAL lease', () => {
    const lease = makeLease({
      leaseType: 'INDIVIDUAL',
      tenants: [{ id: 't1' } as never, { id: 't2' } as never],
    });
    expect(getExpectedReceiptCount(lease)).toBe(2);
  });

  it('returns tenant count for COLOCATION lease', () => {
    const lease = makeLease({
      leaseType: 'COLOCATION',
      tenants: [{ id: 't1' } as never, { id: 't2' } as never, { id: 't3' } as never],
    });
    expect(getExpectedReceiptCount(lease)).toBe(3);
  });

  it('returns 1 for SHARED lease regardless of tenant count', () => {
    const lease = makeLease({
      leaseType: 'SHARED',
      tenants: [{ id: 't1' } as never, { id: 't2' } as never, { id: 't3' } as never],
    });
    expect(getExpectedReceiptCount(lease)).toBe(1);
  });

  it('returns 0 for INDIVIDUAL lease with no tenants', () => {
    const lease = makeLease({ leaseType: 'INDIVIDUAL', tenants: [] });
    expect(getExpectedReceiptCount(lease)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// computeNextReceiptDate
// ---------------------------------------------------------------------------

describe('computeNextReceiptDate', () => {
  it('adds exactly one month when no generationDay is set', () => {
    const from = new Date(2024, 2, 15); // March 15
    const next = computeNextReceiptDate(from, null);
    expect(next.getFullYear()).toBe(2024);
    expect(next.getMonth()).toBe(3); // April
    expect(next.getDate()).toBe(15);
  });

  it('uses the configured generationDay in the next month', () => {
    const from = new Date(2024, 0, 10); // Jan 10
    const next = computeNextReceiptDate(from, 1);
    expect(next.getFullYear()).toBe(2024);
    expect(next.getMonth()).toBe(1); // February
    expect(next.getDate()).toBe(1);
  });

  it('caps the day to the last day of the month (day 31 in February)', () => {
    const from = new Date(2024, 0, 31); // Jan 31 — generationDay = 31
    const next = computeNextReceiptDate(from, 31);
    // February 2024 has 29 days (leap year)
    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(29);
  });

  it('caps correctly for February in a non-leap year', () => {
    const from = new Date(2023, 0, 31); // Jan 31 — generationDay = 31
    const next = computeNextReceiptDate(from, 31);
    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(28);
  });

  it('handles year boundary (December → January)', () => {
    const from = new Date(2024, 11, 5); // Dec 5
    const next = computeNextReceiptDate(from, 5);
    expect(next.getFullYear()).toBe(2025);
    expect(next.getMonth()).toBe(0); // January
    expect(next.getDate()).toBe(5);
  });

  it('treats undefined generationDay same as null', () => {
    const from = new Date(2024, 2, 15);
    const withNull = computeNextReceiptDate(from, null);
    const withUndefined = computeNextReceiptDate(from, undefined);
    expect(withNull.getTime()).toBe(withUndefined.getTime());
  });
});
