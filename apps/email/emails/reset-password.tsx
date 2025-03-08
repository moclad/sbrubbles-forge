import { ResetPasswordTemplate } from '@repo/email/templates/reset-password';

const ResetPasswordEmail = () => (
  <ResetPasswordTemplate
    name='Joe Smith'
    email='joe.smith@example.com'
    resetUrl='https://example.com/reset-password'
  />
);

export default ResetPasswordEmail;
