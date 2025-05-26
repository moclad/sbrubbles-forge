'use client';

import { Loader2, QrCodeIcon, SendIcon } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'react-qr-code';
import * as z from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { InputOTP } from '@repo/design-system/components//ui/input-otp';
import { Label } from '@repo/design-system/components//ui/label';
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
import { useI18n } from '@repo/localization/i18n/client';

import { useIsHydrated } from '../../hooks/use-hydrated';
import { useOnSuccessTransition } from '../../hooks/use-success-transition';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { cn, getSearchParam } from '../../lib/utils';
import { OTPInputGroup } from '../otp-input-group';

import type { BetterFetchError } from '@better-fetch/fetch';
import type { AuthClient } from '../../../types/auth-client';
import type { AuthFormClassNames } from '../auth-form';
export interface TwoFactorFormProps {
  className?: string;
  classNames?: AuthFormClassNames;
  isSubmitting?: boolean;
  otpSeparators?: 0 | 1 | 2;
  redirectTo?: string;
  setIsSubmitting?: (value: boolean) => void;
}

export function TwoFactorForm({
  className,
  classNames,
  isSubmitting,
  otpSeparators = 0,
  redirectTo,
  setIsSubmitting,
}: TwoFactorFormProps) {
  const isHydrated = useIsHydrated();
  const totpURI = isHydrated ? getSearchParam('totpURI') : null;
  const initialSendRef = useRef(false);
  const t = useI18n();

  const {
    authClient,
    basePath,
    hooks: { useSession },
    twoFactor,
    viewPaths,
    toast,
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
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

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
    },
  });

  isSubmitting =
    isSubmitting || form.formState.isSubmitting || transitionPending;

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || transitionPending);
  }, [form.formState.isSubmitting, transitionPending, setIsSubmitting]);

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (method === 'otp' && cooldownSeconds <= 0 && !initialSendRef.current) {
      initialSendRef.current = true;
      sendOtp();
    }
  }, [method]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setTimeout(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  const sendOtp = async () => {
    if (isSendingOtp || cooldownSeconds > 0) return;

    try {
      setIsSendingOtp(true);
      await (authClient as AuthClient).twoFactor.sendOtp({
        fetchOptions: { throw: true },
      });
      setCooldownSeconds(60);
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });

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
        toast({
          variant: 'success',
          message: localization?.twoFactorEnabled,
        });
      }
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });

      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(verifyCode)}
        className={cn('grid w-full gap-6', className, classNames?.base)}
      >
        {twoFactor?.includes('totp') && totpURI && method === 'totp' && (
          <div className='space-y-3'>
            <Label className={classNames?.label}>
              {localization.twoFactorTotpLabel}
            </Label>

            <QRCode
              className={cn('border shadow-xs', classNames?.qrCode)}
              value={totpURI}
            />
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
                    <FormLabel className={classNames?.label}>
                      {localization.oneTimePassword}
                    </FormLabel>

                    <Link
                      className={cn(
                        'text-sm hover:underline',
                        classNames?.forgotPasswordLink
                      )}
                      href={`${basePath}/${viewPaths.recoverAccount}${isHydrated ? window.location.search : ''}`}
                    >
                      {localization.forgotAuthenticator}
                    </Link>
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
                      containerClassName={classNames?.otpInputContainer}
                      className={classNames?.otpInput}
                      disabled={isSubmitting}
                    >
                      <OTPInputGroup otpSeparators={otpSeparators} />
                    </InputOTP>
                  </FormControl>

                  <FormMessage className={classNames?.error} />
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
                      className={classNames?.checkbox}
                    />
                  </FormControl>

                  <FormLabel className={classNames?.label}>
                    {localization.trustDevice}
                  </FormLabel>
                </FormItem>
              )}
            />
          </>
        )}

        <div className='grid gap-4'>
          {method !== null && (
            <Button
              type='submit'
              disabled={isSubmitting}
              className={cn(classNames?.button, classNames?.primaryButton)}
            >
              {isSubmitting && <Loader2 className='animate-spin' />}
              {localization.twoFactorAction}
            </Button>
          )}

          {method === 'otp' && twoFactor?.includes('otp') && (
            <Button
              type='button'
              variant='outline'
              onClick={sendOtp}
              disabled={cooldownSeconds > 0 || isSendingOtp || isSubmitting}
              className={cn(classNames?.button, classNames?.outlineButton)}
            >
              {isSendingOtp ? (
                <Loader2 className='animate-spin' />
              ) : (
                <SendIcon className={classNames?.icon} />
              )}

              {localization.resendCode}
              {cooldownSeconds > 0 && ` (${cooldownSeconds})`}
            </Button>
          )}

          {method !== 'otp' && twoFactor?.includes('otp') && (
            <Button
              type='button'
              variant='secondary'
              className={cn(classNames?.button, classNames?.secondaryButton)}
              onClick={() => setMethod('otp')}
              disabled={isSubmitting}
            >
              <SendIcon className={classNames?.icon} />
              {localization.sendVerificationCode}
            </Button>
          )}

          {method !== 'totp' && twoFactor?.includes('totp') && (
            <Button
              type='button'
              variant='secondary'
              className={cn(classNames?.button, classNames?.secondaryButton)}
              onClick={() => setMethod('totp')}
              disabled={isSubmitting}
            >
              <QrCodeIcon className={classNames?.icon} />
              {localization.continueWithAuthenticator}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
