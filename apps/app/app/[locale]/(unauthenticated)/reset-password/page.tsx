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

  if (!token) {
    return (
      <Card className='mx-auto max-w-md shadow-lg'>
        <CardHeader>
          <CardTitle className='text-2xl'>Authentication Required</CardTitle>
          <CardDescription>
            No valid token is available for this request
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Your session may have expired or you haven't logged in yet.
            </AlertDescription>
          </Alert>
          <p className='text-muted-foreground text-sm'>
            To access this resource, you need to authenticate with a valid
            token. Please log in or request a new token to continue.
          </p>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button asChild>
            <Link href='/login'>Log In</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <div className='flex flex-col space-y-2 text-center'>
        <h1 className='font-semibold text-2xl tracking-tight '>{title}</h1>
        <p className='text-muted-foreground text-sm'>{description}</p>
      </div>
      <ResetPassword token={token} />
    </>
  );
};

export default ResetPasswordPage;
