'use client';

import { useI18n } from '@repo/localization/i18n/client';
import { useContext } from 'react';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import type { SettingsCardClassNames } from './shared/settings-card';
import { UpdateFieldCard } from './shared/update-field-card';
export interface UpdateUsernameCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  isPending?: boolean;
}

export function UpdateUsernameCard({
  className,
  classNames,
  isPending,
}: Readonly<UpdateUsernameCardProps>) {
  const t = useI18n();
  const { hooks } = useContext(AuthUIContext);
  const { useSession } = hooks;

  const { data: sessionData } = useSession();
  const defaultValue =
    sessionData?.user.displayUsername ?? sessionData?.user.username;

  return (
    <UpdateFieldCard
      className={className}
      classNames={classNames}
      defaultValue={defaultValue}
      description={t('account.usernameDescription')}
      field='username'
      instructions={t('account.usernameInstructions')}
      isPending={isPending}
      key={defaultValue}
      label={t('account.username')}
      placeholder={t('account.usernamePlaceholder')}
      required
    />
  );
}
