'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components//ui/form';
import { Input } from '@repo/design-system/components//ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { toast } from '@repo/design-system/components/ui/sonner';
import { cn } from '@repo/design-system/lib/utils';
import { useI18n } from '@repo/localization/i18n/client';
import { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useOnSuccessTransition } from '../../hooks/use-success-transition';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { getErrorMessage } from '../../lib/get-error-message';

import type { AuthClient } from '../../types/auth-client';
export interface RecoverAccountFormProps {
  className?: string;
  isSubmitting?: boolean;
  redirectTo?: string;
  setIsSubmitting?: (value: boolean) => void;
}

export function RecoverAccountForm({
  className,
  isSubmitting,
  redirectTo,
  setIsSubmitting,
}: RecoverAccountFormProps) {
  const { authClient, basePath, navigate } = useContext(AuthUIContext);
  const t = useI18n();

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  });

  const formSchema = z.object({
    code: z.string().min(1, { message: t('account.backupCodeRequired') }),
  });

  const form = useForm({
    defaultValues: {
      code: '',
    },
    resolver: zodResolver(formSchema),
  });

  isSubmitting =
    isSubmitting || form.formState.isSubmitting || transitionPending;

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || transitionPending);
  }, [form.formState.isSubmitting, transitionPending, setIsSubmitting]);

  async function verifyBackupCode({ code }: z.infer<typeof formSchema>) {
    try {
      await (authClient as AuthClient).twoFactor.verifyBackupCode({
        code,
        fetchOptions: { throw: true },
      });

      await onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));

      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form
        className={cn('mt-4 space-y-4', className)}
        onSubmit={form.handleSubmit(verifyBackupCode)}
      >
        <FormField
          control={form.control}
          name='code'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.backupCode')}</FormLabel>

              <FormControl>
                <Input
                  autoComplete='off'
                  disabled={isSubmitting}
                  placeholder={t('account.backupCodePlaceholder')}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className='mt-4 w-full'
          disabled={isSubmitting}
          loading={isSubmitting}
          type='submit'
        >
          {t('account.recoverAction')}
        </Button>

        <Button
          className='w-full'
          disabled={isSubmitting}
          onClick={() => navigate(`${basePath}/sign-in`)}
          type='button'
          variant='secondary'
        >
          {t('account.backToSignIn')}
        </Button>
      </form>
    </Form>
  );
}
