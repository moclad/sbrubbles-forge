'use client';

import type { Session, User } from 'better-auth';
import { EllipsisIcon, Loader2, LogOutIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@repo/design-system/components/ui/dropdown-menu';
import { toast } from '@repo/design-system/components/ui/sonner';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';

import { authClient } from '../../client';
import { getErrorMessage } from '../../lib/get-error-message';
import { UserView } from './user-view';

import type { SettingsCardClassNames } from './shared/settings-card';
export interface AccountCellProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  deviceSession: { user: User; session: Session };
  activeSessionId?: string;
  refetch?: () => Promise<void>;
}

export function AccountCell({
  className,
  classNames,
  deviceSession,
  activeSessionId,
  refetch,
}: Readonly<AccountCellProps>) {
  const t = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRevoke = async () => {
    setIsLoading(true);

    try {
      await authClient.revokeSession({
        token: deviceSession.session.token,
      });
      refetch?.();
    } catch (error) {
      setIsLoading(false);
      toast.error(getErrorMessage(error) ?? t('account.requestFailed'));
    }
  };

  const isCurrentSession = deviceSession.session.id === activeSessionId;

  return (
    <Card className={cn('flex-row p-4', className, classNames?.cell)}>
      <UserView user={deviceSession.user} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={cn('relative ms-auto', classNames?.button)}
            disabled={isLoading}
            size='icon'
            type='button'
            variant='outline'
          >
            <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
              <EllipsisIcon />
            </span>

            {isLoading && (
              <span className='absolute'>
                <Loader2 className='animate-spin' />
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              if (isCurrentSession) {
                router.push('auth/sign-out');
                return;
              }

              handleRevoke();
            }}
          >
            <LogOutIcon />

            {isCurrentSession ? t('account.signOut') : t('account.revoke')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}
