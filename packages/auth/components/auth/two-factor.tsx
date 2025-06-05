'use client';

import { useContext } from 'react';
import { useForm } from 'react-hook-form';
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
import { OTPInputGroup } from '../otp-input-group';

import type { AuthClient } from '../../types/auth-client';
export interface TwoFactorFormProps {
  className?: string;
  isSubmitting?: boolean;
  otpSeparators?: 0 | 1 | 2;
  redirectTo?: string;
}

export function TwoFactorForm({
  isSubmitting,
  otpSeparators = 1,
  redirectTo,
}: Readonly<TwoFactorFormProps>) {
  const isHydrated = useIsHydrated();
  const t = useI18n();

  const {
    authClient,
    basePath,
    hooks: { useSession },
    navigate,
    Link,
  } = useContext(AuthUIContext);

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  });

  const { data: sessionData } = useSession();

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

  async function verifyCode({ code, trustDevice }: z.infer<typeof formSchema>) {
    try {
      const verifyMethod = (authClient as AuthClient).twoFactor.verifyTotp;

      await verifyMethod({
        code,
        trustDevice,
        fetchOptions: { throw: true },
      });

      await onSuccess();

      if (sessionData) {
        toast.success(t('account.twoFactorCodeSuccess'));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));

      form.reset();
    }
  }

  return (
    <div className='mx-auto w-full max-w-md'>
      <div className='space-y-4'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(verifyCode)}
            className='mt-4 space-y-4'
          >
            <>
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center justify-between'>
                      <FormLabel>{t('account.oneTimePassword')}</FormLabel>

                      <Link
                        className={cn('text-sm hover:underline')}
                        href={`${basePath}/recover-account${isHydrated ? window.location.search : ''}`}
                      >
                        {t('account.forgotAuthenticator')}
                      </Link>
                    </div>

                    <div className='flex items-center justify-center'>
                      <FormControl>
                        <InputOTP
                          autoFocus
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
                    </div>

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

            <Button
              type='submit'
              className='mt-4 w-full'
              loading={isSubmitting}
            >
              {isSubmitting
                ? t('account.twoFactorVerifying')
                : t('account.twoFactorVerify')}
            </Button>

            <Button
              type='button'
              variant='secondary'
              className='w-full'
              loading={isSubmitting}
              onClick={() => navigate(`${basePath}/sign-in`)}
            >
              {t('account.backToSignIn')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
