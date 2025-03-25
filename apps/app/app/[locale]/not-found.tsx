'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@repo/design-system/components/ui/button';
import { useI18n } from '@repo/localization/i18n/client';

export default function NotFound() {
  const router = useRouter();
  const t = useI18n();

  return (
    <div className='-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 mb-16 items-center justify-center text-center'>
      <span className='bg-gradient-to-b from-foreground to-transparent bg-clip-text font-extrabold text-[10rem] text-transparent leading-none'>
        404
      </span>
      <h2 className='my-2 font-bold font-heading text-2xl'>
        {t('notFound.header')}
      </h2>
      <p>{t('notFound.message')}</p>
      <div className='mt-8 flex justify-center gap-2'>
        <Button onClick={() => router.back()} variant='default' size='lg'>
          {t('notFound.back')}
        </Button>
        <Button
          onClick={() => router.push('/dashboard')}
          variant='ghost'
          size='lg'
        >
          {t('notFound.home')}
        </Button>
      </div>
    </div>
  );
}
