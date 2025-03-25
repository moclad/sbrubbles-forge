import Negotiator from 'negotiator';
import { createI18nMiddleware } from 'next-international/middleware';

import { match as matchLocale } from '@formatjs/intl-localematcher';

import type { NextRequest } from 'next/server';

const locales = ['en', 'de', 'pt-BR'];
const handleI18nMiddleware = createI18nMiddleware({
  locales,
  defaultLocale: 'en',
  urlMappingStrategy: 'rewrite',
  resolveLocaleFromRequest: (request: NextRequest) => {
    const headers = Object.fromEntries(request.headers.entries());
    const negotiator = new Negotiator({ headers });
    const acceptedLanguages = negotiator.languages();

    const matchedLocale = matchLocale(acceptedLanguages, locales, 'en');

    return matchedLocale;
  },
});

export default function i18nMiddleware(request: NextRequest) {
  return handleI18nMiddleware(request);
}
