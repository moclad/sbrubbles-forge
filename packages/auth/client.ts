'use client';

import {
  adminClient,
  organizationClient,
  passkeyClient,
  twoFactorClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { keys } from './keys';

export const authClient = createAuthClient({
  baseURL: keys().NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    passkeyClient(),
    organizationClient(),
    twoFactorClient(),
    adminClient(),
  ],
});

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  forgetPassword,
  resetPassword,
} = authClient;
