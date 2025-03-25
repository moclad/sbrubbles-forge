import { CommandIcon } from 'lucide-react';
import Link from 'next/link';

import { env } from '@/env';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { getI18n } from '@repo/localization/i18n/server';

import type { ReactNode } from 'react';
type AuthLayoutProps = {
  readonly children: ReactNode;
};

const AuthLayout = async ({ children }: AuthLayoutProps) => {
  const t = await getI18n();

  return (
    <div className='container relative grid h-dvh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col bg-muted p-10 lg:flex dark:border-r'>
        <div className='absolute inset-0 ' />
        <div className='relative z-20 flex items-center font-medium text-lg'>
          <CommandIcon className='mr-2 h-6 w-6' />
          Sbrubbles Forge
        </div>
        <div className='absolute top-4 right-4'>
          <ModeToggle />
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;This library has saved me countless hours of work and
              helped me deliver stunning designs to my clients faster than ever
              before.&rdquo;
            </p>
            <footer className='text-sm'>Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6'>
          {children}
          <p className='px-8 text-center text-muted-foreground text-sm'>
            {t('authentication.agreement')}{' '}
            <Link
              href={new URL('/legal/terms', env.NEXT_PUBLIC_APP_URL).toString()}
              className='underline underline-offset-4 hover:text-primary'
            >
              {t('authentication.terms')}
            </Link>{' '}
            {t('authentication.and')}{' '}
            <Link
              href={new URL(
                '/legal/privacy',
                env.NEXT_PUBLIC_APP_URL
              ).toString()}
              className='underline underline-offset-4 hover:text-primary'
            >
              {t('authentication.privacy')}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
