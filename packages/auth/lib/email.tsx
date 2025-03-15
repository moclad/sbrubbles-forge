import { resend } from '@repo/email';
import { ResetPasswordTemplate } from '@repo/email/templates/reset-password';
import { WelcomeTemplate } from '@repo/email/templates/welcome';

export async function sendResetEmail(name: string, email: string, url: string) {
  await resend.emails.send({
    from: 'noreply@sbrubbles.work',
    to: email,
    subject: 'Reset your password',
    react: <ResetPasswordTemplate name={name} email={email} resetUrl={url} />,
  });
}

export async function sendWelcomeEmail(
  name: string,
  email: string,
  url: string
) {
  await resend.emails.send({
    from: 'noreply@sbrubbles.work',
    to: email,
    subject: 'Welcome to Beauty Vault V2',
    react: <WelcomeTemplate name={name} email={email} confirmationUrl={url} />,
  });
}
