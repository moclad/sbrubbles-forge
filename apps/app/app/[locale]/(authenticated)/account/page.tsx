import { PageContent } from '@repo/design-system/components/page-content';

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
  return <PageContent header='Account' subTitle='Manage your account' />;
};

export default SearchPage;
