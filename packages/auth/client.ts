import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { keys } from './keys';

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  forgetPassword,
  resetPassword,
} = createAuthClient({
  baseURL: keys().NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [adminClient()],
});
