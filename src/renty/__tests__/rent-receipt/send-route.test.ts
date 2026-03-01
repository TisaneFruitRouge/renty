import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/features/rent-receipt/db', () => ({
  getPendingReceiptsOlderThan: vi.fn(),
  updateReceiptStatus: vi.fn(),
}));

vi.mock('@/features/rent-receipt/email/sendEmail', () => ({
  sendReceiptEmail: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { GET } from '@/app/api/(cron)/rent-receipt/send/route';
import * as receiptDb from '@/features/rent-receipt/db';
import * as emailSender from '@/features/rent-receipt/email/sendEmail';
import { RentReceiptStatus } from '@prisma/client';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CRON_SECRET = 'test-secret';

function makeRequest(secret = CRON_SECRET) {
  return new NextRequest('http://localhost/api/rent-receipt/send', {
    headers: { authorization: `Bearer ${secret}` },
  });
}

function makeTenant(id: string, email = `${id}@test.com`) {
  return { id, firstName: 'Alice', lastName: 'Martin', email };
}

function makeReceipt(overrides: Record<string, unknown> = {}) {
  return {
    id: 'receipt-1',
    status: 'PENDING',
    blobUrl: 'https://blob.example.com/r.pdf',
    startDate: new Date('2024-01-01'),
    baseRent: 1000,
    charges: 50,
    tenant: makeTenant('t1'),
    property: {
      user: { email: 'landlord@test.com' },
    },
    lease: null,
    ...overrides,
  };
}

// Mock global fetch to return a fake PDF buffer
function mockFetch(ok = true) {
  const arrayBuffer = new ArrayBuffer(8);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    statusText: ok ? 'OK' : 'Not Found',
    arrayBuffer: () => Promise.resolve(arrayBuffer),
  }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/rent-receipt/send', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.CRON_SECRET = CRON_SECRET;

    vi.mocked(receiptDb.getPendingReceiptsOlderThan).mockResolvedValue([]);
    vi.mocked(receiptDb.updateReceiptStatus).mockResolvedValue(undefined as never);
    vi.mocked(emailSender.sendReceiptEmail).mockResolvedValue(undefined as never);
    mockFetch();
  });

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------

  it('returns 401 when authorization header is missing', async () => {
    const req = new NextRequest('http://localhost/api/rent-receipt/send');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 when authorization header is wrong', async () => {
    const res = await GET(makeRequest('wrong-secret'));
    expect(res.status).toBe(401);
  });

  // -------------------------------------------------------------------------
  // No receipts
  // -------------------------------------------------------------------------

  it('returns success when there are no pending receipts', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(vi.mocked(emailSender.sendReceiptEmail)).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Review window filter
  // -------------------------------------------------------------------------

  it('calls getPendingReceiptsOlderThan with a cutoff date 3 days in the past', async () => {
    const before = Date.now();
    await GET(makeRequest());
    const after = Date.now();

    const [cutoff] = vi.mocked(receiptDb.getPendingReceiptsOlderThan).mock.calls[0];
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    expect(cutoff.getTime()).toBeLessThanOrEqual(before - threeDaysMs + 100);
    expect(cutoff.getTime()).toBeGreaterThanOrEqual(after - threeDaysMs - 100);
  });

  // -------------------------------------------------------------------------
  // Sending receipts
  // -------------------------------------------------------------------------

  it('sends email and marks receipt as PAID for a valid pending receipt', async () => {
    const receipt = makeReceipt();
    vi.mocked(receiptDb.getPendingReceiptsOlderThan).mockResolvedValue([receipt] as never);

    await GET(makeRequest());

    expect(vi.mocked(emailSender.sendReceiptEmail)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(emailSender.sendReceiptEmail)).toHaveBeenCalledWith(
      receipt,
      receipt.tenant,
      'landlord@test.com',
      expect.any(Buffer)
    );
    expect(vi.mocked(receiptDb.updateReceiptStatus)).toHaveBeenCalledWith(
      'receipt-1',
      RentReceiptStatus.PAID
    );
  });

  it('skips a receipt that has no blobUrl', async () => {
    const receipt = makeReceipt({ blobUrl: null });
    vi.mocked(receiptDb.getPendingReceiptsOlderThan).mockResolvedValue([receipt] as never);

    await GET(makeRequest());

    expect(vi.mocked(emailSender.sendReceiptEmail)).not.toHaveBeenCalled();
    expect(vi.mocked(receiptDb.updateReceiptStatus)).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Shared lease: all tenants receive email
  // -------------------------------------------------------------------------

  it('sends email to all tenants for a SHARED lease receipt', async () => {
    const t1 = makeTenant('t1', 'alice@test.com');
    const t2 = makeTenant('t2', 'bob@test.com');
    const receipt = makeReceipt({
      tenant: t1,
      lease: {
        leaseType: 'SHARED',
        tenants: [t1, t2],
      },
    });
    vi.mocked(receiptDb.getPendingReceiptsOlderThan).mockResolvedValue([receipt] as never);

    await GET(makeRequest());

    expect(vi.mocked(emailSender.sendReceiptEmail)).toHaveBeenCalledTimes(2);

    const calls = vi.mocked(emailSender.sendReceiptEmail).mock.calls;
    const recipients = calls.map(([, tenant]) => (tenant as { id: string }).id);
    expect(recipients).toContain('t1');
    expect(recipients).toContain('t2');
  });

  it('sends email only to primary tenant for a non-SHARED lease', async () => {
    const t1 = makeTenant('t1');
    const receipt = makeReceipt({
      tenant: t1,
      lease: { leaseType: 'INDIVIDUAL', tenants: [t1] },
    });
    vi.mocked(receiptDb.getPendingReceiptsOlderThan).mockResolvedValue([receipt] as never);

    await GET(makeRequest());

    expect(vi.mocked(emailSender.sendReceiptEmail)).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Error isolation
  // -------------------------------------------------------------------------

  it('continues processing other receipts when one fails', async () => {
    const r1 = makeReceipt({ id: 'r1' });
    const r2 = makeReceipt({ id: 'r2' });
    vi.mocked(receiptDb.getPendingReceiptsOlderThan).mockResolvedValue([r1, r2] as never);

    // First email call throws
    vi.mocked(emailSender.sendReceiptEmail)
      .mockRejectedValueOnce(new Error('Email failed'))
      .mockResolvedValueOnce(undefined as never);

    await GET(makeRequest());

    // Second receipt is still processed
    expect(vi.mocked(receiptDb.updateReceiptStatus)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(receiptDb.updateReceiptStatus)).toHaveBeenCalledWith('r2', RentReceiptStatus.PAID);
  });

  it('handles a failed fetch from blob storage gracefully', async () => {
    mockFetch(false);
    const receipt = makeReceipt();
    vi.mocked(receiptDb.getPendingReceiptsOlderThan).mockResolvedValue([receipt] as never);

    await GET(makeRequest());

    expect(vi.mocked(emailSender.sendReceiptEmail)).not.toHaveBeenCalled();
    expect(vi.mocked(receiptDb.updateReceiptStatus)).not.toHaveBeenCalled();
  });
});
