import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

type Props = {
  readonly name: string;
  readonly email: string;
  readonly confirmationUrl: string;
};

export function WelcomeTemplate({ name, email, confirmationUrl }: Props) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Body style={main}>
          <Preview>Welcome to Sbrubbles Forge</Preview>
          <Container style={container}>
            <Section>
              <Text style={text}>Hello {name},</Text>
              <Text style={text}>
                Thank you for registering into our Application. Much
                Appreciated! Just one last step is laying ahead of you...
              </Text>
              <Text style={text}>
                Confirm your email address by clicking the link below:
              </Text>
              <Button href={confirmationUrl} style={button}>
                Activate account
              </Button>
              <Text style={text}>Happy Sbrubbling!</Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export default WelcomeTemplate;

const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
};

const text = {
  color: '#404040',
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontSize: '16px',
  fontWeight: '300',
  lineHeight: '26px',
};

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  display: 'block',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: '15px',
  padding: '14px 7px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '210px',
};

const anchor = {
  textDecoration: 'underline',
};
