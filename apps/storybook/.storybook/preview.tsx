import '@repo/design-system/styles/globals.css';

import { Toaster } from '@repo/design-system/components/ui/sonner';
import { TooltipProvider } from '@repo/design-system/components/ui/tooltip';
import { ThemeProvider } from '@repo/design-system/providers/theme';
import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/nextjs';
import { themes } from 'storybook/theming';
import { commonTheme, darkUIStorybook, lightUIStorybook } from './themes-storybook-ui';

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      defaultTheme: 'light',
      themes: {
        dark: 'dark',
        light: 'light',
      },
    }),
    (Story) => {
      return (
        <div className='bg-background'>
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
  parameters: {
    chromatic: {
      modes: {
        dark: {
          className: 'dark',
          theme: 'dark',
        },
        light: {
          className: 'light',
          theme: 'light',
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      classTarget: 'html',
      // Set the initial theme
      current: 'dark',
      // Override the default dark theme
      dark: { ...themes.dark, ...darkUIStorybook, ...commonTheme },
      darkClass: 'dark',
      // Override the default light theme
      light: { ...themes.normal, ...lightUIStorybook, ...commonTheme },
      lightClass: 'light',
      stylePreview: true,
    },
    options: {
      storySort: {
        order: ['App-Layout', 'ui'],
      },
    },
  },
};

export default preview;
