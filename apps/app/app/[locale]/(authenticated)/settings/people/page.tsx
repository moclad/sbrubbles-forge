import { PageContent } from '@repo/design-system/components/page-content';
import { getI18n } from '@repo/localization/i18n/server';
import type { Metadata } from 'next';
import { getPeople } from '@/lib/people-actions';
import { PeopleTable } from './components/people-table';
export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n();
  return {
    description: t('people.metaDescription'),
    title: t('people.title'),
  };
}

const Page = async () => {
  const t = await getI18n();
  const people = await getPeople();

  return (
    <PageContent header={t('people.title')} subTitle={t('people.subTitle')}>
      <PeopleTable people={people} />
    </PageContent>
  );
};

export default Page;
