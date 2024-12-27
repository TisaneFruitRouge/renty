import type { property, rentReceipt, tenant } from '@prisma/client';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
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
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
  },
});

interface RentReceiptTemplateProps {
  receipt: rentReceipt;
  property: property;
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
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function RentReceiptTemplate({ receipt, property, tenant }: RentReceiptTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Quittance de Loyer</Text>
          <Text style={styles.value}>Période du {formatDate(receipt.startDate)} au {formatDate(receipt.endDate)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>PROPRIÉTAIRE</Text>
          <Text style={styles.value}>{property.userId}</Text>
          <Text style={styles.value}>{property.address}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>LOCATAIRE</Text>
          <Text style={styles.value}>{tenant.firstName} {tenant.lastName}</Text>
          <Text style={styles.value}>{property.address}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>DÉTAILS DU PAIEMENT</Text>
          <Text style={styles.value}>Loyer: {formatCurrency(receipt.baseRent)}</Text>
          <Text style={styles.value}>Charges: {formatCurrency(receipt.charges)}</Text>
          <Text style={styles.value}>Total: {formatCurrency(receipt.baseRent + receipt.charges)}</Text>
        </View>

        <View style={styles.footer}>
          <Text>
            Je soussigné(e) {property.userId}, propriétaire du logement désigné ci-dessus,
            déclare avoir reçu de {tenant.firstName} {tenant.lastName} la somme de {formatCurrency(receipt.baseRent + receipt.charges)} 
            au titre du paiement du loyer et des charges pour la période indiquée ci-dessus.
          </Text>
          <Text style={{ marginTop: 20 }}>
            Fait le {formatDate(new Date())}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
