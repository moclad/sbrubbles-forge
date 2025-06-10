import { database } from '@repo/database';
import { pageTable } from '@repo/database/db/schema';

export const GET = async () => {
  const newPage = await database
    .insert(pageTable)
    .values({
      name: 'cron-temp',
      street: 'cron-temp',
    })
    .returning({ insertedId: pageTable.id });

  return new Response(`OK ${newPage[0].insertedId}`, { status: 200 });
};
