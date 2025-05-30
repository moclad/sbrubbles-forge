import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { pageTable } from '@repo/database/db/schema';

import type { Metadata } from 'next';
const title = 'Acme Inc';
const description = 'My application.';

export const metadata: Metadata = {
  title,
  description,
};

const App = async () => {
  const pages = await database.select().from(pageTable);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect('/sign-in'); // from next/navigation
  }
  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
        {pages.map((page) => (
          <div key={page.id} className='aspect-video bg-muted/50'>
            {page.name}
          </div>
        ))}
      </div>
      <div className='min-h-[100vh] flex-1 bg-muted/50 md:min-h-min' />
    </div>
  );
};

export default App;
