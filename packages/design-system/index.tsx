'use client';
import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';
import { I18nProviderClient } from '@repo/localization/i18n/client';

import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';

import type { ThemeProviderProps } from 'next-themes';
type DesignSystemProviderProperties = ThemeProviderProps & { locale: string };

export const DesignSystemProvider = ({
  children,
  locale,
  ...properties
}: DesignSystemProviderProperties) => {
  const theme = useTheme();
  const currentTheme = theme.theme === 'light' ? 'light' : 'dark';
  return (
    <ThemeProvider {...properties}>
      <I18nProviderClient locale={locale}>
        <AuthProvider>
          <AnalyticsProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <SonnerToaster richColors theme={currentTheme} />
          </AnalyticsProvider>
        </AuthProvider>
      </I18nProviderClient>
    </ThemeProvider>
  );
};
