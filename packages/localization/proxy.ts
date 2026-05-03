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

    // Filter out invalid language tags like '*' which are valid in Accept-Language
    // but not valid for Intl.getCanonicalLocales()
    const validLanguages = acceptedLanguages.filter((lang) => {
      // Filter out wildcards and validate the tag
      if (lang === '*' || !lang) {
        return false;
      }
      try {
        Intl.getCanonicalLocales(lang);
        return true;
      } catch {
        return false;
      }
    });

    const matchedLocale = matchLocale(validLanguages, locales, 'en');

    return matchedLocale;
  },
  urlMappingStrategy: 'rewrite',
});

export default function i18nMiddleware(request: NextRequest) {
  return handleI18nMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

//https://nextjs.org/docs/app/building-your-application/routing/internationalization
//https://github.com/vercel/next.js/tree/canary/examples/i18n-routing
//https://github.com/QuiiBz/next-international
//https://next-international.vercel.app/docs/app-middleware-configuration
