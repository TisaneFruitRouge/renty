import type { property, rentReceipt, tenant, user } from '@prisma/client';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface Translations {
  landlordTitle: string;
  tenantTitle: string;
  tenantsTitle: string;
  propertyTitle: string;
  periodTitle: string;
  rentDetailsTitle: string;
  baseRent: string;
  charges: string;
  totalAmount: string;
  receiptDeclaration: string;
  madeOn: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    //fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  landlordAndTenant: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  landlordAndTenantSection: {
    maxWidth: '48%', // Limit width to prevent overlap
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    marginBottom: 3,
  },
  tenantValue: {
    fontSize: 11,
    marginBottom: 2,
  },
  paymentPeriod: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    margin: "20 0"
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#666',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    borderBottomStyle: 'solid',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
  },
  tableCellBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#666',
    borderLeftStyle: 'solid',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontSize: 10,
    color: '#666',
  },
});

interface RentReceiptTemplateProps {
  receipt: rentReceipt;
  property: property & {user: user};
  tenant?: tenant; // For individual/colocation leases
  tenants?: tenant[]; // For shared leases
  translations: Translations;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function formatCurrency(amount: number) {
  // Format the number manually without thousands separators
  // Convert to string with 2 decimal places
  const amountStr = amount.toFixed(2);
  
  // Split into integer and decimal parts
  const [intPart, decPart] = amountStr.split('.');

  // Return formatted number with euro symbol, using comma as decimal separator
  return `${intPart},${decPart} €`;
}

function formatTenantNames(tenants: tenant[]): string {
  if (tenants.length === 1) {
    return `${tenants[0].firstName} ${tenants[0].lastName}`;
  } else if (tenants.length === 2) {
    return `${tenants[0].firstName} ${tenants[0].lastName} et ${tenants[1].firstName} ${tenants[1].lastName}`;
  } else {
    const allButLast = tenants.slice(0, -1).map(t => `${t.firstName} ${t.lastName}`).join(', ');
    const last = tenants[tenants.length - 1];
    return `${allButLast} et ${last.firstName} ${last.lastName}`;
  }
}

export function RentReceiptTemplate({ receipt, property, tenant, tenants, translations }: RentReceiptTemplateProps) {
  // Determine which tenants to use
  const allTenants = tenants && tenants.length > 0 ? tenants : (tenant ? [tenant] : []);
  const isSharedLease = allTenants.length > 1;
  const tenantNames = formatTenantNames(allTenants);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Quittance de Loyer</Text>
        </View>

        <View style={styles.landlordAndTenant}>
          <View style={styles.landlordAndTenantSection}>
            <Text style={styles.label}>PROPRIÉTAIRE</Text>
            <Text style={styles.value}>{property.user.name}</Text>
            {property.user.address && (
              <Text style={styles.value} wrap>
                {property.user.address},
                {property.user.city && ` ${property.user.city}`}
                {property.user.postalCode && ` ${property.user.postalCode}`}
                {property.user.state && ` ${property.user.state}`}
              </Text>
            )}
            {property.user.email && <Text style={styles.value} wrap>Email: {property.user.email}</Text>}
          </View>

          <View style={styles.landlordAndTenantSection}>
            <Text style={styles.label}>
              {isSharedLease ? translations.tenantsTitle.toUpperCase() : translations.tenantTitle.toUpperCase()}
            </Text>
            {isSharedLease ? (
              allTenants.map((t) => (
                <Text key={t.id} style={styles.tenantValue}>
                  {t.firstName} {t.lastName}
                </Text>
              ))
            ) : (
              <Text style={styles.value}>{allTenants[0]?.firstName} {allTenants[0]?.lastName}</Text>
            )}
            <Text style={styles.value} wrap>
              {property.address},
              {property.city && ` ${property.city}`}
              {property.postalCode && ` ${property.postalCode}`}
              {property.state && ` ${property.state}`}
            </Text>
          </View>
        </View>

        <Text style={styles.paymentPeriod}>Période du {formatDate(receipt.startDate)} au {formatDate(receipt.endDate)}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>DÉTAILS DU PAIEMENT</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCell}>
                <Text>Description</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellBorder]}>
                <Text>Montant</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text>{translations.baseRent}:</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellBorder]}>
                <Text>{formatCurrency(receipt.baseRent)}</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text>{translations.charges}:</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellBorder]}>
                <Text>{formatCurrency(receipt.charges)}</Text>
              </View>
            </View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCell}>
                <Text>Total</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellBorder]}>
                <Text>{formatCurrency(receipt.baseRent + receipt.charges)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            {translations.receiptDeclaration}
          </Text>
          <Text style={{ marginTop: 20 }}>
            {translations.madeOn} {formatDate(new Date())}
          </Text>
        </View>
      </Page>
    </Document>
  );
}