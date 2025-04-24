'use client';

import { useContext, useState } from 'react';

import { CardContent } from '@repo/design-system/components/ui/card';
import { Label } from '@repo/design-system/components/ui/label';
import { PasswordInput } from '@repo/design-system/components/ui/password-input';
import { toast } from '@repo/design-system/components/ui/sonner';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';

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
      redirectTo: `${basePath}/reset-password`,
      fetchOptions: { throw: true },
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
      newPassword,
      revokeOtherSessions: true,
      fetchOptions: { throw: true },
    });

    toast.error(t('account.changePasswordSuccess'));
  };

  const credentialsLinked = accounts?.some(
    (acc) => acc.provider === 'credential'
  );

  if (!isPending && !credentialsLinked) {
    return (
      <SettingsCard
        title={t('account.changePassword')}
        description={t('account.setPasswordDescription')}
        actionLabel={t('account.setPassword')}
        formAction={setPassword}
        isPending={isPending}
        className={className}
        classNames={classNames}
      />
    );
  }

  return (
    <SettingsCard
      title={t('account.changePassword')}
      description={t('account.changePasswordDescription')}
      actionLabel={t('account.save')}
      disabled={disabled}
      isPending={isPending}
      instructions={t('account.changePasswordInstructions')}
      className={className}
      classNames={classNames}
      formAction={changePassword}
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
                id='currentPassword'
                name='currentPassword'
                className={classNames?.input}
                autoComplete='current-password'
                placeholder={t('account.currentPasswordPlaceholder')}
                required
              />
            </div>

            <div className='grid gap-2'>
              <Label className={classNames?.label} htmlFor='newPassword'>
                {t('account.newPassword')}
              </Label>

              <PasswordInput
                id='newPassword'
                name='newPassword'
                className={classNames?.input}
                autoComplete='new-password'
                placeholder={t('account.newPasswordPlaceholder')}
                required
                onChange={(e) =>
                  !confirmPasswordEnabled && setDisabled(e.target.value === '')
                }
              />
            </div>

            {confirmPasswordEnabled && (
              <ConfirmPasswordInput
                classNames={classNames}
                onChange={() => setDisabled(false)}
                autoComplete='current-password'
              />
            )}
          </>
        )}
      </CardContent>
    </SettingsCard>
  );
}
