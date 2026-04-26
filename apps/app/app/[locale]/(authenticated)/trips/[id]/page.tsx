import { getI18n } from '@repo/localization/i18n/server';
import { Loader } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getCategories } from '@/lib/categories-actions';
import { getExpensesByTrip } from '@/lib/expenses-actions';
import { getPeople } from '@/lib/people-actions';
import { getTripById } from '@/lib/trips-actions';
import { getUserPreferences } from '@/lib/user-preferences-actions';
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

  const [trip, categories, people, expenses, userPreferences] = await Promise.all([
    getTripById(id),
    getCategories(),
    getPeople(),
    getExpensesByTrip(id),
    getUserPreferences(),
  ]);

  if (!trip) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className='flex h-[50vh] items-center justify-center'>
          <Loader className='h-8 w-8 animate-spin' />
        </div>
      }
    >
      <TripDetailsClient
        categories={categories}
        currency={userPreferences.currency}
        expenses={expenses}
        people={people}
        trip={trip}
      />
    </Suspense>
  );
};

export default Page;
