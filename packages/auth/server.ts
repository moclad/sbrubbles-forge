import 'server-only';

import { betterAuth } from 'better-auth';
import { emailHarmony } from 'better-auth-harmony';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin, openAPI, organization, twoFactor } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';

import { database } from '@repo/database';

import { keys } from './keys';
import { sendResetEmail, sendWelcomeEmail } from './lib/email';

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  appName: 'Sbrubbles Forge',
  database: drizzleAdapter(database, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      await sendResetEmail(user.name, user.email, url);
    },
  },
  baseURL: keys().BETTER_AUTH_URL,
  plugins: [
    passkey({
      rpName: 'Sbrubbles Forge',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
    }),
    twoFactor(),
    openAPI(),
    admin(),
    nextCookies(),
    organization(),
    emailHarmony(),
  ],
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendWelcomeEmail(user.name, user.email, url);
    },
    sendOnSignUp: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        default: 'user',
        required: false,
        defaultValue: 'user',
      },
    },
  },
  trustedOrigins: [keys().PUBLIC_APP_URL],
  usePlural: true,
  advanced: {
    cookiePrefix: 'sbrubbles-forge',
  },
});

export type Session = typeof auth.$Infer.Session;
