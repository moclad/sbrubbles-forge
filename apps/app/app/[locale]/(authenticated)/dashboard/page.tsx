import { Dashboard } from '../components/dashboard';

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

const SearchPage = () => {
  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='grid auto-rows-min gap-4 md:grid-cols-3' />
      <div className='min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min' />
      <Dashboard />
    </div>
  );
};

export default SearchPage;
