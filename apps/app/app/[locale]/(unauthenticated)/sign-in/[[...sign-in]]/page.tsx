import dynamic from 'next/dynamic';

import { getI18n } from '@repo/localization/i18n/server';
import { createMetadata } from '@repo/seo/metadata';

import type { Metadata } from 'next';
const SignIn = dynamic(() =>
  import('@repo/auth/components/auth/sign-in').then((mod) => mod.SignIn)
);

const title = 'Welcome back';
const description = 'Enter your details to sign in.';
export const metadata: Metadata = createMetadata({ title, description });

const SignInPage = async () => {
  const t = await getI18n();

  return (
    <>
      <div className='flex flex-col space-y-2 text-center '>
        <h1 className='font-semibold text-2xl tracking-tight '>
          {t('authentication.welcome')}
        </h1>
        <p className='text-muted-foreground text-sm'>
          {t('authentication.welcomeSubTitle')}
        </p>
      </div>
      <SignIn />
    </>
  );
};

export default SignInPage;
