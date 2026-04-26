import { PageContent } from '@repo/design-system/components/page-content';
import { Loader } from 'lucide-react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getFailedMessages } from '@/lib/failed-messages-actions';
import { FailedMessagesTable } from './components/failed-messages-table';

export async function generateMetadata(): Promise<Metadata> {
  return {
    description: 'View and retry failed expense messages',
    title: 'Failed Messages',
  };
}

const Page = async () => {
  const messages = await getFailedMessages();

  return (
    <Suspense
      fallback={
        <div className='flex h-[50vh] items-center justify-center'>
          <Loader className='h-8 w-8 animate-spin' />
        </div>
      }
    >
      <PageContent header='Failed Messages' subTitle='Review and retry messages that could not be processed'>
        <FailedMessagesTable initialMessages={messages} />
      </PageContent>
    </Suspense>
  );
};

export default Page;
