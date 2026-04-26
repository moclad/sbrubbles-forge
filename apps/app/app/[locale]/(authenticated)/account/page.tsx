import { UserAccount } from '@repo/auth/components/user-account';
import { PageContent } from '@repo/design-system/components/page-content';
import { getI18n } from '@repo/localization/i18n/server';
import { Loader } from 'lucide-react';
import type { Metadata } from 'next';
import { Suspense } from 'react';

const title = 'Acme Inc';
const description = 'My application.';

export const metadata: Metadata = {
  description,
  title,
};

const Page = async () => {
  const t = await getI18n();

  return (
    <Suspense
      fallback={
        <div className='flex h-[50vh] items-center justify-center'>
          <Loader className='h-8 w-8 animate-spin' />
        </div>
      }
    >
      <PageContent header={t('account.title')} subTitle={t('account.subTitle')}>
        <UserAccount />
      </PageContent>
    </Suspense>
  );
};

export default Page;
