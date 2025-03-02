import { NextResponse } from 'next/server';

import { betterFetch } from '@better-fetch/fetch';

import type { auth } from './server';

import type { NextRequest } from 'next/server';
const isProtectedRoute = (request: NextRequest) => {
  return request.url.startsWith('/dashboard'); // change this to your protected route
};

type Session = typeof auth.$Infer.Session;

export const authMiddleware = async (request: NextRequest) => {
  const { data: session } = await betterFetch<Session>('/auth/get-session', {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get('cookie') ?? '', // Forward the cookies from the request
    },
  });

  if (isProtectedRoute(request) && !session) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
};
