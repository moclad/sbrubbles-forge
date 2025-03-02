import { NextResponse } from 'next/server';

import { betterFetch } from '@better-fetch/fetch';

import { keys } from './keys';

import type { NextRequest } from 'next/server';

import type { auth } from './server';

const authRoutes = ['/sign-in', '/sign-up'];
const passwordRoutes = ['/reset-password', '/forgot-password'];
const appRoutes = ['/dashboard'];

type Session = typeof auth.$Infer.Session;

export const authMiddleware = async (request: NextRequest) => {
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isAppRoute = appRoutes.includes(pathName);

  const { data: session } = await betterFetch<Session>(
    '/api/auth/get-session',
    {
      baseURL: keys().BETTER_AUTH_URL,
      headers: {
        cookie: request.headers.get('cookie') ?? '', // Forward the cookies from the request
      },
    }
  );

  console.log(session);

  if (!session) {
    if (isAuthRoute || isPasswordRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAuthRoute || isPasswordRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isAppRoute && session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api (API routes)
     * Feel free to modify this pattern to include more paths.
     */
    //'/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
