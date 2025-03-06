import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Link,
} from '@react-email/components';

interface AfterSignUpProps {
  name: string;
}

export default function AfterSignUp({ name }: AfterSignUpProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur Renty !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Bienvenue sur Renty, {name} ! 🎉</Heading>
          <Text style={text}>
            Nous sommes ravis de vous compter parmi nous.
          </Text>
          
          <div style={buttonContainer}>
            <Button
              style={button}
              href="https://app.renty.cc/"
            >
              Commencer
            </Button>
          </div>
          
          <Text style={helpText}>
            Besoin d&apos;aide ? Contactez notre équipe support à{' '}
            <Link href="mailto:support@renty.cc" style={link}>
              support@renty.cc
            </Link>
          </Text>
          
          <Text style={footer}>
            © 2024 Renty. Tous droits réservés.
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
  textAlign: 'center' as const,
};

const text = {
  color: '#444444',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const button = {
  backgroundColor: '#000',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 24px',
};

const helpText = {
  ...text,
  margin: '0 0 12px',
};

const link = {
  color: '#0066FF',
  textDecoration: 'none',
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  textAlign: 'center' as const,
};
