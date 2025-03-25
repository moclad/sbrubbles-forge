'use client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { signOut, useSession } from '@repo/auth/client';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@repo/design-system/components/ui/card';
import { useI18n } from '@repo/localization/i18n/client';

export default function Logout() {
  const router = useRouter();
  const t = useI18n();
  const session = useSession();

  useEffect(() => {
    const performSignOut = async () => {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/sign-in');
          },
        },
      });
    };

    if (session) {
      performSignOut();
    }
  }, [router, session]);

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Card className='w-[350px]'>
        <CardHeader>
          <CardTitle>{t('authentication.actions.signingOut')}</CardTitle>
          <CardDescription>
            {t('authentication.actions.signingOutWait')}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col items-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <Button
            variant='outline'
            className='w-full'
            onClick={() => router.push('/sign-in')}
            disabled
          >
            {t('authentication.actions.redirectToLogin')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
