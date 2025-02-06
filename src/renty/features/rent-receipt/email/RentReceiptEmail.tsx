import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';

interface RentReceiptEmailProps {
  tenantName: string;
  month: string;
}

export default function RentReceiptEmail({
  tenantName,
  month,
}: RentReceiptEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre quittance de loyer - {month}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Bonjour {tenantName},</Heading>
          <Text style={text}>
            Veuillez trouver ci-joint votre quittance de loyer pour {month}.
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

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};
