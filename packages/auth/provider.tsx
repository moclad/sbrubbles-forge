'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { authClient } from './client';
import { keys } from './keys';
import { AuthUIProvider } from './lib/auth-ui-provider';

type AuthProviderProps = {
  children: ReactNode;
  router: AppRouterInstance;
};

export const AuthProvider = ({ router, children }: AuthProviderProps) => {
  return (
    <AuthUIProvider
      authClient={authClient}
      baseURL={keys().NEXT_PUBLIC_BETTER_AUTH_URL}
      confirmPassword={true}
      Link={Link}
      navigate={router.push}
      onSessionChange={() => {
        // Clear router cache (protected routes)
        router.refresh();
      }}
      replace={router.replace}
      twoFactor={['totp']}
    >
      {children}
    </AuthUIProvider>
  );
};
