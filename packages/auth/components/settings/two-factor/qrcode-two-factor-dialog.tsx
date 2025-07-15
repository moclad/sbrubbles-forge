'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { InputOTP } from '@repo/design-system/components//ui/input-otp';
import {
  Alert,
  AlertDescription,
} from '@repo/design-system/components/ui/alert';
import { Button } from '@repo/design-system/components/ui/button';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
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
import { Smartphone } from 'lucide-react';
import { useContext, useRef } from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'react-qr-code';
import z from 'zod';

import { useIsHydrated } from '../../../hooks/use-hydrated';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { getErrorMessage } from '../../../lib/get-error-message';
import { getSearchParam } from '../../../lib/utils';
import type { AuthClient } from '../../../types/auth-client';
import { OTPInputGroup } from '../../otp-input-group';

interface QrCodeTwoFactorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totpURI?: string | null;
}

export function QrCodeTwoFactorDialog({
  open,
  onOpenChange,
  totpURI,
}: Readonly<QrCodeTwoFactorProps>) {
  const isHydrated = useIsHydrated();
  const effectiveTotpURI =
    totpURI ?? (isHydrated ? getSearchParam('totpURI') : null);
  const initialSendRef = useRef(false);
  const t = useI18n();

  const {
    authClient,
    hooks: { useSession },
    twoFactor,
  } = useContext(AuthUIContext);

  const { data: sessionData } = useSession();
  const isTwoFactorEnabled = sessionData?.user.twoFactorEnabled;

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
    defaultValues: {
      code: '',
      trustDevice: false,
    },
    resolver: zodResolver(formSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  async function verifyCode({ code, trustDevice }: z.infer<typeof formSchema>) {
    try {
      const verifyMethod = (authClient as AuthClient).twoFactor.verifyTotp;

      await verifyMethod({
        code,
        fetchOptions: { throw: true },
        trustDevice,
      });

      if (sessionData && !isTwoFactorEnabled) {
        toast.success(t('account.twoFactorEnabled'));
        onOpenChange(false);
        form.reset();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));

      form.reset();
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <Form {...form}>
        <form
          className={'grid w-full gap-6'}
          onSubmit={form.handleSubmit(verifyCode)}
        >
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{t('account.scanQrCode')}</DialogTitle>
              <DialogDescription>
                {t('account.scanQrCodeDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-2'>
              {twoFactor?.includes('totp') && effectiveTotpURI && (
                <div className='flex items-center justify-center'>
                  <QRCode
                    className={'border shadow-xs'}
                    value={effectiveTotpURI}
                  />
                </div>
              )}

              <>
                <FormField
                  control={form.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center justify-between'>
                        <FormLabel>{t('account.oneTimePassword')}</FormLabel>
                      </div>

                      <FormControl>
                        <InputOTP
                          {...field}
                          disabled={isSubmitting}
                          maxLength={6}
                          onChange={(value) => {
                            field.onChange(value);

                            if (value.length === 6) {
                              form.handleSubmit(verifyCode)();
                            }
                          }}
                        >
                          <OTPInputGroup otpSeparators={1} />
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
                          disabled={isSubmitting}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>

                      <FormLabel>{t('account.trustDevice')}</FormLabel>
                    </FormItem>
                  )}
                />
              </>

              <Alert variant='default'>
                <Smartphone />
                <AlertDescription>
                  {t('account.twoFactorAdvice')}
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button loading={isSubmitting} type='submit'>
                {t('account.twoFactorVerify')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
}
