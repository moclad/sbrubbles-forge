'use client';
import { type ThemeProviderProps, useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';

import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';

import type { ThemeProviderProps } from 'next-themes';
type DesignSystemProviderProperties = ThemeProviderProps;

export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProperties) => {
  const theme = useTheme();
  const currentTheme = theme.theme === 'light' ? 'light' : 'dark';
  return (
    <ThemeProvider {...properties}>
      <AuthProvider>
        <AnalyticsProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <SonnerToaster richColors theme={currentTheme} />
        </AnalyticsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
