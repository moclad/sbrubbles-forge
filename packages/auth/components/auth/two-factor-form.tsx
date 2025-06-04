'use client';

import { Loader2, QrCodeIcon, SendIcon } from 'lucide-react';
import { ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'react-qr-code';
import * as z from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@repo/design-system//lib/utils';
import { InputOTP } from '@repo/design-system/components//ui/input-otp';
import { Button } from '@repo/design-system/components/ui/button';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useI18n } from '@repo/localization/i18n/client';

import { useIsHydrated } from '../../hooks/use-hydrated';
import { useOnSuccessTransition } from '../../hooks/use-success-transition';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { getErrorMessage } from '../../lib/get-error-message';
import { getSearchParam } from '../../lib/utils';
import { OTPInputGroup } from '../otp-input-group';

import type { BetterFetchError } from '@better-fetch/fetch';
import type { AuthClient } from '../../types/auth-client';

export interface TwoFactorFormProps {
  className?: string;
  isSubmitting?: boolean;
  otpSeparators?: 0 | 1 | 2;
  redirectTo?: string;
  setIsSubmitting?: (value: boolean) => void;
  totpURI?: string | null;
  children?: ReactNode;
}

export function TwoFactorForm({
  className,
  isSubmitting,
  otpSeparators = 0,
  redirectTo,
  setIsSubmitting,
  totpURI = null,
  children,
}: Readonly<TwoFactorFormProps>) {
  const isHydrated = useIsHydrated();
  const effectiveTotpURI =
    totpURI ?? (isHydrated ? getSearchParam('totpURI') : null);
  const initialSendRef = useRef(false);
  const t = useI18n();

  const {
    authClient,
    basePath,
    hooks: { useSession },
    twoFactor,
    Link,
  } = useContext(AuthUIContext);

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  });

  const { data: sessionData } = useSession();
  const isTwoFactorEnabled = sessionData?.user.twoFactorEnabled;

  const [method, setMethod] = useState<'totp' | 'otp' | null>(
    twoFactor?.length === 1 ? twoFactor[0] : null
  );

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [coolDownSeconds, setCoolDownSeconds] = useState(0);

  const formSchema = z.object({
    code: z
      .string()
      .min(1, {
        message: `${t('authentication.oneTimePassword')} ${t('authentication.isRequired')}`,
      })
      .min(6, {
        message: `${t('authentication.oneTimePassword')} ${t('authentication.isInvalid')}`,
      }),
    trustDevice: z.boolean().optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      trustDevice: false,
    },
  });

  isSubmitting =
    isSubmitting || form.formState.isSubmitting || transitionPending;

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || transitionPending);
  }, [form.formState.isSubmitting, transitionPending, setIsSubmitting]);

  useEffect(() => {
    if (method === 'otp' && coolDownSeconds <= 0 && !initialSendRef.current) {
      initialSendRef.current = true;
      sendOtp();
    }
  }, [method, coolDownSeconds]);

  useEffect(() => {
    if (coolDownSeconds <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCoolDownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [coolDownSeconds]);

  const sendOtp = async () => {
    if (isSendingOtp || coolDownSeconds > 0) {
      return;
    }

    try {
      setIsSendingOtp(true);
      await (authClient as AuthClient).twoFactor.sendOtp({
        fetchOptions: { throw: true },
      });
      setCoolDownSeconds(60);
    } catch (error) {
      toast.error(getErrorMessage(error));

      if (
        (error as BetterFetchError).error.code === 'INVALID_TWO_FACTOR_COOKIE'
      ) {
        history.back();
      }
    }

    initialSendRef.current = false;
    setIsSendingOtp(false);
  };

  async function verifyCode({ code, trustDevice }: z.infer<typeof formSchema>) {
    try {
      const verifyMethod =
        method === 'totp'
          ? (authClient as AuthClient).twoFactor.verifyTotp
          : (authClient as AuthClient).twoFactor.verifyOtp;

      await verifyMethod({
        code,
        trustDevice,
        fetchOptions: { throw: true },
      });

      await onSuccess();

      if (sessionData && !isTwoFactorEnabled) {
        toast.success(t('account.twoFactorEnabled'));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));

      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(verifyCode)}
        className={cn('grid w-full gap-6', className)}
      >
        {twoFactor?.includes('totp') &&
          effectiveTotpURI &&
          method === 'totp' && (
            <div className='flex items-center justify-center'>
              <QRCode className={'border shadow-xs'} value={effectiveTotpURI} />
            </div>
          )}

        {method !== null && (
          <>
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel>{t('account.oneTimePassword')}</FormLabel>

                    {/* <Link
                      className={cn('text-sm hover:underline')}
                      href={`${basePath}/recover-account${isHydrated ? window.location.search : ''}`}
                    >
                      {t('account.forgotAuthenticator')}
                    </Link> */}
                  </div>

                  <FormControl>
                    <InputOTP
                      {...field}
                      maxLength={6}
                      onChange={(value) => {
                        field.onChange(value);

                        if (value.length === 6) {
                          form.handleSubmit(verifyCode)();
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      <OTPInputGroup otpSeparators={otpSeparators} />
                    </InputOTP>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='trustDevice'
              render={({ field }) => (
                <FormItem className='flex'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>

                  <FormLabel>{t('account.trustDevice')}</FormLabel>
                </FormItem>
              )}
            />
          </>
        )}

        <div className='grid gap-4'>
          {children}
          {children === null && method !== null && (
            <Button type='submit' loading={isSubmitting}>
              {t('account.twoFactorAction')}
            </Button>
          )}

          {method === 'otp' && twoFactor?.includes('otp') && (
            <Button
              type='button'
              variant='outline'
              onClick={sendOtp}
              disabled={coolDownSeconds > 0 || isSendingOtp || isSubmitting}
              loading={isSendingOtp || isSubmitting}
            >
              {isSendingOtp ? (
                <Loader2 className='animate-spin' />
              ) : (
                <SendIcon />
              )}

              {t('account.resendCode')}
              {coolDownSeconds > 0 && ` (${coolDownSeconds})`}
            </Button>
          )}

          {method !== 'otp' && twoFactor?.includes('otp') && (
            <Button
              type='button'
              variant='secondary'
              onClick={() => setMethod('otp')}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              <SendIcon />
              {t('account.sendVerificationCode')}
            </Button>
          )}

          {method !== 'totp' && twoFactor?.includes('totp') && (
            <Button
              type='button'
              variant='secondary'
              onClick={() => setMethod('totp')}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              <QrCodeIcon />
              {t('account.continueWithAuthenticator')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
