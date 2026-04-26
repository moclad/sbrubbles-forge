import { PageContent } from '@repo/design-system/components/page-content';
import { getI18n } from '@repo/localization/i18n/server';
import { Loader } from 'lucide-react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
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
    <Suspense
      fallback={
        <div className='flex h-[50vh] items-center justify-center'>
          <Loader className='h-8 w-8 animate-spin' />
        </div>
      }
    >
      <PageContent header={t('categories.title')} subTitle={t('categories.subTitle')}>
        <CategoriesTable categories={categories} />
      </PageContent>
    </Suspense>
  );
};

export default Page;
