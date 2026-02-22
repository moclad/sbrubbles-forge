import { env } from '@/env';
import { auth } from '@repo/auth/server';
import { secure } from '@repo/security';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { GlobalSidebar } from './components/global-sidebar';
import { NotificationsProvider } from './components/notifications-provider';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = async ({ children }: AppLayoutProperties) => {
  if (env.ARCJET_KEY) {
    await secure(['CATEGORY:PREVIEW']);
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect('/sign-in'); // from next/navigation
  }

  return (
    <NotificationsProvider userId={session.user.id}>
      <GlobalSidebar>
        <div className='container mx-auto'>{children}</div>
      </GlobalSidebar>
    </NotificationsProvider>
  );
};

export default AppLayout;
