'use client';

import { useContext } from 'react';

import { CardContent } from '@repo/design-system/components/ui/card';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { PasskeyCell } from './passkey-cell';
import { SettingsCard, SettingsCardClassNames } from './shared/settings-card';
import { SettingsCellSkeleton } from './skeletons/settings-cell-skeleton';

import type { AuthClient } from '../../types/auth-client';

export interface PasskeysCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  isPending?: boolean;
  passkeys?: { id: string; createdAt: Date }[] | null;
  skipHook?: boolean;
  refetch?: () => Promise<void>;
}

export function PasskeysCard({
  className,
  classNames,
  isPending,
  passkeys,
  skipHook,
  refetch,
}: Readonly<PasskeysCardProps>) {
  const t = useI18n();
  const {
    authClient,
    hooks: { useListPasskeys },
  } = useContext(AuthUIContext);

  if (!skipHook) {
    const result = useListPasskeys();
    passkeys = result.data;
    isPending = result.isPending;
    refetch = result.refetch;
  }

  const addPasskey = async () => {
    await (authClient as AuthClient).passkey.addPasskey({});
    await refetch?.();
  };

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      title={t('account.passkeys')}
      description={t('account.passkeysDescription')}
      actionLabel={t('account.addPasskey')}
      formAction={addPasskey}
      instructions={t('account.passkeysInstructions')}
      isPending={isPending}
    >
      <CardContent className={cn('grid gap-4', classNames?.content)}>
        {isPending ? (
          <SettingsCellSkeleton classNames={classNames} />
        ) : (
          passkeys?.map((passkey) => (
            <PasskeyCell
              key={passkey.id}
              classNames={classNames}
              passkey={passkey}
              refetch={refetch}
            />
          ))
        )}
      </CardContent>
    </SettingsCard>
  );
}
