import { defineConfig } from 'drizzle-kit';

import { keys } from './keys';

export default defineConfig({
  dbCredentials: {
    url: keys().DATABASE_URL,
  },
  dialect: 'postgresql',
  out: './migrations',
  schema: './db/schema.ts',
});
