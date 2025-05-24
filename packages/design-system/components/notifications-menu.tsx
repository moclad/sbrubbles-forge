'use client';

import { BellIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { useI18n } from '@repo/localization/i18n/client';

import { Button } from './ui/button';
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
} from './ui/touch-provider';

export function NotificationsMenu() {
  const router = useRouter();
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
              className='shrink-0 text-foreground '
            >
              <BellIcon />
            </Button>
          </DropdownMenuTrigger>
        </HybridTooltipTrigger>
        <HybridTooltipContent>{t('notifications.label')}</HybridTooltipContent>
      </HybridTooltip>
      <DropdownMenuContent>
        <DropdownMenuLabel className='p-0 font-normal'>
          <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
            {t('notifications.label')}
          </div>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
