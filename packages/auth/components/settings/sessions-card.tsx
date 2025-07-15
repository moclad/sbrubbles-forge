'use client';

import { CardContent } from '@repo/design-system/components/ui/card';
import { cn } from '@repo/design-system/lib/utils';
import type { Session } from 'better-auth';
import { useContext } from 'react';

import { useI18n } from '../../../localization/i18n/client';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { SessionCell } from './session-cell';
import { SettingsCard, SettingsCardClassNames } from './shared/settings-card';
import { SettingsCellSkeleton } from './skeletons/settings-cell-skeleton';

export interface SessionsCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  isPending?: boolean;
  sessions?: Session[] | null;
  skipHook?: boolean;
  refetch?: () => Promise<void>;
}

export function SessionsCard({
  className,
  classNames,
  isPending,
  sessions,
  skipHook,
  refetch,
}: Readonly<SessionsCardProps>) {
  const t = useI18n();
  const {
    hooks: { useListSessions },
  } = useContext(AuthUIContext);

  if (!skipHook) {
    const result = useListSessions();
    sessions = result.data;
    isPending = result.isPending;
    refetch = result.refetch;
  }

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      description={t('account.sessionsDescription')}
      isPending={isPending}
      title={t('account.sessions')}
    >
      <CardContent className={cn('grid gap-4', classNames?.content)}>
        {isPending ? (
          <SettingsCellSkeleton classNames={classNames} />
        ) : (
          sessions?.map((session) => (
            <SessionCell
              classNames={classNames}
              key={session.id}
              refetch={refetch}
              session={session}
            />
          ))
        )}
      </CardContent>
    </SettingsCard>
  );
}
