import 'server-only';

import { database } from '@repo/database';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import {
  admin,
  jwt,
  openAPI,
  organization,
  twoFactor,
} from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { emailHarmony } from 'better-auth-harmony';

import { keys } from './keys';
import { sendResetEmail, sendWelcomeEmail } from './lib/email';

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  advanced: {
    cookiePrefix: 'sbrubbles-forge',
  },
  appName: 'Sbrubbles.Forge',
  baseURL: keys().BETTER_AUTH_URL,
  database: drizzleAdapter(database, {
    provider: 'pg',
  }),
  emailAndPassword: {
    autoSignIn: false,
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetEmail(user.name, user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendWelcomeEmail(user.name, user.email, url);
    },
  },
  plugins: [
    passkey({
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
      origin: keys().PUBLIC_APP_URL,
      rpName: 'Sbrubbles.Forge',
    }),
    twoFactor(),
    openAPI(),
    admin(),
    nextCookies(),
    organization(),
    emailHarmony(),
    jwt(),
  ],

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    }, // 7 days
    expiresIn: 60 * 60 * 24 * 7, // 1 day (every 1 day the session expiration is updated)
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [keys().PUBLIC_APP_URL],
  usePlural: true,
  user: {
    additionalFields: {
      role: {
        default: 'user',
        defaultValue: 'user',
        required: false,
        type: 'string',
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
