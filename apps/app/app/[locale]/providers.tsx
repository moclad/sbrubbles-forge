'use client';

import { useRouter } from 'next/navigation';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';
import { DesignSystemProvider } from '@repo/design-system';
import { I18nProviderClient } from '@repo/localization/i18n/client';

import type { ReactNode } from 'react';
export function Providers({
  children,
  locale,
}: Readonly<{ children: ReactNode; locale: string }>) {
  const router = useRouter();

  return (
    <NuqsAdapter>
      <I18nProviderClient locale={locale}>
        <AnalyticsProvider>
          <AuthProvider router={router}>
            <DesignSystemProvider>{children}</DesignSystemProvider>
          </AuthProvider>
        </AnalyticsProvider>
      </I18nProviderClient>
    </NuqsAdapter>
  );
}
