'use client';

import { CardContent } from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { toast } from '@repo/design-system/components/ui/sonner';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';
import { useContext, useEffect, useRef, useState } from 'react';

import { AuthUIContext } from '../../lib/auth-ui-provider';
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

  const {
    authClient,
    emailVerification,
    hooks: { useSession },
  } = useContext(AuthUIContext);
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
      setTimeout(() => toast.info(t('account.emailVerification')));
    }
  }, [t, sessionData]);

  const changeEmail = async (formData: FormData) => {
    const newEmail = formData.get('email') as string;
    if (newEmail === sessionData?.user.email) {
      return {};
    }

    const callbackURL = `${window.location.pathname}?verifyEmail=true`;

    await authClient.changeEmail({
      callbackURL,
      fetchOptions: { throw: true },
      newEmail,
    });

    if (sessionData?.user.emailVerified) {
      toast.info(t('account.emailVerifyChange'));
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
        actionLabel={t('account.save')}
        className={className}
        classNames={classNames}
        description={t('account.emailDescription')}
        disabled={disabled}
        formAction={changeEmail}
        instructions={t('account.emailInstructions')}
        isPending={isPending || sessionPending}
        key={sessionData?.user.email}
        title={t('account.email')}
      >
        <CardContent className={classNames?.content}>
          {isPending ? (
            <Skeleton className={cn('h-9 w-full', classNames?.skeleton)} />
          ) : (
            <Input
              className={classNames?.input}
              defaultValue={sessionData?.user.email}
              key={sessionData?.user.email}
              name='email'
              onChange={(e) =>
                setDisabled(e.target.value === sessionData?.user.email)
              }
              placeholder={t('account.emailPlaceholder')}
              required
              type='email'
            />
          )}
        </CardContent>
      </SettingsCard>

      {emailVerification &&
        sessionData?.user &&
        !sessionData?.user.emailVerified && (
          <SettingsCard
            actionLabel={t('account.resendVerificationEmail')}
            className={className}
            classNames={classNames}
            description={t('account.verifyYourEmailDescription')}
            disabled={resendDisabled}
            formAction={resendVerification}
            title={t('account.verifyYourEmail')}
          />
        )}
    </>
  );
}
