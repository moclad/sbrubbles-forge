import '@repo/design-system/styles/globals.css';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';

import type { ReactNode } from 'react';

type RootLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

const RootLayout = async ({ children, params }: RootLayoutProperties) => {
  const { locale } = await params;

  return (
    <html lang={locale} className={fonts} suppressHydrationWarning>
      <body>
        <NuqsAdapter>
          <DesignSystemProvider locale={locale}>
            {children}
          </DesignSystemProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
};

export default RootLayout;
