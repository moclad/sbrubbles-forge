import dynamic from 'next/dynamic';

import { getI18n } from '@repo/localization/i18n/server';
import { createMetadata } from '@repo/seo/metadata';

import type { Metadata } from 'next';

const ForgotPassword = dynamic(() =>
  import('@repo/auth/components/auth/forgot-password').then(
    (mod) => mod.ForgotPassword
  )
);
const title = 'Forgot password';
const description = 'Enter your email to reset your password.';
export const metadata: Metadata = createMetadata({ title, description });

const ForgotPasswordPage = async () => {
  const t = await getI18n();
  return (
    <>
      <div className='flex flex-col space-y-2 text-center'>
        <h1 className='font-semibold text-2xl tracking-tight '>
          {t('authentication.forgotPassword')}
        </h1>
        <p className='text-muted-foreground text-sm'>
          {t('authentication.forgotSubTitle')}
        </p>
      </div>
      <ForgotPassword />
    </>
  );
};

export default ForgotPasswordPage;
