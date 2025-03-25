import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@repo/design-system/components/ui/alert';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { getI18n } from '@repo/localization/i18n/server';
import { createMetadata } from '@repo/seo/metadata';

import type { Metadata } from 'next';

const ResetPassword = dynamic(() =>
  import('@repo/auth/components/reset-password').then(
    (mod) => mod.ResetPassword
  )
);

type ResetProps = {
  searchParams: Promise<{
    token: string;
  }>;
};
const title = 'Reset Password';
const description = 'Update your password.';
export const metadata: Metadata = createMetadata({ title, description });

const ResetPasswordPage = async ({ searchParams }: ResetProps) => {
  const token = (await searchParams).token;
  const t = await getI18n();

  if (!token) {
    return (
      <Card className='mx-auto max-w-md shadow-lg'>
        <CardHeader>
          <CardTitle className='text-2xl'>
            {t('authentication.tokenRequired')}
          </CardTitle>
          <CardDescription>
            {t('authentication.tokenRequiredDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>{t('authentication.resetPwAccessDenied')}</AlertTitle>
            <AlertDescription>
              {t('authentication.resetPwAccessDeniedDescription')}
            </AlertDescription>
          </Alert>
          <p className='text-muted-foreground text-sm'>
            {t('authentication.resetPwAccessDeniedDescription2')}
          </p>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button asChild className='w-full'>
            <Link href='/sign-in'>{t('authentication.actions.signIn')}</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <div className='flex flex-col space-y-2 text-center'>
        <h1 className='font-semibold text-2xl tracking-tight '>
          {t('authentication.resetPassword')}
        </h1>
        <p className='text-muted-foreground text-sm'>
          {t('authentication.resetSubTitle')}
        </p>
      </div>
      <ResetPassword token={token} />
    </>
  );
};

export default ResetPasswordPage;
