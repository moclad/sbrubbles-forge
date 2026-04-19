'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { useI18n } from '@repo/localization/i18n/client';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const t = useI18n();

  return (
    <div className='absolute top-1/2 left-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center'>
      <span className='bg-gradient-to-b from-foreground to-transparent bg-clip-text font-extrabold text-[10rem] text-transparent leading-none'>
        404
      </span>
      <h2 className='my-2 font-bold font-heading text-2xl'>{t('notFound.header')}</h2>
      <p>{t('notFound.message')}</p>
      <div className='mt-8 flex justify-center gap-2'>
        <Button onClick={() => router.back()} size='lg' variant='default'>
          {t('notFound.back')}
        </Button>
        <Button onClick={() => router.push('/dashboard')} size='lg' variant='ghost'>
          {t('notFound.home')}
        </Button>
      </div>
    </div>
  );
}
