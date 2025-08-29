import { renderToBuffer } from '@react-pdf/renderer';
import { RentReceiptTemplate } from './RentReceiptTemplate';
import { getTranslations } from 'next-intl/server';
import type { rentReceipt, property, tenant, user } from '@prisma/client';

interface GeneratePDFParams {
  receipt: rentReceipt;
  property: property & {user: user};
  tenant?: tenant; // For individual/colocation leases
  tenants?: tenant[]; // For shared leases
}

export async function generatePDF({
  receipt,
  property,
  tenant,
  tenants
}: GeneratePDFParams): Promise<Buffer> {
  try {
    // Get translations for PDF
    const t = await getTranslations('rent-receipts.pdf');

    // Format tenant names for the receipt
    const allTenants = tenants && tenants.length > 0 ? tenants : (tenant ? [tenant] : []);
    let tenantNames: string;
    if (allTenants.length === 1) {
      tenantNames = `${allTenants[0].firstName} ${allTenants[0].lastName}`;
    } else if (allTenants.length === 2) {
      tenantNames = `${allTenants[0].firstName} ${allTenants[0].lastName} et ${allTenants[1].firstName} ${allTenants[1].lastName}`;
    } else {
      const allButLast = allTenants.slice(0, -1).map(t => `${t.firstName} ${t.lastName}`).join(', ');
      const last = allTenants[allTenants.length - 1];
      tenantNames = `${allButLast} et ${last.firstName} ${last.lastName}`;
    }

    // Calculate total amount
    const totalAmount = receipt.baseRent + receipt.charges;
    
    // Format currency for receipt declaration
    const formattedAmount = totalAmount.toFixed(2).replace('.', ',') + ' €';

    const translations = {
      landlordTitle: t('landlord-title'),
      tenantTitle: t('tenant-title'),
      tenantsTitle: t('tenants-title'),
      propertyTitle: t('property-title'),
      periodTitle: t('period-title'),
      rentDetailsTitle: t('rent-details-title'),
      baseRent: t('base-rent'),
      charges: t('charges'),
      totalAmount: t('total-amount'),
      receiptDeclaration: t('receipt-declaration', {
        landlordName: property.user.name,
        tenantName: tenantNames,
        amount: formattedAmount
      }),
      madeOn: t('made-on')
    };

    // Validate that we have at least one tenant
    if (!tenant && (!tenants || tenants.length === 0)) {
      throw new Error('At least one tenant is required to generate a PDF');
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      RentReceiptTemplate({
        receipt,
        property,
        tenant,
        tenants,
        translations,
      })
    );

    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

// Legacy function for backward compatibility - single tenant
export async function generatePDFSingleTenant(
  receipt: rentReceipt,
  property: property & {user: user},
  tenant: tenant
): Promise<Buffer> {
  return generatePDF({
    receipt,
    property,
    tenant
  });
}

// Function for multiple tenants (shared lease)
export async function generatePDFMultipleTenants(
  receipt: rentReceipt,
  property: property & {user: user},
  tenants: tenant[]
): Promise<Buffer> {
  return generatePDF({
    receipt,
    property,
    tenants
  });
}
