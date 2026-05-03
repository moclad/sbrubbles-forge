import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { pageTable } from '@repo/database/db/schema';
import { headers } from 'next/headers';

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

  const insertedPage = newPage[0];
  if (!insertedPage) {
    return new Response('Insert failed', { status: 500 });
  }

  return new Response(`OK ${insertedPage.insertedId}`, { status: 200 });
};
