import { authMiddleware } from '@repo/auth/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// List of allowed origins for CORS
const allowedOrigins = ['http://localhost:3005', 'https://example-1.com'];

export default async function proxy(request: NextRequest) {
  // First, run the auth middleware
  const authResult = await authMiddleware(request);

  // Get a proper NextResponse object - authMiddleware returns NextResponse | null
  const response = authResult instanceof NextResponse ? authResult : NextResponse.next();

  // Add CORS headers
  const origin = request.headers.get('origin');

  // If the origin is an allowed one, add it to the 'Access-Control-Allow-Origin' header
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.append('Access-Control-Allow-Origin', origin);
  }

  response.headers.append('Access-Control-Allow-Credentials', 'true');
  response.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  response.headers.append(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
