import dynamic from 'next/dynamic';

import { getI18n } from '@repo/localization/i18n/server';
import { createMetadata } from '@repo/seo/metadata';

import type { Metadata } from 'next';
const title = 'Create an account';
const description = 'Enter your details to get started.';
const SignUp = dynamic(() =>
  import('@repo/auth/components/sign-up').then((mod) => mod.SignUp)
);

export const metadata: Metadata = createMetadata({ title, description });

const SignUpPage = async () => {
  const t = await getI18n();

  return (
    <>
      <div className='flex flex-col space-y-2 text-center'>
        <h1 className='font-semibold text-2xl tracking-tight'>
          {t('authentication.createAccount')}
        </h1>
        <p className='text-muted-foreground text-sm'>
          {t('authentication.createSubTitle')}
        </p>
      </div>
      <SignUp />
    </>
  );
};

export default SignUpPage;
