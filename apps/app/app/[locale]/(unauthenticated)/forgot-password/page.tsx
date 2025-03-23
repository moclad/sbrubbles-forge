import dynamic from 'next/dynamic';

import { createMetadata } from '@repo/seo/metadata';

import type { Metadata } from 'next';

const ForgotPassword = dynamic(() =>
  import('@repo/auth/components/forgot-password').then(
    (mod) => mod.ForgotPassword
  )
);
const title = 'Forgot password';
const description = 'Enter your email to reset your password.';
export const metadata: Metadata = createMetadata({ title, description });

const ForgotPasswordPage = () => (
  <>
    <div className='flex flex-col space-y-2 text-center'>
      <h1 className='font-semibold text-2xl tracking-tight '>{title}</h1>
      <p className='text-muted-foreground text-sm'>{description}</p>
    </div>
    <ForgotPassword />
  </>
);

export default ForgotPasswordPage;
