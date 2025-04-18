import { defineConfig } from 'drizzle-kit';

import { keys } from './keys';

export default defineConfig({
  schema: './db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: keys().DATABASE_URL,
  },
});
