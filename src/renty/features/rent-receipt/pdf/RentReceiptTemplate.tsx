import type { property, rentReceipt, tenant, user } from '@prisma/client';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
  tenant: tenant;
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

export function RentReceiptTemplate({ receipt, property, tenant }: RentReceiptTemplateProps) {
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
            <Text style={styles.label}>LOCATAIRE</Text>
            <Text style={styles.value}>{tenant.firstName} {tenant.lastName}</Text>
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
                <Text>Loyer</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellBorder]}>
                <Text>{formatCurrency(receipt.baseRent)}</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text>Charges</Text>
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
            Je soussigné(e) {property.user.name}, propriétaire du logement désigné ci-dessus,
            déclare avoir reçu de {tenant.firstName} {tenant.lastName} la somme de {formatCurrency(receipt.baseRent + receipt.charges)}
            {" "}au titre du paiement du loyer et des charges pour la période indiquée ci-dessus.
          </Text>
          <Text style={{ marginTop: 20 }}>
            Fait le {formatDate(new Date())}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
