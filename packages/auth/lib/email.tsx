import { resend } from '@repo/email';
import { ResetPasswordTemplate } from '@repo/email/templates/reset-password';
import { WelcomeTemplate } from '@repo/email/templates/welcome';

export async function sendResetEmail(name: string, email: string, url: string) {
  await resend.emails.send({
    from: 'noreply@sbrubbles.work',
    react: <ResetPasswordTemplate email={email} name={name} resetUrl={url} />,
    subject: 'Reset your password',
    to: email,
  });
}

export async function sendWelcomeEmail(
  name: string,
  email: string,
  url: string
) {
  await resend.emails.send({
    from: 'noreply@sbrubbles.work',
    react: <WelcomeTemplate confirmationUrl={url} email={email} name={name} />,
    subject: 'Welcome to Sbrubbles Forge',
    to: email,
  });
}
