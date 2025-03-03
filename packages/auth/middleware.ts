import { NextResponse } from 'next/server';

import { betterFetch } from '@better-fetch/fetch';

import { keys } from './keys';

import type { NextRequest } from 'next/server';

const authRoutes = ['/sign-in', '/sign-up'];
const passwordRoutes = ['/reset-password', '/forgot-password'];
const appRoutes = ['/dashboard'];

import type { Session } from './server';

export const authMiddleware = async (request: NextRequest) => {
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isAppRoute = appRoutes.includes(pathName);

  const {
    data,
    data: session,
    error,
  } = await betterFetch<Session>('/api/auth/get-session', {
    baseURL: keys().BETTER_AUTH_URL,
    headers: {
      cookie: request.headers.get('cookie') ?? '', // Forward the cookies from the request
    },
  });

  if (!session) {
    if (isAuthRoute || isPasswordRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAuthRoute || isPasswordRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isAppRoute && session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
};
