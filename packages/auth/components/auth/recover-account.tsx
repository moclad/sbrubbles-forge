'use client';
import { Loader2 } from 'lucide-react';
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
import { cn } from '@repo/design-system/lib/utils';

import { useOnSuccessTransition } from '../../hooks/use-success-transition';
import { AuthUIContext } from '../../lib/auth-ui-provider';

import type { AuthClient } from '../../types/auth-client';
export interface RecoverAccountFormProps {
  className?: string;
  classNames?: AuthFormClassNames;
  isSubmitting?: boolean;
  localization: Partial<AuthLocalization>;
  redirectTo?: string;
  setIsSubmitting?: (value: boolean) => void;
}

export function RecoverAccountForm({
  className,
  classNames,
  isSubmitting,
  localization,
  redirectTo,
  setIsSubmitting,
}: RecoverAccountFormProps) {
  const {
    authClient,
    localization: contextLocalization,
    toast,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  });

  const formSchema = z.object({
    code: z.string().min(1, { message: localization.backupCodeRequired }),
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
        onSubmit={form.handleSubmit(verifyBackupCode)}
        className={cn('grid gap-6', className, classNames?.base)}
      >
        <FormField
          control={form.control}
          name='code'
          render={({ field }) => (
            <FormItem>
              <FormLabel className={classNames?.label}>
                {localization.backupCode}
              </FormLabel>

              <FormControl>
                <Input
                  placeholder={localization.backupCodePlaceholder}
                  autoComplete='off'
                  className={classNames?.input}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>

              <FormMessage className={classNames?.error} />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          disabled={isSubmitting}
          className={cn(classNames?.button, classNames?.primaryButton)}
        >
          {isSubmitting ? (
            <Loader2 className='animate-spin' />
          ) : (
            localization.recoverAccountAction
          )}
        </Button>
      </form>
    </Form>
  );
}
