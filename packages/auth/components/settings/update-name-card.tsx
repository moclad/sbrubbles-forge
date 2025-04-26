'use client';

import { useContext } from 'react';

import { useI18n } from '@repo/localization/i18n/client';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { UpdateFieldCard } from './shared/update-field-card';

import type { SettingsCardClassNames } from './shared/settings-card';
export interface UpdateNameCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  isPending?: boolean;
}

export function UpdateNameCard({
  className,
  classNames,
  isPending,
}: Readonly<UpdateNameCardProps>) {
  const {
    hooks: { useSession },
    nameRequired,
  } = useContext(AuthUIContext);
  const { data: sessionData } = useSession();
  const t = useI18n();

  return (
    <UpdateFieldCard
      className={className}
      classNames={classNames}
      defaultValue={sessionData?.user.name}
      description={t('account.nameDescription')}
      field='name'
      instructions={t('account.nameInstructions')}
      isPending={isPending}
      label={t('account.name')}
      placeholder={t('account.namePlaceholder')}
      required={nameRequired}
    />
  );
}
