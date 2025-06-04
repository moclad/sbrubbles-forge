import { getI18n } from '@repo/localization/i18n/server';
import { createMetadata } from '@repo/seo/metadata';

import type { Metadata } from 'next';

const title = 'Welcome back';
const description = 'Enter your details to sign in.';
export const metadata: Metadata = createMetadata({ title, description });

const SignInPage = async () => {
  const t = await getI18n();

  return <>Two Factor</>;
};

export default SignInPage;
