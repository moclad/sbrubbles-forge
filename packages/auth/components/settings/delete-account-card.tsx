import { useI18n } from '@repo/localization/i18n/client';
import { useContext, useState } from 'react';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { DeleteAccountDialog } from './delete-account-dialog';
import type { SettingsCardClassNames } from './shared/settings-card';
import { SettingsCard } from './shared/settings-card';
export type DeleteAccountCardProps = {
  accounts?: { provider: string }[] | null;
  className?: string;
  classNames?: SettingsCardClassNames;
  isPending?: boolean;
  skipHook?: boolean;
};

export function DeleteAccountCard({
  className,
  classNames,
  accounts,
  isPending,
  skipHook,
}: Readonly<DeleteAccountCardProps>) {
  const t = useI18n();
  const {
    hooks: { useListAccounts },
  } = useContext(AuthUIContext);

  const [showDialog, setShowDialog] = useState(false);

  if (!skipHook) {
    const result = useListAccounts();
    accounts = result.data;
    isPending = result.isPending;
  }

  return (
    <>
      <SettingsCard
        actionLabel={t('account.deleteAccount')}
        className={className}
        classNames={classNames}
        description={t('account.deleteAccountDescription')}
        formAction={() => setShowDialog(true)}
        isPending={isPending}
        title={t('account.deleteAccount')}
        variant='destructive'
      />

      <DeleteAccountDialog accounts={accounts} classNames={classNames} onOpenChange={setShowDialog} open={showDialog} />
    </>
  );
}
