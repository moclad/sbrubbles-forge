'use client';

import { AppSidebar } from '@repo/design-system/components/app-sidebar/app-sidebar';
import Header from '@repo/design-system/components/layout/header';
import {
  SidebarInset,
  SidebarProvider,
} from '@repo/design-system/components/ui/sidebar';

import type { ReactNode } from 'react';
type GlobalSidebarProperties = {
  readonly children: ReactNode;
};

export const GlobalSidebar = ({ children }: GlobalSidebarProperties) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};
