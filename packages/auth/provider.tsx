'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Link from 'next/link';

import { authClient } from './client';
import { keys } from './keys';
import { AuthUIProvider } from './lib/auth-ui-provider';

import type { ReactNode } from 'react';
type AuthProviderProps = {
  children: ReactNode;
  router: AppRouterInstance;
};

export const AuthProvider = ({ router, children }: AuthProviderProps) => {
  return (
    <AuthUIProvider
      baseURL={keys().NEXT_PUBLIC_BETTER_AUTH_URL}
      authClient={authClient}
      navigate={router.push}
      confirmPassword={true}
      twoFactor={['totp']}
      replace={router.replace}
      onSessionChange={() => {
        // Clear router cache (protected routes)
        router.refresh();
      }}
      Link={Link}
    >
      {children}
    </AuthUIProvider>
  );
};
