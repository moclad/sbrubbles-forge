import './styles.css';

import { Toaster } from '@repo/design-system/components/ui/sonner';
import { fonts } from '@repo/design-system/lib/fonts';
import type { ReactNode } from 'react';
import { Providers } from './providers';

type RootLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

const RootLayout = async ({ children, params }: RootLayoutProperties) => {
  const { locale } = await params;

  return (
    <html className={fonts} lang={locale} suppressHydrationWarning>
      <body>
        <Toaster />
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
