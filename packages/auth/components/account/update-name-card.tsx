'use client';

import { useI18n } from '@repo/localization/i18n/client';

import { useSession } from '../../client';
import { SettingsCardClassNames } from './shared/settings-card';
import { UpdateFieldCard } from './shared/update-field-card';

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
  const t = useI18n();
  const { data: sessionData } = useSession();

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
      required
    />
  );
}
