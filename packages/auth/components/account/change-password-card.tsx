'use client';

import { useState } from 'react';

import { CardContent } from '@repo/design-system/components/ui/card';
import { Label } from '@repo/design-system/components/ui/label';
import { cn } from '@repo/design-system/lib/utils';

import { authClient, useSession } from '../../client';
import { ConfirmPasswordInput } from '../confirm-password-input';
import { PasswordInput } from '../password-input';
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
  localization,
  skipHook,
}: ChangePasswordCardProps) {
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
      redirectTo: `${basePath}/${viewPaths.resetPassword}`,
      fetchOptions: { throw: true },
    });

    toast({ variant: 'success', message: localization.setPasswordEmailSent! });
  };

  const changePassword = async (formData: FormData) => {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;

    if (confirmPasswordEnabled) {
      const confirmPassword = formData.get('confirmPassword') as string;
      if (newPassword !== confirmPassword && localization.passwordsDoNotMatch) {
        throw new Error(localization.passwordsDoNotMatch);
      }
    }

    await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
      fetchOptions: { throw: true },
    });

    toast({ variant: 'success', message: localization.changePasswordSuccess! });
  };

  const credentialsLinked = accounts?.some(
    (acc) => acc.provider === 'credential'
  );

  if (!isPending && !credentialsLinked) {
    return (
      <SettingsCard
        title={localization.changePassword}
        description={localization.setPasswordDescription}
        actionLabel={localization.setPassword}
        formAction={setPassword}
        isPending={isPending}
        className={className}
        classNames={classNames}
      />
    );
  }

  return (
    <SettingsCard
      title={localization.changePassword}
      description={localization.changePasswordDescription}
      actionLabel={localization.save}
      disabled={disabled}
      isPending={isPending}
      instructions={localization.changePasswordInstructions}
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
                {localization.currentPassword}
              </Label>

              <PasswordInput
                id='currentPassword'
                name='currentPassword'
                className={classNames?.input}
                autoComplete='current-password'
                placeholder={localization.currentPasswordPlaceholder}
                required
              />
            </div>

            <div className='grid gap-2'>
              <Label className={classNames?.label} htmlFor='newPassword'>
                {localization.newPassword}
              </Label>

              <PasswordInput
                id='newPassword'
                name='newPassword'
                className={classNames?.input}
                autoComplete='new-password'
                placeholder={localization.newPasswordPlaceholder}
                required
                enableToggle
                onChange={(e) =>
                  !confirmPasswordEnabled && setDisabled(e.target.value === '')
                }
              />
            </div>

            {confirmPasswordEnabled && (
              <ConfirmPasswordInput
                classNames={classNames}
                localization={localization}
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
