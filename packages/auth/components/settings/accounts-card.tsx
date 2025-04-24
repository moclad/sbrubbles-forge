'use client';

import type { Session, User } from 'better-auth';
import { useContext } from 'react';

import { CardContent } from '@repo/design-system/components/ui/card';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { AccountCell } from './account-cell';
import { SettingsCard } from './shared/settings-card';
import { SettingsCellSkeleton } from './skeletons/settings-cell-skeleton';

import type { SettingsCardClassNames } from './shared/settings-card';
export interface AccountsCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  deviceSessions?: { user: User; session: Session }[] | null;
  isPending?: boolean;
  skipHook?: boolean;
  refetch?: () => Promise<void>;
}

export function AccountsCard({
  className,
  classNames,
  deviceSessions,
  isPending,
  skipHook,
  refetch,
}: Readonly<AccountsCardProps>) {
  const t = useI18n();
  const {
    basePath,
    hooks: { useSession, useListDeviceSessions },
    navigate,
  } = useContext(AuthUIContext);

  if (!skipHook) {
    const result = useListDeviceSessions();
    deviceSessions = result.data;
    isPending = result.isPending;
    refetch = result.refetch;
  }

  const { data: sessionData } = useSession();
  const session = sessionData?.session;

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      title={t('account.accounts')}
      description={t('account.accountsDescription')}
      actionLabel={t('account.addAccount')}
      formAction={() => navigate(`${basePath}/sign-in`)}
      instructions={t('account.accountsInstructions')}
      isPending={isPending}
    >
      <CardContent className={cn('grid gap-4', classNames?.content)}>
        {isPending ? (
          <SettingsCellSkeleton classNames={classNames} />
        ) : (
          deviceSessions?.map((deviceSession) => (
            <AccountCell
              key={deviceSession.session.id}
              classNames={classNames}
              deviceSession={deviceSession}
              activeSessionId={session?.id}
              refetch={refetch}
            />
          ))
        )}
      </CardContent>
    </SettingsCard>
  );
}
