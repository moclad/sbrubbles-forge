import dynamic from 'next/dynamic';

import { createMetadata } from '@repo/seo/metadata';

import type { Metadata } from 'next';
const SignIn = dynamic(() =>
  import('@repo/auth/components/sign-in').then((mod) => mod.SignIn)
);

const title = 'Welcome back';
const description = 'Enter your details to sign in.';
export const metadata: Metadata = createMetadata({ title, description });

const SignInPage = () => (
  <>
    <div className='flex flex-col space-y-2 text-center'>
      <h1 className='font-semibold text-2xl tracking-tight '>{title}</h1>
      <p className='text-muted-foreground text-sm'>{description}</p>
    </div>
    <SignIn />
  </>
);

export default SignInPage;
