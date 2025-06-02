import { PageContent } from '@repo/design-system/components/page-content';
import { getI18n } from '@repo/localization/i18n/server';

import type { Metadata } from 'next';
const title = 'Acme Inc';
const description = 'My application.';

export const metadata: Metadata = {
  title,
  description,
};

const Page = async () => {
  const t = await getI18n();

  return (
    <PageContent
      header={t('account.twoFactor')}
      subTitle={t('account.twoFactorDescription')}
    ></PageContent>
  );
};

export default Page;
