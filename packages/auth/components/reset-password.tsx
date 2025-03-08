'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { PasswordInput } from '@repo/design-system/components/ui/password-input';
import { Separator } from '@repo/design-system/components/ui/separator';
import { toast } from '@repo/design-system/components/ui/sonner';

import { resetPassword } from '../client';
import { resetPwFormSchema } from '../lib/auth-schema';

import type { z } from 'zod';
type Props = {
  token: string;
};

export const ResetPassword = ({ token }: Props) => {
  const toastIdRef = useRef<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof resetPwFormSchema>>({
    resolver: zodResolver(resetPwFormSchema),
    defaultValues: {
      password: '',
      passwordConfirmation: '',
    },
  });

  async function onSubmit(values: z.infer<typeof resetPwFormSchema>) {
    const { password } = values;
    await resetPassword(
      {
        newPassword: password,
        token,
      },
      {
        onRequest: () => {
          toastIdRef.current = toast.loading('Please wait...');
          setLoading(true);
        },
        onSuccess: () => {
          toast.success('Password success updated', {
            id: toastIdRef.current ?? undefined,
          });
          form.reset();
          setLoading(false);
          router.push('/sign-in');
        },
        onError: (ctx) => {
          toast.error(ctx.error.message, {
            id: toastIdRef.current ?? undefined,
          });
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
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='Enter your password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='passwordConfirmation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground'>
                    Password confirmation
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='Confirm your password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='w-full' type='submit' loading={loading}>
              Reset password
            </Button>
          </form>
        </Form>
      </div>

      <Separator className='my-8' />

      <div className='flex justify-center'>
        <p className='text-muted-foreground text-sm'>
          Already have an account?{' '}
          <Link href='/sign-in' className='font-medium hover:underline'>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
