'use client';
import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

import { TooltipProvider } from './components/ui/tooltip';
import { TouchProvider } from './components/ui/touch-provider';
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
      <TouchProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </TouchProvider>
      <SonnerToaster richColors theme={currentTheme} />
    </ThemeProvider>
  );
};
