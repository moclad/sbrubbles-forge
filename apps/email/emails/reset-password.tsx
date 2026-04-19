import { ResetPasswordTemplate } from '@repo/email/templates/reset-password';

const ResetPasswordEmail = () => (
  <ResetPasswordTemplate email='joe.smith@example.com' name='Joe Smith' resetUrl='https://example.com/reset-password' />
);

export default ResetPasswordEmail;
