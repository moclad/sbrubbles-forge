import { PageContent } from '@repo/design-system/components/page-content';
import { Loader } from 'lucide-react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getUserPreferences } from '@/lib/user-preferences-actions';
import { ConfigurationForm } from './components/configuration-form';

export async function generateMetadata(): Promise<Metadata> {
  return {
    description: 'Manage your application settings and preferences',
    title: 'Configuration',
  };
}

const Page = async () => {
  const preferences = await getUserPreferences();

  return (
    <Suspense
      fallback={
        <div className='flex h-[50vh] items-center justify-center'>
          <Loader className='h-8 w-8 animate-spin' />
        </div>
      }
    >
      <PageContent header='Configuration' subTitle='Manage your application settings and preferences'>
        <ConfigurationForm initialCurrency={preferences.currency} />
      </PageContent>
    </Suspense>
  );
};

export default Page;
