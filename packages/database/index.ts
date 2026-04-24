import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// biome-ignore lint/performance/noNamespaceImport: all schemas are imported from the same file
import * as schema from './db/schema';
import { keys } from './keys';

const pool = new Pool({ connectionString: keys().DATABASE_URL });

export const database = drizzle({ client: pool, schema });
// biome-ignore lint/performance/noBarrelFile: used in other packages
export { asc, desc, eq, inArray, sum } from 'drizzle-orm';
