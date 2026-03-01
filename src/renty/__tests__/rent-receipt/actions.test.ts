import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// vi.mock factories are hoisted to the top of the file by Vitest, so any
// variable referenced inside them must also be hoisted via vi.hoisted().
const mockPrismaFindUnique = vi.hoisted(() => vi.fn());

vi.mock('@/prisma/db', () => ({
  prisma: {
    property: { findUnique: mockPrismaFindUnique },
    rentReceipt: { findUnique: mockPrismaFindUnique },
  },
}));

vi.mock('@/features/rent-receipt/db', () => ({
  default: vi.fn(),                    // createReceipt
  createSharedReceipt: vi.fn(),
  addBlobUrlToReceipt: vi.fn(),
  deleteReceipt: vi.fn(),
  updateReceiptStatus: vi.fn(),
}));

vi.mock('@/features/rent-receipt/blob', () => ({
  saveReceiptToBlob: vi.fn(),
  deleteReceiptFromBlob: vi.fn(),
}));

vi.mock('@/features/rent-receipt/email/sendEmail', () => ({
  sendReceiptEmail: vi.fn(),
}));

vi.mock('@/features/rent-receipt/pdf/generatePDF', () => ({
  generatePDF: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  createRentReceiptAction,
  sendRentReceiptAction,
  updateRentReceiptStatusAction,
} from '@/features/rent-receipt/actions';
import * as receiptDb from '@/features/rent-receipt/db';
import * as blobStorage from '@/features/rent-receipt/blob';
import * as emailSender from '@/features/rent-receipt/email/sendEmail';
import * as pdfGen from '@/features/rent-receipt/pdf/generatePDF';
import { RentReceiptStatus } from '@prisma/client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTenant(id: string) {
  return { id, firstName: 'Alice', lastName: 'Martin', email: `${id}@test.com` };
}

function makeProperty(leaseType = 'INDIVIDUAL', tenants = [makeTenant('t1')]) {
  return {
    id: 'prop-1',
    leases: [
      {
        id: 'lease-1',
        leaseType,
        paymentFrequency: 'monthly',
        tenants,
      },
    ],
    user: { id: 'user-1', email: 'landlord@test.com', name: 'Landlord' },
  };
}

const FAKE_RECEIPT = { id: 'receipt-1', blobUrl: null };
const FAKE_PDF = Buffer.from('pdf');
const FAKE_URL = 'https://blob.example.com/r.pdf';

const INPUT = {
  propertyId: 'prop-1',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  baseRent: 1000,
  charges: 50,
};

// Mock global fetch for sendRentReceiptAction
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

describe('createRentReceiptAction', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockPrismaFindUnique.mockResolvedValue(makeProperty());
    vi.mocked(receiptDb.default).mockResolvedValue(FAKE_RECEIPT as never);
    vi.mocked(receiptDb.createSharedReceipt).mockResolvedValue(FAKE_RECEIPT as never);
    vi.mocked(receiptDb.addBlobUrlToReceipt).mockResolvedValue(undefined as never);
    vi.mocked(receiptDb.deleteReceipt).mockResolvedValue(undefined as never);
    vi.mocked(blobStorage.saveReceiptToBlob).mockResolvedValue(FAKE_URL);
    vi.mocked(blobStorage.deleteReceiptFromBlob).mockResolvedValue(undefined);
    vi.mocked(emailSender.sendReceiptEmail).mockResolvedValue(undefined as never);
    vi.mocked(pdfGen.generatePDF).mockResolvedValue(FAKE_PDF);
  });

  it('throws when property is not found', async () => {
    mockPrismaFindUnique.mockResolvedValue(null);
    await expect(createRentReceiptAction(true, INPUT)).rejects.toThrow('was not found');
  });

  it('throws when there are no active leases', async () => {
    mockPrismaFindUnique.mockResolvedValue({ ...makeProperty(), leases: [] });
    await expect(createRentReceiptAction(true, INPUT)).rejects.toThrow('No active leases');
  });

  it('throws when there are no tenants in the lease', async () => {
    mockPrismaFindUnique.mockResolvedValue(makeProperty('INDIVIDUAL', []));
    await expect(createRentReceiptAction(true, INPUT)).rejects.toThrow('No tenants');
  });

  it('creates a receipt and generates PDF for an INDIVIDUAL lease', async () => {
    await createRentReceiptAction(true, INPUT);

    expect(vi.mocked(receiptDb.default)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(pdfGen.generatePDF)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(blobStorage.saveReceiptToBlob)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(receiptDb.addBlobUrlToReceipt)).toHaveBeenCalledWith('receipt-1', FAKE_URL);
  });

  it('sends email to the tenant when sendMail is true', async () => {
    await createRentReceiptAction(true, INPUT);
    expect(vi.mocked(emailSender.sendReceiptEmail)).toHaveBeenCalledTimes(1);
  });

  it('does not send email when sendMail is false', async () => {
    await createRentReceiptAction(false, INPUT);
    expect(vi.mocked(emailSender.sendReceiptEmail)).not.toHaveBeenCalled();
  });

  it('uses createSharedReceipt and sends to all tenants for a SHARED lease', async () => {
    const tenants = [makeTenant('t1'), makeTenant('t2')];
    mockPrismaFindUnique.mockResolvedValue(makeProperty('SHARED', tenants));

    await createRentReceiptAction(true, INPUT);

    expect(vi.mocked(receiptDb.createSharedReceipt)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(receiptDb.default)).not.toHaveBeenCalled();

    // PDF should receive all tenants
    const pdfCall = vi.mocked(pdfGen.generatePDF).mock.calls[0][0];
    expect(pdfCall.tenants).toHaveLength(2);

    // Email sent to both tenants
    expect(vi.mocked(emailSender.sendReceiptEmail)).toHaveBeenCalledTimes(2);
  });

  it('uses createReceipt for a SHARED lease with only one tenant', async () => {
    mockPrismaFindUnique.mockResolvedValue(makeProperty('SHARED', [makeTenant('t1')]));

    await createRentReceiptAction(true, INPUT);

    expect(vi.mocked(receiptDb.default)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(receiptDb.createSharedReceipt)).not.toHaveBeenCalled();
  });

  it('cleans up the receipt when blob save fails', async () => {
    vi.mocked(blobStorage.saveReceiptToBlob).mockResolvedValue(null);

    await createRentReceiptAction(true, INPUT);

    expect(vi.mocked(receiptDb.deleteReceipt)).toHaveBeenCalledWith('receipt-1');
  });

  it('returns the created receipt on success', async () => {
    const result = await createRentReceiptAction(true, INPUT);
    expect(result).toEqual(FAKE_RECEIPT);
  });
});

// ---------------------------------------------------------------------------

describe('sendRentReceiptAction', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFetch();
    vi.mocked(receiptDb.updateReceiptStatus).mockResolvedValue(undefined as never);
    vi.mocked(emailSender.sendReceiptEmail).mockResolvedValue(undefined as never);
  });

  it('throws when receipt is not found', async () => {
    mockPrismaFindUnique.mockResolvedValue(null);
    await expect(sendRentReceiptAction('bad-id')).rejects.toThrow('Receipt not found');
  });

  it('throws when receipt has no blobUrl', async () => {
    mockPrismaFindUnique.mockResolvedValue({
      id: 'r1',
      blobUrl: null,
      tenant: makeTenant('t1'),
      property: { user: { email: 'l@l.com' } },
      lease: null,
    });
    await expect(sendRentReceiptAction('r1')).rejects.toThrow('Receipt not found or no PDF');
  });

  it('fetches PDF, sends email, and sets status to PAID', async () => {
    mockPrismaFindUnique.mockResolvedValue({
      id: 'r1',
      blobUrl: FAKE_URL,
      startDate: new Date('2024-01-01'),
      baseRent: 1000,
      charges: 50,
      tenant: makeTenant('t1'),
      property: { user: { email: 'landlord@test.com' } },
      lease: null,
    });

    await sendRentReceiptAction('r1');

    expect(vi.mocked(emailSender.sendReceiptEmail)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(receiptDb.updateReceiptStatus)).toHaveBeenCalledWith('r1', RentReceiptStatus.PAID);
  });

  it('sends to all tenants for a SHARED lease', async () => {
    const t1 = makeTenant('t1');
    const t2 = makeTenant('t2');
    mockPrismaFindUnique.mockResolvedValue({
      id: 'r1',
      blobUrl: FAKE_URL,
      startDate: new Date('2024-01-01'),
      baseRent: 1000,
      charges: 50,
      tenant: t1,
      property: { user: { email: 'landlord@test.com' } },
      lease: { leaseType: 'SHARED', tenants: [t1, t2] },
    });

    await sendRentReceiptAction('r1');

    expect(vi.mocked(emailSender.sendReceiptEmail)).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------

describe('updateRentReceiptStatusAction', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(receiptDb.updateReceiptStatus).mockResolvedValue(undefined as never);
  });

  it('calls updateReceiptStatus with the provided id and status', async () => {
    await updateRentReceiptStatusAction('r1', RentReceiptStatus.PAID);
    expect(vi.mocked(receiptDb.updateReceiptStatus)).toHaveBeenCalledWith('r1', RentReceiptStatus.PAID);
  });

  it('forwards different statuses correctly', async () => {
    await updateRentReceiptStatusAction('r2', RentReceiptStatus.LATE);
    expect(vi.mocked(receiptDb.updateReceiptStatus)).toHaveBeenCalledWith('r2', RentReceiptStatus.LATE);
  });
});
