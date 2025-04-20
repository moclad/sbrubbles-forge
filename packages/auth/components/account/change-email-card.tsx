'use client';

import { useEffect, useRef, useState } from 'react';

import { CardContent } from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';

import { toast } from '../../../design-system/components/ui/sonner';
import { authClient, useSession } from '../../client';
import { SettingsCard, SettingsCardClassNames } from './shared/settings-card';

export interface ChangeEmailCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  isPending?: boolean;
}

export function ChangeEmailCard({
  className,
  classNames,
  isPending,
}: Readonly<ChangeEmailCardProps>) {
  const shownVerifyEmailToast = useRef(false);
  const t = useI18n();
  const {
    data: sessionData,
    isPending: sessionPending,
    refetch,
  } = useSession();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (!sessionData) {
      return;
    }
    if (shownVerifyEmailToast.current) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('verifyEmail') && !sessionData.user.emailVerified) {
      shownVerifyEmailToast.current = true;
      setTimeout(() => toast.success(t('account.emailVerification')));
    }
  }, [t, sessionData]);

  const changeEmail = async (formData: FormData) => {
    const newEmail = formData.get('email') as string;
    if (newEmail === sessionData?.user.email) {
      return {};
    }

    const callbackURL = `${window.location.pathname}?verifyEmail=true`;

    await authClient.changeEmail({
      newEmail,
      callbackURL,
      fetchOptions: { throw: true },
    });

    if (sessionData?.user.emailVerified) {
      toast.success(t('account.emailVerifyChange'));
    } else {
      refetch?.();
    }
  };

  const resendVerification = async () => {
    setResendDisabled(true);

    try {
      await authClient.sendVerificationEmail({
        email: sessionData?.user.email ?? '',
        fetchOptions: { throw: true },
      });
    } catch (error) {
      setResendDisabled(false);
      throw error;
    }

    toast.success(t('account.emailVerification'));
  };

  return (
    <>
      <SettingsCard
        key={sessionData?.user.email}
        className={className}
        classNames={classNames}
        description={t('account.emailDescription')}
        formAction={changeEmail}
        instructions={t('account.emailInstructions')}
        isPending={isPending || sessionPending}
        title={t('account.email')}
        actionLabel={t('account.save')}
        disabled={disabled}
      >
        <CardContent className={classNames?.content}>
          {isPending ? (
            <Skeleton className={cn('h-9 w-full', classNames?.skeleton)} />
          ) : (
            <Input
              key={sessionData?.user.email}
              className={classNames?.input}
              defaultValue={sessionData?.user.email}
              name='email'
              placeholder={t('account.emailPlaceholder')}
              required
              type='email'
              onChange={(e) =>
                setDisabled(e.target.value === sessionData?.user.email)
              }
            />
          )}
        </CardContent>
      </SettingsCard>

      {sessionData?.user && !sessionData?.user.emailVerified && (
        <SettingsCard
          className={className}
          classNames={classNames}
          title={t('account.verifyYourEmail')}
          description={t('account.verifyYourEmailDescription')}
          actionLabel={t('account.resendVerificationEmail')}
          formAction={resendVerification}
          disabled={resendDisabled}
        />
      )}
    </>
  );
}
