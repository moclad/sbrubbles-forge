import { webhooks } from '@repo/webhooks';
import { Loader } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const metadata = {
  description: 'Send webhooks to your users.',
  title: 'Webhooks',
};

const WebhooksPage = async () => {
  const response = await webhooks.getAppPortal('');

  if (!response?.url) {
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
      <div className='h-full w-full overflow-hidden'>
        <iframe
          allow='clipboard-write'
          className='h-full w-full border-none'
          loading='lazy'
          src={response.url}
          title='Webhooks'
        />
      </div>
    </Suspense>
  );
};

export default WebhooksPage;
