type SearchPageProperties = {
  searchParams: Promise<{
    q: string;
  }>;
};

export const generateMetadata = async ({
  searchParams,
}: SearchPageProperties) => {
  const { q } = await searchParams;

  return {
    title: `${q} - Search results`,
    description: `Search results for ${q}`,
  };
};

const SearchPage = () => {
  return (
    <>
      <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
        <div className='grid auto-rows-min gap-4 md:grid-cols-3' />
        <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' />
      </div>
    </>
  );
};

export default SearchPage;
