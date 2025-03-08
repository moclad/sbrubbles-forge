import { resend } from '@repo/email';
import { ResetPasswordTemplate } from '@repo/email/templates/reset-password';

async function sendResetEmail(name: string, email: string, url: string) {
  await resend.emails.send({
    from: 'noreply@sbrubbles.work',
    to: email,
    subject: 'Reset your password',
    react: <ResetPasswordTemplate name={name} email={email} resetUrl={url} />,
  });
}

export default sendResetEmail;
