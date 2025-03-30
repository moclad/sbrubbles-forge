'use client';

import { Languages } from 'lucide-react';

import { useChangeLocale, useI18n } from '@repo/localization/i18n/client';

import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../components/ui/dropdown-menu';
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger
} from '../../components/ui/touch-provider';

export function LanguageToggle() {
  const changeLocale = useChangeLocale();
  const t = useI18n();

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
              className='shrink-0 text-foreground'
            >
              <Languages className='absolute transition-all dark:rotate-0 dark:scale-100 dark:hover:text-white' />
              <span className='sr-only'>{t('language.label')}</span>
            </Button>
          </DropdownMenuTrigger>
        </HybridTooltipTrigger>
        <HybridTooltipContent>{t('language.label')}</HybridTooltipContent>
      </HybridTooltip>

      <DropdownMenuContent forceMount>
        <DropdownMenuItem onClick={() => changeLocale('en')}>
          <span>{t('language.english')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLocale('de')}>
          <span>{t('language.german')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLocale('pt-BR')}>
          <span>{t('language.portuguese')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
