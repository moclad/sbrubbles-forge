import '@repo/design-system/styles/globals.css';
import { fonts } from '@repo/design-system/lib/fonts';

import { Providers } from './providers';

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
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
