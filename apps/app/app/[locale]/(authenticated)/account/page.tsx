import { UserAccount } from '@repo/auth/components/user-account';
import { PageContent } from '@repo/design-system/components/page-content';
import {} from '@repo/design-system/components/ui/tabs';
import { getI18n } from '@repo/localization/i18n/server';

import { UserAccountA } from './test';

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
    <PageContent header={t('account.title')} subTitle={t('account.subTitle')}>
      <UserAccount />
    </PageContent>
  );
};

export default Page;
