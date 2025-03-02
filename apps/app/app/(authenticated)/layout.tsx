import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { env } from '@/env';
import { auth } from '@repo/auth/server';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import { NotificationsProvider } from '@repo/notifications/components/provider';
import { secure } from '@repo/security';

import { GlobalSidebar } from './components/sidebar';

import type { ReactNode } from 'react';
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
      <SidebarProvider>
        <GlobalSidebar>{children}</GlobalSidebar>
      </SidebarProvider>
    </NotificationsProvider>
  );
};

export default AppLayout;
