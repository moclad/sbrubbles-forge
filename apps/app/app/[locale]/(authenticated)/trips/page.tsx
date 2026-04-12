import { PageContent } from '@repo/design-system/components/page-content';
import { getI18n } from '@repo/localization/i18n/server';
import type { Metadata } from 'next';
import { getPeople } from '@/lib/people-actions';
import { getTrips } from '@/lib/trips-actions';
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
  const [trips, people] = await Promise.all([getTrips(), getPeople()]);

  return (
    <PageContent header={t('trips.title')} subTitle={t('trips.subTitle')}>
      <TripsTable people={people} trips={trips} />
    </PageContent>
  );
};

export default Page;
