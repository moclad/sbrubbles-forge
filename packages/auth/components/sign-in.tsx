'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';

import { signIn } from '../client';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        await signIn.email({
          email,
          password,
        });
      }}
    >
      <div className="space-y-2">
        <label className="text-gray-500 text-sm" htmlFor="email">
          Users name or Email
        </label>
        <Input
          id="email"
          defaultValue="David Brooks"
          className="w-full rounded border p-2"
        />
      </div>

      <div className="space-y-2">
        <label className="text-gray-500 text-sm" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          type="password"
          defaultValue="password"
          className="w-full rounded border p-2"
        />
        <div className="text-right">
          <Link href="#" className="text-gray-500 text-sm hover:text-gray-700">
            Forget password?
          </Link>
        </div>
      </div>

      <Button className="w-full bg-gray-600 text-white hover:bg-gray-700">
        Sign in
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-gray-200 border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">or</span>
        </div>
      </div>

      <Button variant="outline" className="w-full border-gray-300">
        <Image
          src="/placeholder.svg"
          alt="Google"
          width={20}
          height={20}
          className="mr-2"
        />
        Sign in with Google
      </Button>

      <p className="text-center text-gray-500 text-sm">
        New Lovebirds?{' '}
        <Link href="#" className="text-gray-600 hover:text-gray-800">
          Create Account
        </Link>
      </p>
    </form>
  );
};
