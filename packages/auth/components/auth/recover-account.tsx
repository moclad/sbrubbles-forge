'use client';
import { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
        onSubmit={form.handleSubmit(verifyBackupCode)}
        className={cn('mt-4 space-y-4', className)}
      >
        <FormField
          control={form.control}
          name='code'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account.backupCode')}</FormLabel>

              <FormControl>
                <Input
                  placeholder={t('account.backupCodePlaceholder')}
                  autoComplete='off'
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          disabled={isSubmitting}
          loading={isSubmitting}
          className='mt-4 w-full'
        >
          {t('account.recoverAction')}
        </Button>

        <Button
          type='button'
          variant='secondary'
          className='w-full'
          disabled={isSubmitting}
          onClick={() => navigate(`${basePath}/sign-in`)}
        >
          {t('account.backToSignIn')}
        </Button>
      </form>
    </Form>
  );
}
