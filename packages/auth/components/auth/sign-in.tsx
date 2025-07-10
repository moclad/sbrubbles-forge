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
import { PasswordInput } from '@repo/design-system/components/ui/password-input';
import { Separator } from '@repo/design-system/components/ui/separator';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useI18n } from '@repo/localization/i18n/client';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useContext, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { signIn } from '../../client';
import { signInFormSchema } from '../../lib/auth-schema';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { PasskeyButton } from './passkey-button';
export const SignIn = () => {
  const form = useForm<z.infer<typeof signInFormSchema>>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(signInFormSchema),
  });

  const toastIdRef = useRef<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPasskey, setLoadingPasskey] = useState(false);
  const t = useI18n();
  const router = useRouter();

  const { basePath } = useContext(AuthUIContext);

  async function onSubmit(values: z.infer<typeof signInFormSchema>) {
    const { email, password } = values;

    await signIn.email(
      {
        email,
        password,
      },
      {
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
        onRequest: () => {
          toastIdRef.current = toast.loading(
            t('authentication.actions.signingIn')
          );
          setLoading(true);
        },
        onSuccess: (context) => {
          toast.success(t('authentication.actions.signedIn'), {
            id: toastIdRef.current ?? undefined,
          });
          form.reset();

          if (context.data.twoFactorRedirect) {
            router.push(`${basePath}/two-factor${window.location.search}`);
          } else {
            router.push(`${basePath}/dashboard${window.location.search}`);
          }
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
                      autoComplete='email'
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
                    className='ml-auto inline-block text-muted-foreground text-sm hover:underline'
                    href='/forgot-password'
                  >
                    {t('authentication.fields.forgotPassword')}
                  </Link>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className='w-full'
              data-testid='sign-in-btn'
              disabled={loadingPasskey}
              loading={loading}
              type='submit'
            >
              <LogIn />
              {t('authentication.actions.signIn')}
            </Button>
          </form>
        </Form>
        <div className='flex items-center gap-2 py-4'>
          <Separator className={'!w-auto grow'} />

          <span className='flex-shrink-0 text-muted-foreground text-sm'>
            {t('authentication.orContinueWith')}
          </span>

          <Separator className={'!w-auto grow'} />
        </div>

        <PasskeyButton
          disabled={loading}
          isSubmitting={loadingPasskey}
          setIsSubmitting={setLoadingPasskey}
        />

        <Separator className='mt-4 mb-4' />

        <div className='mt-4 flex justify-center'>
          <p className='text-muted-foreground text-sm'>
            {t('authentication.noAccountQuestion')}{' '}
            <Link
              className='underline underline-offset-4 hover:text-primary'
              href='/sign-up'
            >
              {t('authentication.actions.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
