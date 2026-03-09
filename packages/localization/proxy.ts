import Negotiator from 'negotiator';
import { createI18nMiddleware } from 'next-international/middleware';

import { match as matchLocale } from '@formatjs/intl-localematcher';

import type { NextRequest } from 'next/server';
const locales = ['en', 'de', 'pt-BR'];
const handleI18nMiddleware = createI18nMiddleware({
  defaultLocale: 'en',
  locales,
  resolveLocaleFromRequest: (request: NextRequest) => {
    const headers = Object.fromEntries(request.headers.entries());
    const negotiator = new Negotiator({ headers });
    const acceptedLanguages = negotiator.languages();

    const matchedLocale = matchLocale(acceptedLanguages, locales, 'en');

    return matchedLocale;
  },
  urlMappingStrategy: 'rewrite',
});

export default function i18nMiddleware(request: NextRequest) {
  return handleI18nMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

//https://nextjs.org/docs/app/building-your-application/routing/internationalization
//https://github.com/vercel/next.js/tree/canary/examples/i18n-routing
//https://github.com/QuiiBz/next-international
//https://next-international.vercel.app/docs/app-middleware-configuration
