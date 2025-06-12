import { headers } from 'next/headers';

import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { pageTable } from '@repo/database/db/schema';

export const GET = async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // some endpoint might require headers
  });

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const newPage = await database
    .insert(pageTable)
    .values({
      name: session?.user.name ?? 'no-user',
      street: 'cron-temp',
    })
    .returning({ insertedId: pageTable.id });

  return new Response(`OK ${newPage[0].insertedId}`, { status: 200 });
};
