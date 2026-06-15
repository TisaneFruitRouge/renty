"use node";

import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { Resend } from "resend";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

type AppUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  state?: string | null;
};

type PropertyContext = {
  id: string;
  title: string;
  address: string;
  city: string;
  postalCode: string;
  state: string;
  user: AppUser | null;
  leases: Array<{
    id: string;
    leaseType: string;
    paymentFrequency: string;
    tenants: Tenant[];
  }>;
};

type Tenant = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Receipt = {
  id: string;
  startDate: number | Date;
  endDate: number | Date;
  baseRent: number;
  charges: number;
  blobUrl?: string | null;
  storageId?: string | null;
  property: (PropertyContext & { user: AppUser | null }) | null;
  tenant: Tenant | null;
  lease?: { tenants?: Tenant[] | null } | null;
};

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { marginBottom: 20 },
  title: { fontSize: 18, marginBottom: 10, textAlign: "center" },
  landlordAndTenant: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  landlordAndTenantSection: { maxWidth: "48%" },
  section: { marginBottom: 10 },
  label: { fontSize: 10, color: "#666", marginBottom: 2 },
  value: { fontSize: 12, marginBottom: 3 },
  tenantValue: { fontSize: 11, marginBottom: 2 },
  paymentPeriod: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    margin: "20 0",
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    textAlign: "center",
    color: "#666",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#666",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#666",
    borderBottomStyle: "solid",
  },
  tableCell: { flex: 1, padding: 8, fontSize: 12 },
  tableCellBorder: {
    borderLeftWidth: 1,
    borderLeftColor: "#666",
    borderLeftStyle: "solid",
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontSize: 10,
    color: "#666",
  },
});

function asDate(value: number | Date) {
  return value instanceof Date ? value : new Date(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
  }).format(date);
}

function formatCurrency(amount: number) {
  const [intPart, decPart] = amount.toFixed(2).split(".");
  return `${intPart},${decPart} €`;
}

function formatTenantNames(tenants: Tenant[]) {
  if (tenants.length === 1) return `${tenants[0].firstName} ${tenants[0].lastName}`;
  if (tenants.length === 2) {
    return `${tenants[0].firstName} ${tenants[0].lastName} et ${tenants[1].firstName} ${tenants[1].lastName}`;
  }
  const allButLast = tenants.slice(0, -1).map((t) => `${t.firstName} ${t.lastName}`).join(", ");
  const last = tenants[tenants.length - 1];
  return `${allButLast} et ${last.firstName} ${last.lastName}`;
}

function RentReceiptTemplate({
  receipt,
  property,
  tenants,
}: {
  receipt: Receipt;
  property: PropertyContext & { user: AppUser | null };
  tenants: Tenant[];
}) {
  const isSharedLease = tenants.length > 1;
  const tenantNames = formatTenantNames(tenants);
  const landlordName = property.user?.name || "Renty";
  const amount = formatCurrency(receipt.baseRent + receipt.charges);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Quittance de Loyer</Text>
        </View>

        <View style={styles.landlordAndTenant}>
          <View style={styles.landlordAndTenantSection}>
            <Text style={styles.label}>PROPRIÉTAIRE</Text>
            <Text style={styles.value}>{landlordName}</Text>
            {property.user?.address && (
              <Text style={styles.value} wrap>
                {property.user.address},
                {property.user.city && ` ${property.user.city}`}
                {property.user.postalCode && ` ${property.user.postalCode}`}
                {property.user.state && ` ${property.user.state}`}
              </Text>
            )}
            {property.user?.email && <Text style={styles.value} wrap>Email: {property.user.email}</Text>}
          </View>

          <View style={styles.landlordAndTenantSection}>
            <Text style={styles.label}>{isSharedLease ? "LOCATAIRES" : "LOCATAIRE"}</Text>
            {isSharedLease ? (
              tenants.map((tenant) => (
                <Text key={tenant.id} style={styles.tenantValue}>
                  {tenant.firstName} {tenant.lastName}
                </Text>
              ))
            ) : (
              <Text style={styles.value}>{tenants[0]?.firstName} {tenants[0]?.lastName}</Text>
            )}
            <Text style={styles.value} wrap>
              {property.address},
              {property.city && ` ${property.city}`}
              {property.postalCode && ` ${property.postalCode}`}
              {property.state && ` ${property.state}`}
            </Text>
          </View>
        </View>

        <Text style={styles.paymentPeriod}>
          Période du {formatDate(asDate(receipt.startDate))} au {formatDate(asDate(receipt.endDate))}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>DÉTAILS DU PAIEMENT</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCell}><Text>Description</Text></View>
              <View style={[styles.tableCell, styles.tableCellBorder]}><Text>Montant</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}><Text>Loyer hors charges:</Text></View>
              <View style={[styles.tableCell, styles.tableCellBorder]}><Text>{formatCurrency(receipt.baseRent)}</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}><Text>Charges:</Text></View>
              <View style={[styles.tableCell, styles.tableCellBorder]}><Text>{formatCurrency(receipt.charges)}</Text></View>
            </View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCell}><Text>Total</Text></View>
              <View style={[styles.tableCell, styles.tableCellBorder]}><Text>{amount}</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Je soussigné(e) {landlordName}, propriétaire du logement désigné ci-dessus,
            déclare avoir reçu de {tenantNames} la somme de {amount} au titre du paiement
            du loyer et des charges pour la période indiquée.
          </Text>
          <Text style={{ marginTop: 20 }}>Fait le {formatDate(new Date())}</Text>
        </View>
      </Page>
    </Document>
  );
}

function tenantsForReceipt(receipt: Receipt) {
  const leaseTenants = receipt.lease?.tenants ?? [];
  if (leaseTenants.length > 0) return leaseTenants;
  return receipt.tenant ? [receipt.tenant] : [];
}

async function renderReceiptPdf(receipt: Receipt) {
  if (!receipt.property) throw new Error("Receipt property not found");
  const tenants = tenantsForReceipt(receipt);
  if (tenants.length === 0) throw new Error("At least one tenant is required to generate a PDF");

  return renderToBuffer(
    <RentReceiptTemplate receipt={receipt} property={receipt.property} tenants={tenants} />,
  );
}

function emailHtml(tenantName: string, month: string) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:580px;margin:0 auto;padding:20px 0 48px">
      <h1 style="color:#1a1a1a;font-size:24px;font-weight:600;line-height:40px;margin:0 0 20px">Bonjour ${tenantName},</h1>
      <p style="color:#444;font-size:16px;line-height:24px;margin:0 0 20px">Veuillez trouver ci-joint votre quittance de loyer pour ${month}.</p>
      <p style="color:#898989;font-size:14px;line-height:22px;margin:0">Cordialement,<br/>L'équipe Renty</p>
    </div>
  `;
}

async function sendReceiptEmails(receipt: Receipt, pdfBuffer: Buffer) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured in Convex");
  }
  if (!receipt.property?.user?.email) {
    throw new Error("Landlord email is missing");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const month = formatMonth(asDate(receipt.startDate));
  const tenants = tenantsForReceipt(receipt);

  for (const tenant of tenants) {
    await resend.emails.send({
      from: "Renty <little-bot@renty.cc>",
      to: tenant.email,
      cc: receipt.property.user.email,
      subject: `Quittance de loyer - ${month}`,
      html: emailHtml(tenant.firstName, month),
      attachments: [{
        filename: `quittance-${month}.pdf`,
        content: pdfBuffer,
      }],
    });
  }
}

async function storePdf(ctx: any, receiptId: string, pdfBuffer: Buffer) {
  const blob = new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" });
  const storageId = await ctx.storage.store(blob);
  const url = await ctx.storage.getUrl(storageId);
  if (!url) throw new Error("Generated PDF is not available from Convex storage");

  await ctx.runMutation(api.rentReceipts.attachPdf, {
    id: receiptId,
    blobUrl: url,
    storageId,
    name: `quittance-${receiptId}.pdf`,
    size: pdfBuffer.byteLength,
  });

  return { storageId, url };
}

async function pdfBufferForExistingReceipt(ctx: any, receipt: Receipt) {
  if (receipt.storageId) {
    const blob = await ctx.storage.get(receipt.storageId);
    if (blob) return Buffer.from(await blob.arrayBuffer());
  }
  if (receipt.blobUrl) {
    const response = await fetch(receipt.blobUrl);
    if (response.ok) return Buffer.from(await response.arrayBuffer());
  }

  const pdfBuffer = await renderReceiptPdf(receipt);
  await storePdf(ctx, receipt.id, pdfBuffer);
  return pdfBuffer;
}

export const createAndProcess = action({
  args: {
    userId: v.string(),
    propertyId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    baseRent: v.number(),
    charges: v.number(),
    sendMail: v.boolean(),
  },
  handler: async (ctx, args): Promise<Receipt> => {
    const propertyForUser = await ctx.runQuery(api.properties.getForUser, {
      id: args.propertyId,
      userId: args.userId,
    });
    if (!propertyForUser) throw new Error("Property not found or access denied");

    const property = await ctx.runQuery(api.properties.getReceiptContext, { id: args.propertyId }) as PropertyContext | null;
    if (!property || !property.user) throw new Error("Property receipt context not found");

    const activeLease = property.leases[0];
    if (!activeLease) throw new Error("No active leases found for this property");
    if (!activeLease.tenants || activeLease.tenants.length === 0) {
      throw new Error("No tenants found in active lease for this property");
    }

    const receipt = activeLease.leaseType === "SHARED" && activeLease.tenants.length > 1
      ? await ctx.runMutation(api.rentReceipts.createShared, {
          startDate: args.startDate,
          endDate: args.endDate,
          baseRent: args.baseRent,
          charges: args.charges,
          paymentFrequency: activeLease.paymentFrequency,
          propertyId: property.id,
          tenantIds: activeLease.tenants.map((tenant) => tenant.id),
          leaseId: activeLease.id,
        })
      : await ctx.runMutation(api.rentReceipts.create, {
          startDate: args.startDate,
          endDate: args.endDate,
          baseRent: args.baseRent,
          charges: args.charges,
          paymentFrequency: activeLease.paymentFrequency,
          propertyId: property.id,
          tenantId: activeLease.tenants[0].id,
          leaseId: activeLease.id,
        });

    const fullReceipt = await ctx.runQuery(api.rentReceipts.getById, { id: receipt.id }) as Receipt | null;
    if (!fullReceipt) throw new Error("Created receipt could not be loaded");

    const pdfBuffer = await renderReceiptPdf(fullReceipt);
    await storePdf(ctx, receipt.id, pdfBuffer);

    const receiptWithPdf = await ctx.runQuery(api.rentReceipts.getById, { id: receipt.id }) as Receipt | null;
    if (!receiptWithPdf) throw new Error("Receipt could not be loaded after PDF generation");

    if (args.sendMail) {
      await sendReceiptEmails(receiptWithPdf, pdfBuffer);
    }

    return receiptWithPdf;
  },
});

export const sendExisting = action({
  args: {
    receiptId: v.string(),
  },
  handler: async (ctx, { receiptId }): Promise<unknown> => {
    const receipt = await ctx.runQuery(api.rentReceipts.getById, { id: receiptId }) as Receipt | null;
    if (!receipt) throw new Error("Receipt not found");

    const pdfBuffer = await pdfBufferForExistingReceipt(ctx, receipt);
    await sendReceiptEmails(receipt, pdfBuffer);
    await ctx.runMutation(api.rentReceipts.updateStatus, {
      id: receiptId,
      status: "PAID",
    });

    return await ctx.runQuery(api.rentReceipts.getById, { id: receiptId });
  },
});
