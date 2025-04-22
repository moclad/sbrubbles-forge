'use client';

import { useI18n } from '@repo/localization/i18n/client';

import { useSession } from '../../client';
import { UpdateFieldCard } from './shared/update-field-card';

import type { SettingsCardClassNames } from './shared/settings-card';
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
  const { data: sessionData } = useSession();
  const t = useI18n();
  const defaultValue =
    sessionData?.user.displayUsername ?? sessionData?.user.username;

  return (
    <UpdateFieldCard
      key={defaultValue}
      className={className}
      classNames={classNames}
      defaultValue={defaultValue}
      description={t('account.usernameDescription')}
      field='username'
      instructions={t('account.usernameInstructions')}
      isPending={isPending}
      label={t('account.username')}
      placeholder={t('account.usernamePlaceholder')}
      required
    />
  );
}
