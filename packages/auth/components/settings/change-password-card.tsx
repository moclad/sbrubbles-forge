'use client';

import { CardContent } from '@repo/design-system/components/ui/card';
import { Label } from '@repo/design-system/components/ui/label';
import { PasswordInput } from '@repo/design-system/components/ui/password-input';
import { toast } from '@repo/design-system/components/ui/sonner';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';
import { useContext, useState } from 'react';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { ConfirmPasswordInput } from '../confirm-password-input';
import { SettingsCard, SettingsCardClassNames } from './shared/settings-card';
import { InputFieldSkeleton } from './skeletons/input-field-skeleton';

export interface ChangePasswordCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  accounts?: { provider: string }[] | null;
  isPending?: boolean;
  skipHook?: boolean;
}

export function ChangePasswordCard({
  className,
  classNames,
  accounts,
  isPending,
  skipHook,
}: Readonly<ChangePasswordCardProps>) {
  const {
    authClient,
    basePath,
    confirmPassword: confirmPasswordEnabled,
    hooks: { useSession, useListAccounts },
  } = useContext(AuthUIContext);
  const t = useI18n();

  const { data: sessionData } = useSession();

  if (!skipHook) {
    const result = useListAccounts();
    accounts = result.data;
    isPending = result.isPending;
  }

  const [disabled, setDisabled] = useState(true);

  const setPassword = async () => {
    const email = sessionData?.user.email;
    if (!email) {
      throw new Error('Email not found');
    }

    await authClient.forgetPassword({
      email,
      fetchOptions: { throw: true },
      redirectTo: `${basePath}/reset-password`,
    });

    toast.success(t('account.setPasswordEmailSent'));
  };

  const changePassword = async (formData: FormData) => {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;

    if (confirmPasswordEnabled) {
      const confirmPassword = formData.get('confirmPassword') as string;
      if (newPassword !== confirmPassword && t('account.passwordsDoNotMatch')) {
        throw new Error(t('account.passwordsDoNotMatch'));
      }
    }

    await authClient.changePassword({
      currentPassword,
      fetchOptions: { throw: true },
      newPassword,
      revokeOtherSessions: true,
    });

    toast.error(t('account.changePasswordSuccess'));
  };

  const credentialsLinked = accounts?.some(
    (acc) => acc.provider === 'credential'
  );

  if (!(isPending || credentialsLinked)) {
    return (
      <SettingsCard
        actionLabel={t('account.setPassword')}
        className={className}
        classNames={classNames}
        description={t('account.setPasswordDescription')}
        formAction={setPassword}
        isPending={isPending}
        title={t('account.changePassword')}
      />
    );
  }

  return (
    <SettingsCard
      actionLabel={t('account.save')}
      className={className}
      classNames={classNames}
      description={t('account.changePasswordDescription')}
      disabled={disabled}
      formAction={changePassword}
      instructions={t('account.changePasswordInstructions')}
      isPending={isPending}
      title={t('account.changePassword')}
    >
      <CardContent className={cn('grid gap-6', classNames?.content)}>
        {isPending || !accounts ? (
          <>
            <InputFieldSkeleton classNames={classNames} />
            <InputFieldSkeleton classNames={classNames} />

            {confirmPasswordEnabled && (
              <InputFieldSkeleton classNames={classNames} />
            )}
          </>
        ) : (
          <>
            <div className='grid gap-2'>
              <Label className={classNames?.label} htmlFor='currentPassword'>
                {t('account.currentPassword')}
              </Label>

              <PasswordInput
                autoComplete='current-password'
                className={classNames?.input}
                id='currentPassword'
                name='currentPassword'
                placeholder={t('account.currentPasswordPlaceholder')}
                required
              />
            </div>

            <div className='grid gap-2'>
              <Label className={classNames?.label} htmlFor='newPassword'>
                {t('account.newPassword')}
              </Label>

              <PasswordInput
                autoComplete='new-password'
                className={classNames?.input}
                id='newPassword'
                name='newPassword'
                onChange={(e) =>
                  !confirmPasswordEnabled && setDisabled(e.target.value === '')
                }
                placeholder={t('account.newPasswordPlaceholder')}
                required
              />
            </div>

            {confirmPasswordEnabled && (
              <ConfirmPasswordInput
                autoComplete='current-password'
                classNames={classNames}
                onChange={() => setDisabled(false)}
              />
            )}
          </>
        )}
      </CardContent>
    </SettingsCard>
  );
}
