'use client';

import Link from 'next/link';
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
import { Separator } from '@repo/design-system/components/ui/separator';
import { useToast } from '@repo/design-system/hooks/use-toast';

import { signIn } from '../client';
import { formSchema } from '../lib/auth-schema';

import type { z } from 'zod';
export const SignIn = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;
    console.log(values);
    const { data, error } = await signIn.email(
      {
        email,
        password,
        callbackURL: '/dashboard',
      },
      {
        onRequest: () => {
          toast({
            title: 'Please wait...',
          });
        },
        onSuccess: () => {
          form.reset();
        },
        onError: (ctx) => {
          console.log(ctx);
          toast({ title: `Error: ${ctx.error.message}` });
        },
      }
    );
    console.log(data, error);
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
                  <FormLabel className='text-muted-foreground'>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='john@mail.com' {...field} />
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
                  <FormLabel className='text-muted-foreground'>
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter your password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='mb-2'>
              <div className='text-right text-muted-foreground text-sm'>
                <Link
                  href='/forgot-password'
                  className='font-medium text-sm hover:underline'
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button className='w-full' type='submit'>
              Submit
            </Button>
          </form>
        </Form>
      </div>

      <Separator className='my-8' />

      <div className='flex justify-center'>
        <p className='text-muted-foreground text-sm'>
          Don&apos;t have an account yet?{' '}
          <Link href='/sign-up' className='font-medium hover:underline'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
