import { PageContent } from '@repo/design-system/components/page-content';
import { getI18n } from '@repo/localization/i18n/server';
import { Loader } from 'lucide-react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getPeople } from '@/lib/people-actions';
import { getTrips } from '@/lib/trips-actions';
import { getUserPreferences } from '@/lib/user-preferences-actions';
import { TripsTable } from './components/trips-table';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n();
  return {
    description: t('trips.metaDescription'),
    title: t('trips.title'),
  };
}

const Page = async () => {
  const t = await getI18n();
  const [trips, people, userPreferences] = await Promise.all([getTrips(), getPeople(), getUserPreferences()]);

  return (
    <Suspense
      fallback={
        <div className='flex h-[50vh] items-center justify-center'>
          <Loader className='h-8 w-8 animate-spin' />
        </div>
      }
    >
      <PageContent header={t('trips.title')} subTitle={t('trips.subTitle')}>
        <TripsTable currency={userPreferences.currency} people={people} trips={trips} />
      </PageContent>
    </Suspense>
  );
};

export default Page;
