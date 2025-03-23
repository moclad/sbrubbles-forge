import { createI18nServer } from 'next-international/server';

export const { getI18n, getScopedI18n, getStaticParams, getCurrentLocale } =
  createI18nServer({
    en: () => import('../locales/en'),
    de: () => import('../locales/de'),
    'pt-BR': () => import('../locales/pt-BR'),
  });
