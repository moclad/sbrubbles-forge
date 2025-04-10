'use client';

import { MoonIcon, SunIcon, SunMoon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { useI18n } from '@repo/localization/i18n/client';

import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
} from './ui/touch-provider';

const themes = [
  { label: 'Light', value: 'light', icon: <SunIcon /> },
  { label: 'Dark', value: 'dark', icon: <MoonIcon /> },
  { label: 'System', value: 'system', icon: <SunMoon /> },
];

export const ModeToggle = () => {
  const t = useI18n();
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <HybridTooltip delayDuration={100}>
        <HybridTooltipTrigger asChild>
          <DropdownMenuTrigger
            asChild
            className='hover:bg-transparent focus:ring-0 focus:ring-none'
          >
            <Button
              variant='ghost'
              size='icon'
              className='shrink-0 text-foreground '
            >
              <SunIcon className='dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0' />
              <MoonIcon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
              <span className='sr-only'>{t('theme.toggle')}</span>
            </Button>
          </DropdownMenuTrigger>
        </HybridTooltipTrigger>
        <HybridTooltipContent>{t('theme.toggle')}</HybridTooltipContent>
      </HybridTooltip>
      <DropdownMenuContent>
        {themes.map(({ label, value, icon }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            {icon} {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
