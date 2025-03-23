import '@repo/design-system/styles/globals.css';

import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';

import type { ReactNode } from 'react';

type RootLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

const RootLayout = async ({ children, params }: RootLayoutProperties) => {
  const { locale } = await params;

  console.log('Locale', locale);

  return (
    <html lang='en' className={fonts} suppressHydrationWarning>
      <body>
        <DesignSystemProvider>{children}</DesignSystemProvider>
      </body>
    </html>
  );
};

export default RootLayout;
