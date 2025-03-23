import { createI18nMiddleware } from 'next-international/middleware';

import type { NextRequest } from 'next/server';

const handleI18nMiddleware = createI18nMiddleware({
  locales: ['en', 'de', 'pt-BR'],
  defaultLocale: 'en',
  urlMappingStrategy: 'rewrite',
});

export default function i18nMiddleware(request: NextRequest) {
  return handleI18nMiddleware(request);
}
