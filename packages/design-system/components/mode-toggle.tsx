'use client';

import { useI18n } from '@repo/localization/i18n/client';
import { MoonIcon, SunIcon, SunMoon } from 'lucide-react';
import { useTheme } from 'next-themes';

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

export const ModeToggle = () => {
  const t = useI18n();
  const { setTheme } = useTheme();

  const themes = [
    { icon: <SunIcon />, label: t('theme.light'), value: 'light' },
    { icon: <MoonIcon />, label: t('theme.dark'), value: 'dark' },
    { icon: <SunMoon />, label: t('theme.system'), value: 'system' },
  ];

  return (
    <DropdownMenu>
      <HybridTooltip delayDuration={100}>
        <HybridTooltipTrigger asChild>
          <DropdownMenuTrigger
            asChild
            className='hover:bg-transparent focus:ring-0 focus:ring-none'
          >
            <Button
              className='shrink-0 text-foreground'
              size='icon'
              variant='ghost'
            >
              <SunIcon className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
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
