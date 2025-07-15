'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { toast } from '@repo/design-system/components/ui/sonner';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';
import type { Session, User } from 'better-auth';
import { EllipsisIcon, Loader2, LogOutIcon, RepeatIcon } from 'lucide-react';
import { useContext, useState } from 'react';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { getErrorMessage } from '../../lib/get-error-message';
import { UserView } from '../user-view';

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
  const {
    basePath,
    mutators: { revokeDeviceSession, setActiveSession },
    navigate,
  } = useContext(AuthUIContext);

  const [isLoading, setIsLoading] = useState(false);
  const t = useI18n();

  const handleRevoke = async () => {
    setIsLoading(true);

    try {
      await revokeDeviceSession({ sessionToken: deviceSession.session.token });
      refetch?.();
    } catch (error) {
      setIsLoading(false);

      toast.error(getErrorMessage(error) ?? t('account.requestFailed'));
    }
  };

  const handleSetActiveSession = async () => {
    setIsLoading(true);

    try {
      await setActiveSession({ sessionToken: deviceSession.session.token });
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
            loading={isLoading}
            size='icon'
            type='button'
            variant='outline'
          >
            <EllipsisIcon />

            {isLoading && (
              <span className='absolute'>
                <Loader2 className='animate-spin' />
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          {!isCurrentSession && (
            <DropdownMenuItem onClick={handleSetActiveSession}>
              <RepeatIcon />

              {t('account.switchAccount')}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => {
              if (isCurrentSession) {
                navigate(`${basePath}/sign-out`);
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
