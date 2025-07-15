import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import type { NextRequest } from 'next/server';
import { createI18nMiddleware } from 'next-international/middleware';

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
