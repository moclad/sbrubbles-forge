import { PageContent } from '@repo/design-system/components/page-content';
import { getI18n } from '@repo/localization/i18n/server';
import type { Metadata } from 'next';
import { getCategories } from '@/lib/categories-actions';
import { CategoriesTable } from './components/categories-table';
export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n();
  return {
    description: t('categories.metaDescription'),
    title: t('categories.title'),
  };
}

const Page = async () => {
  const t = await getI18n();
  const categories = await getCategories();

  return (
    <PageContent header={t('categories.title')} subTitle={t('categories.subTitle')}>
      <CategoriesTable categories={categories} />
    </PageContent>
  );
};

export default Page;
