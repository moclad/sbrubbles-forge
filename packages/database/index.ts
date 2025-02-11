import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './db/schema';
import { keys } from './keys';

const pool = new Pool({ connectionString: keys().DATABASE_URL });

export const database = drizzle({ client: pool, schema: schema });
