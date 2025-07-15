'use client';

import { useI18n } from '@repo/localization/i18n/client';
import { useContext, useState } from 'react';

import { AuthUIContext } from '../../../lib/auth-ui-provider';
import type { SettingsCardClassNames } from '../shared/settings-card';
import { SettingsCard } from '../shared/settings-card';
import { TwoFactorPasswordDialog } from './two-factor-password-dialog';
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
        actionLabel={
          isTwoFactorEnabled ? t('account.disable') : t('account.enable')
        }
        className={className}
        classNames={classNames}
        description={t('account.twoFactorCardDescription')}
        formAction={() => setShowPasswordDialog(true)}
        instructions={
          isTwoFactorEnabled
            ? t('account.twoFactorDisableInstructions')
            : t('account.twoFactorEnableInstructions')
        }
        isPending={isPending}
        showToast={false}
        title={t('account.twoFactor')}
      />

      <TwoFactorPasswordDialog
        isTwoFactorEnabled={!!isTwoFactorEnabled}
        onOpenChange={setShowPasswordDialog}
        open={showPasswordDialog}
      />
    </div>
  );
}
