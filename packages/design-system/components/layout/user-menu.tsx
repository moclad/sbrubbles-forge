'use client';

import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@repo/design-system/components/ui/dropdown-menu';
import { useI18n } from '@repo/localization/i18n/client';

import { Button } from '../ui/button';
import { HybridTooltip, HybridTooltipContent, HybridTooltipTrigger } from '../ui/touch-provider';

export function UserMenu({
  user,
}: Readonly<{
  user: {
    name: string;
    email: string;
    image: string | null | undefined;
  };
}>) {
  const router = useRouter();
  const t = useI18n();

  const logout = () => {
    router.push('/sign-out');
  };

  const openAccount = () => {
    router.push('/account');
  };

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
              <Avatar className='h-8 w-8 rounded-lg'>
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className='rounded-lg'>
                  <User />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
        </HybridTooltipTrigger>
        <HybridTooltipContent>{user.name}</HybridTooltipContent>
      </HybridTooltip>
      <DropdownMenuContent>
        <DropdownMenuLabel className='p-0 font-normal'>
          <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
            <Avatar className='h-8 w-8 rounded-lg'>
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback className='rounded-lg'>
                <User />
              </AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>{user.name}</span>
              <span className='truncate text-xs'>{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => openAccount()}
            className='cursor-pointer'
          >
            <BadgeCheck />
            {t('account.title')}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            {t('account.billing')}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            {t('account.notifications')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()} className='cursor-pointer'>
          <LogOut />
          {t('authentication.actions.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
