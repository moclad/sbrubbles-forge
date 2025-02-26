import type { NextMiddleware, NextRequest } from 'next/server';

import { authMiddleware } from '@repo/auth/middleware';

export default async function middleware(request: NextRequest) {
  return (await authMiddleware(request)) as unknown as NextMiddleware;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
