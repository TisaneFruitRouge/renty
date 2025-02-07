import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RentReceiptReviewEmailProps {
  landlordName: string;
  propertyTitle: string;
  month: Date;
  reviewUrl: string;
}

const formatDate = (date: Date) => {
  return format(date, 'MMMM yyyy', { locale: fr });
};

export default function RentReceiptReviewEmail({
  landlordName,
  propertyTitle,
  month,
  reviewUrl,
}: RentReceiptReviewEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nouvelle quittance de loyer à valider - {propertyTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Bonjour {landlordName},</Heading>
          <Text style={text}>
            Une nouvelle quittance de loyer a été générée pour votre propriété &quot;{propertyTitle}&quot; pour le mois de {formatDate(month)}.
          </Text>
          <Text style={text}>
            Vous pouvez la consulter et la valider en cliquant sur le lien ci-dessous :
          </Text>
          <Link href={reviewUrl} style={button}>
            Consulter la quittance
          </Link>
          <Text style={text}>
            Si vous ne validez pas la quittance, elle sera automatiquement envoyée dans quelques jours.
          </Text>
          <Text style={footer}>
            Cordialement,<br />
            L&apos;équipe Renty
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const text = {
  color: '#444444',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '50px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '100%',
  marginBottom: '20px',
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};
