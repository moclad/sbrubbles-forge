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
  readonly resetUrl: string;
};

export function ResetPasswordTemplate({ name, email, resetUrl }: Props) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Body style={main}>
          <Preview>Password Reset</Preview>
          <Container style={container}>
            <Section>
              <Text style={text}>Hello {name},</Text>
              <Text style={text}>
                We received a request to reset the password for your account:
              </Text>
              <Button style={button} href={resetUrl}>
                Reset password
              </Button>
              <Text style={text}>
                If you don&apos;t want to change your password or didn&apos;t
                request this, just ignore and delete this message.
              </Text>
              <Text style={text}>
                To keep your account secure, please don&apos;t forward this
                email to anyone.
              </Text>
              <Text style={text}>Happy Sbrubbling!</Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export default ResetPasswordTemplate;

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
  fontSize: '16px',
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: '300',
  color: '#404040',
  lineHeight: '26px',
};

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
};

const anchor = {
  textDecoration: 'underline',
};
