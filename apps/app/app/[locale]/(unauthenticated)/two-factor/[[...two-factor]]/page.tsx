import { TwoFactorForm } from '@repo/auth/components/auth/two-factor';
import { getI18n } from '@repo/localization/i18n/server';
import { createMetadata } from '@repo/seo/metadata';

import type { Metadata } from 'next';
const title = 'Welcome back';
const description = 'Enter your details to sign in.';
export const metadata: Metadata = createMetadata({ title, description });

const TwoFactorPage = async () => {
  const t = await getI18n();

  return (
    <>
      <div className='flex flex-col space-y-2 text-center '>
        <h1 className='font-semibold text-2xl tracking-tight '>
          {t('authentication.twoFactor')}
        </h1>
        <p className='text-muted-foreground text-sm'>
          {t('authentication.twoFactorDescription')}
        </p>
      </div>

      <TwoFactorForm />
    </>
  );
};

export default TwoFactorPage;
