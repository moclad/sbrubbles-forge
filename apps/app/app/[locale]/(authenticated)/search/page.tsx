import { database } from '@repo/database';
import { Loader } from 'lucide-react';
import { Suspense } from 'react';

type SearchPageProperties = {
  searchParams: Promise<{
    q: string;
  }>;
};

export const generateMetadata = async ({ searchParams }: SearchPageProperties) => {
  const { q } = await searchParams;

  return {
    description: `Search results for ${q}`,
    title: `${q} - Search results`,
  };
};

const SearchPage = async () => {
  // const { q } = await searchParams;
  const pages = await database.query.pageTable.findMany({});

  return (
    <Suspense
      fallback={
        <div className='flex h-[50vh] items-center justify-center'>
          <Loader className='h-8 w-8 animate-spin' />
        </div>
      }
    >
      <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
        <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
          {pages.map((page) => (
            <div className='aspect-video rounded-xl bg-muted/50' key={page.id}>
              {page.name}
            </div>
          ))}
        </div>
        <div className='min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min' />
      </div>
    </Suspense>
  );
};

export default SearchPage;
