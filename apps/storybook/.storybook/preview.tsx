import '@repo/design-system/styles/globals.css';

import { themes } from 'storybook/theming';

import { Toaster } from '@repo/design-system/components/ui/sonner';
import { TooltipProvider } from '@repo/design-system/components/ui/tooltip';
import { ThemeProvider } from '@repo/design-system/providers/theme';
import { withThemeByClassName } from '@storybook/addon-themes';

import { commonTheme, darkUIStorybook, lightUIStorybook } from './themes-storybook-ui';

import type { Preview } from '@storybook/nextjs';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['App-Layout', 'ui'],
      },
    },
    darkMode: {
      classTarget: 'html',
      stylePreview: true,
      darkClass: 'dark',
      lightClass: 'light',
      // Override the default dark theme
      dark: { ...themes.dark, ...darkUIStorybook, ...commonTheme },
      // Override the default light theme
      light: { ...themes.normal, ...lightUIStorybook, ...commonTheme },
      // Set the initial theme
      current: 'dark',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    chromatic: {
      modes: {
        light: {
          theme: 'light',
          className: 'light',
        },
        dark: {
          theme: 'dark',
          className: 'dark',
        },
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    (Story) => {
      return (
        <div className=' bg-background'>
          <ThemeProvider>
            <TooltipProvider>
              <Story />
            </TooltipProvider>
            <Toaster />
          </ThemeProvider>
        </div>
      );
    },
  ],
};

export default preview;
