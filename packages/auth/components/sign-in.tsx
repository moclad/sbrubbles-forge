'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

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
import { PasswordInput } from '@repo/design-system/components/ui/password-input';
import { Separator } from '@repo/design-system/components/ui/separator';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useI18n } from '@repo/localization/i18n/client';

import { signIn } from '../client';
import { signInFormSchema } from '../lib/auth-schema';

import type { z } from 'zod';
export const SignIn = () => {
  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const toastIdRef = useRef<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const t = useI18n();

  async function onSubmit(values: z.infer<typeof signInFormSchema>) {
    const { email, password } = values;

    await signIn.email(
      {
        email,
        password,
        callbackURL: '/dashboard',
      },
      {
        onRequest: () => {
          toastIdRef.current = toast.loading(
            t('authentication.actions.signingIn')
          );
          setLoading(true);
        },
        onSuccess: () => {
          toast.success(t('authentication.actions.signedIn'), {
            id: toastIdRef.current ?? undefined,
          });
          form.reset();
        },
        onError: (ctx) => {
          toast.error(
            t('authentication.error.signInFailed', {
              error: ctx.error.message,
            }),
            {
              id: toastIdRef.current ?? undefined,
            }
          );
          setLoading(false);
        },
      }
    );
  }

  return (
    <div className='mx-auto w-full max-w-md'>
      <div className='space-y-2'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center text-muted-foreground'>
                    <FormLabel>{t('authentication.fields.password')}</FormLabel>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder={t(
                        'authentication.fields.passwordPlaceholder'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <Link
                    href='/forgot-password'
                    className='ml-auto inline-block text-muted-foreground text-sm hover:underline'
                  >
                    {t('authentication.fields.forgotPassword')}
                  </Link>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className='w-full'
              type='submit'
              loading={loading}
              data-testid='sign-in-btn'
            >
              {t('authentication.actions.signIn')}
            </Button>
          </form>
        </Form>
        <Separator className='mt-4 mb-4' />
        <div className='mt-4 flex justify-center'>
          <p className='text-muted-foreground text-sm'>
            {t('authentication.noAccountQuestion')}{' '}
            <Link
              href='/sign-up'
              className='underline underline-offset-4 hover:text-primary'
            >
              {t('authentication.actions.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
