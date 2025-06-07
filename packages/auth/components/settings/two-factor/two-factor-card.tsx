'use client';

import { useContext, useState } from 'react';

import { useI18n } from '@repo/localization/i18n/client';

import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { SettingsCard } from '../shared/settings-card';
import { TwoFactorPasswordDialog } from './two-factor-password-dialog';

import type { SettingsCardClassNames } from '../shared/settings-card';
export interface TwoFactorCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
}

export function TwoFactorCard({
  className,
  classNames,
}: Readonly<TwoFactorCardProps>) {
  const t = useI18n();
  const {
    hooks: { useSession },
  } = useContext(AuthUIContext);

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const { data: sessionData, isPending } = useSession();
  const isTwoFactorEnabled = sessionData?.user.twoFactorEnabled;

  return (
    <div>
      <SettingsCard
        className={className}
        classNames={classNames}
        isPending={isPending}
        description={t('account.twoFactorCardDescription')}
        title={t('account.twoFactor')}
        actionLabel={
          isTwoFactorEnabled ? t('account.disable') : t('account.enable')
        }
        instructions={
          isTwoFactorEnabled
            ? t('account.twoFactorDisableInstructions')
            : t('account.twoFactorEnableInstructions')
        }
        formAction={() => setShowPasswordDialog(true)}
        showToast={false}
      />

      <TwoFactorPasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        isTwoFactorEnabled={!!isTwoFactorEnabled}
      />
    </div>
  );
}
