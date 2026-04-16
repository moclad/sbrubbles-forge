import { PageContent } from '@repo/design-system/components/page-content';
import { getI18n } from '@repo/localization/i18n/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories } from '@/lib/categories-actions';
import { getExpensesByTrip } from '@/lib/expenses-actions';
import { getPeople } from '@/lib/people-actions';
import { getTripById } from '@/lib/trips-actions';
import { TripDetailsClient } from './components/trip-details-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n();
  return {
    description: t('trips.details.metaDescription'),
    title: t('trips.details.title'),
  };
}

type TripDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const Page = async ({ params }: TripDetailsPageProps) => {
  const { id } = await params;
  const t = await getI18n();

  const [trip, categories, people, expenses] = await Promise.all([
    getTripById(id),
    getCategories(),
    getPeople(),
    getExpensesByTrip(id),
  ]);

  if (!trip) {
    notFound();
  }

  return (
    <PageContent
      header={t('trips.details.title')}
      subTitle={t('trips.details.subTitle')}
    >
      <TripDetailsClient
        categories={categories}
        expenses={expenses}
        people={people}
        trip={trip}
      />
    </PageContent>
  );
};

export default Page;
