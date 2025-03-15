import { WelcomeTemplate } from '@repo/email/templates/welcome';

const WelcomeEmail = () => (
  <WelcomeTemplate
    name='Joe Smith'
    email='joe.smith@example.com'
    confirmationUrl='https://example.com/reset-password'
  />
);

export default WelcomeEmail;
