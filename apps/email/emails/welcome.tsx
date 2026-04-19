import { WelcomeTemplate } from '@repo/email/templates/welcome';

const WelcomeEmail = () => (
  <WelcomeTemplate
    confirmationUrl='https://example.com/reset-password'
    email='joe.smith@example.com'
    name='Joe Smith'
  />
);

export default WelcomeEmail;
