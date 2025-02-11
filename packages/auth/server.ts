import 'server-only';

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin, openAPI, organization } from 'better-auth/plugins';

import { database } from '@repo/database';

export const auth = betterAuth({
  database: drizzleAdapter(database, {
    provider: 'pg',
  }),
  plugins: [
    openAPI(),
    admin(),
    nextCookies(),
    organization(), // if you want to use organization plugin
  ],
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
  usePlural: true,
});
