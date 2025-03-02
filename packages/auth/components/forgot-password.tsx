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

import { forgetPassword } from '../client';
import { formSchema } from '../lib/auth-schema';

import type { z } from 'zod';
export const ForgotPassword = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email } = values;
    const { data, error } = await forgetPassword(
      {
        email,
        redirectTo: '/reset-password',
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
          toast({ title: `Error: ${ctx.error.message}` });
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
                  <FormLabel className='text-muted-foreground'>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='john@mail.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='w-full' type='submit'>
              Submit
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
