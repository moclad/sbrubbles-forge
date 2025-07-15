'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Separator } from '@repo/design-system/components/ui/separator';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useI18n } from '@repo/localization/i18n/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { forgetPassword } from '../../client';
import { forgetPwFormSchema } from '../../lib/auth-schema';
export const ForgotPassword = () => {
  const toastIdRef = useRef<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useI18n();

  const form = useForm<z.infer<typeof forgetPwFormSchema>>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(forgetPwFormSchema),
  });

  async function onSubmit(values: z.infer<typeof forgetPwFormSchema>) {
    const { email } = values;
    await forgetPassword(
      {
        email,
        redirectTo: '/reset-password',
      },
      {
        onError: (ctx) => {
          toast.error(
            t('authentication.error.resetFailed', { error: ctx.error.message }),
            {
              id: toastIdRef.current ?? undefined,
            }
          );
          setLoading(false);
        },
        onRequest: () => {
          toastIdRef.current = toast.loading(t('common.pleaseWait'));
          setLoading(true);
        },
        onSuccess: () => {
          toast.success(t('authentication.actions.checkEmail'), {
            id: toastIdRef.current ?? undefined,
          });
          form.reset();
          setLoading(false);
          router.push('/sign-in');
        },
      }
    );
  }

  return (
    <div className='mx-auto w-full max-w-md'>
      <div className='space-y-2'>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    {t('authentication.fields.email')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('authentication.fields.emailPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='w-full' loading={loading} type='submit'>
              {t('authentication.actions.sendResetLink')}
            </Button>
          </form>
        </Form>
      </div>

      <Separator className='mt-4 mb-4' />
      <div className='mt-4 flex justify-center'>
        <p className='text-muted-foreground text-sm'>
          {t('authentication.withAccountQuestion')}{' '}
          <Link
            className='underline underline-offset-4 hover:text-primary'
            href='/sign-in'
          >
            {t('authentication.actions.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
};
