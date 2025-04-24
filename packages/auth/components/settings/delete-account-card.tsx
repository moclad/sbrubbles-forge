import { useContext, useState } from 'react';

import { useI18n } from '@repo/localization/i18n/client';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { DeleteAccountDialog } from './delete-account-dialog';
import { SettingsCard, SettingsCardClassNames } from './shared/settings-card';

export interface DeleteAccountCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  accounts?: { provider: string }[] | null;
  isPending?: boolean;
  skipHook?: boolean;
}

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
        title={t('account.deleteAccount')}
        description={t('account.deleteAccountDescription')}
        actionLabel={t('account.deleteAccount')}
        formAction={() => setShowDialog(true)}
        className={className}
        classNames={classNames}
        variant='destructive'
        isPending={isPending}
      />

      <DeleteAccountDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        classNames={classNames}
        accounts={accounts}
      />
    </>
  );
}
