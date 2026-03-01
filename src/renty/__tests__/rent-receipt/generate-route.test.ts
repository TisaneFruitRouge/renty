import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks – must be declared before any import that loads the module under test
// ---------------------------------------------------------------------------

vi.mock('@/features/lease/db', () => ({
  getLeasesRequiringReceiptGeneration: vi.fn(),
  updateNextReceiptDate: vi.fn(),
}));

vi.mock('@/features/rent-receipt/db', () => ({
  default: vi.fn(),                    // createReceipt
  createSharedReceipt: vi.fn(),
  addBlobUrlToReceipt: vi.fn(),
  deleteReceipt: vi.fn(),
}));

vi.mock('@/features/rent-receipt/blob', () => ({
  saveReceiptToBlob: vi.fn(),
  deleteReceiptFromBlob: vi.fn(),
}));

vi.mock('@/features/rent-receipt/email/sendReviewEmail', () => ({
  sendReceiptReviewEmail: vi.fn(),
}));

vi.mock('@/features/rent-receipt/pdf/generatePDF', () => ({
  generatePDF: vi.fn(),
}));

// next-intl/server is pulled in by generatePDF — mock it to avoid Next.js context
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { GET } from '@/app/api/(cron)/rent-receipt/generate/route';
import * as leaseDb from '@/features/lease/db';
import * as receiptDb from '@/features/rent-receipt/db';
import * as blob from '@/features/rent-receipt/blob';
import * as reviewEmail from '@/features/rent-receipt/email/sendReviewEmail';
import * as pdfGen from '@/features/rent-receipt/pdf/generatePDF';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const CRON_SECRET = 'test-secret';

function makeRequest(secret = CRON_SECRET) {
  return new NextRequest('http://localhost/api/rent-receipt/generate', {
    headers: { authorization: `Bearer ${secret}` },
  });
}

function makeTenant(id: string, firstName = 'Alice', lastName = 'Martin') {
  return { id, firstName, lastName, email: `${id}@test.com` };
}

function makeProperty() {
  return {
    id: 'prop-1',
    title: 'Test Property',
    user: { id: 'user-1', email: 'landlord@test.com', name: 'Landlord' },
  };
}

function makeLease(overrides: Record<string, unknown> = {}) {
  return {
    id: 'lease-1',
    leaseType: 'INDIVIDUAL',
    rentAmount: 1000,
    charges: 50,
    paymentFrequency: 'monthly',
    propertyId: 'prop-1',
    receiptGenerationDate: null,
    property: makeProperty(),
    tenants: [makeTenant('t1')],
    ...overrides,
  };
}

const FAKE_PDF = Buffer.from('pdf');
const FAKE_URL = 'https://blob.example.com/receipt.pdf';
const FAKE_RECEIPT = { id: 'receipt-1', blobUrl: null };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/rent-receipt/generate', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.CRON_SECRET = CRON_SECRET;

    // Default: no leases
    vi.mocked(leaseDb.getLeasesRequiringReceiptGeneration).mockResolvedValue([]);
    vi.mocked(receiptDb.default).mockResolvedValue(FAKE_RECEIPT as never);
    vi.mocked(receiptDb.createSharedReceipt).mockResolvedValue(FAKE_RECEIPT as never);
    vi.mocked(receiptDb.addBlobUrlToReceipt).mockResolvedValue(undefined as never);
    vi.mocked(receiptDb.deleteReceipt).mockResolvedValue(undefined as never);
    vi.mocked(blob.saveReceiptToBlob).mockResolvedValue(FAKE_URL);
    vi.mocked(blob.deleteReceiptFromBlob).mockResolvedValue(undefined);
    vi.mocked(reviewEmail.sendReceiptReviewEmail).mockResolvedValue(undefined as never);
    vi.mocked(pdfGen.generatePDF).mockResolvedValue(FAKE_PDF);
    vi.mocked(leaseDb.updateNextReceiptDate).mockResolvedValue(undefined as never);
  });

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------

  it('returns 401 when authorization header is missing', async () => {
    const req = new NextRequest('http://localhost/api/rent-receipt/generate');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 when authorization header is wrong', async () => {
    const res = await GET(makeRequest('wrong-secret'));
    expect(res.status).toBe(401);
  });

  // -------------------------------------------------------------------------
  // No leases
  // -------------------------------------------------------------------------

  it('returns success with 0 processed leases when there are no leases', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.processedLeases).toBe(0);
  });

  // -------------------------------------------------------------------------
  // INDIVIDUAL lease
  // -------------------------------------------------------------------------

  it('creates one receipt per tenant for an INDIVIDUAL lease', async () => {
    const lease = makeLease({
      leaseType: 'INDIVIDUAL',
      tenants: [makeTenant('t1'), makeTenant('t2')],
    });
    vi.mocked(leaseDb.getLeasesRequiringReceiptGeneration).mockResolvedValue([lease] as never);

    await GET(makeRequest());

    expect(vi.mocked(receiptDb.default)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(pdfGen.generatePDF)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(blob.saveReceiptToBlob)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(reviewEmail.sendReceiptReviewEmail)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(leaseDb.updateNextReceiptDate)).toHaveBeenCalledTimes(1);
  });

  it('passes the correct tenant to createReceipt for INDIVIDUAL', async () => {
    const t1 = makeTenant('t1');
    const lease = makeLease({ leaseType: 'INDIVIDUAL', tenants: [t1] });
    vi.mocked(leaseDb.getLeasesRequiringReceiptGeneration).mockResolvedValue([lease] as never);

    await GET(makeRequest());

    expect(vi.mocked(receiptDb.default)).toHaveBeenCalledWith(
      expect.any(Date), expect.any(Date),
      1000, 50,
      'monthly', 'prop-1', 't1', 'lease-1'
    );
  });

  // -------------------------------------------------------------------------
  // COLOCATION lease
  // -------------------------------------------------------------------------

  it('creates one receipt per tenant for a COLOCATION lease', async () => {
    const lease = makeLease({
      leaseType: 'COLOCATION',
      tenants: [makeTenant('t1'), makeTenant('t2'), makeTenant('t3')],
    });
    vi.mocked(leaseDb.getLeasesRequiringReceiptGeneration).mockResolvedValue([lease] as never);

    await GET(makeRequest());

    expect(vi.mocked(receiptDb.default)).toHaveBeenCalledTimes(3);
    expect(vi.mocked(receiptDb.createSharedReceipt)).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // SHARED lease
  // -------------------------------------------------------------------------

  it('creates exactly one receipt for a SHARED lease', async () => {
    const lease = makeLease({
      leaseType: 'SHARED',
      tenants: [makeTenant('t1'), makeTenant('t2')],
    });
    vi.mocked(leaseDb.getLeasesRequiringReceiptGeneration).mockResolvedValue([lease] as never);

    await GET(makeRequest());

    expect(vi.mocked(receiptDb.createSharedReceipt)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(receiptDb.default)).not.toHaveBeenCalled();
    expect(vi.mocked(pdfGen.generatePDF)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(reviewEmail.sendReceiptReviewEmail)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(leaseDb.updateNextReceiptDate)).toHaveBeenCalledTimes(1);
  });

  it('passes all tenant IDs to createSharedReceipt', async () => {
    const lease = makeLease({
      leaseType: 'SHARED',
      tenants: [makeTenant('t1'), makeTenant('t2')],
    });
    vi.mocked(leaseDb.getLeasesRequiringReceiptGeneration).mockResolvedValue([lease] as never);

    await GET(makeRequest());

    expect(vi.mocked(receiptDb.createSharedReceipt)).toHaveBeenCalledWith(
      expect.any(Date), expect.any(Date),
      1000, 50,
      'monthly', 'prop-1',
      ['t1', 't2'],
      'lease-1'
    );
  });

  // -------------------------------------------------------------------------
  // Skipped leases
  // -------------------------------------------------------------------------

  it('skips a lease with no tenants', async () => {
    const lease = makeLease({ tenants: [] });
    vi.mocked(leaseDb.getLeasesRequiringReceiptGeneration).mockResolvedValue([lease] as never);

    await GET(makeRequest());

    expect(vi.mocked(receiptDb.default)).not.toHaveBeenCalled();
    expect(vi.mocked(leaseDb.updateNextReceiptDate)).not.toHaveBeenCalled();
  });

  it('skips a lease with unknown leaseType without blocking other leases', async () => {
    const badLease = makeLease({ leaseType: 'UNKNOWN' });
    const goodLease = makeLease({ id: 'lease-2', leaseType: 'INDIVIDUAL' });
    vi.mocked(leaseDb.getLeasesRequiringReceiptGeneration).mockResolvedValue([badLease, goodLease] as never);

    await GET(makeRequest());

    expect(vi.mocked(receiptDb.default)).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Error handling & cleanup
  // -------------------------------------------------------------------------

  it('cleans up created receipts when an error occurs mid-processing', async () => {
    const lease = makeLease({
      leaseType: 'INDIVIDUAL',
      tenants: [makeTenant('t1'), makeTenant('t2')],
    });
    vi.mocked(leaseDb.getLeasesRequiringReceiptGeneration).mockResolvedValue([lease] as never);

    // First PDF save succeeds, second fails
    vi.mocked(blob.saveReceiptToBlob)
      .mockResolvedValueOnce(FAKE_URL)
      .mockResolvedValueOnce(null);

    await GET(makeRequest());

    // Receipt created for t1 should be cleaned up
    expect(vi.mocked(receiptDb.deleteReceipt)).toHaveBeenCalled();
    // nextReceiptDate must NOT be updated on failure
    expect(vi.mocked(leaseDb.updateNextReceiptDate)).not.toHaveBeenCalled();
  });

  it('continues processing other leases when one fails', async () => {
    const failingLease = makeLease({ id: 'lease-fail', rentAmount: 0 }); // will throw
    const goodLease = makeLease({ id: 'lease-ok' });
    vi.mocked(leaseDb.getLeasesRequiringReceiptGeneration).mockResolvedValue([failingLease, goodLease] as never);

    await GET(makeRequest());

    // Good lease still processed
    expect(vi.mocked(receiptDb.default)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(leaseDb.updateNextReceiptDate)).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // nextReceiptDate computation respects receiptGenerationDate
  // -------------------------------------------------------------------------

  it('computes nextReceiptDate using receiptGenerationDate when set', async () => {
    const lease = makeLease({ receiptGenerationDate: 1 }); // always on the 1st
    vi.mocked(leaseDb.getLeasesRequiringReceiptGeneration).mockResolvedValue([lease] as never);

    await GET(makeRequest());

    const [, nextDate] = vi.mocked(leaseDb.updateNextReceiptDate).mock.calls[0];
    expect((nextDate as Date).getDate()).toBe(1);
  });
});
