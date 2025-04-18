import { createI18nServer } from 'next-international/server';

type CreateI18nServerReturn = ReturnType<typeof createI18nServer>;

const i18nServer: CreateI18nServerReturn = createI18nServer({
  en: () => import('../locales/en'),
  de: () => import('../locales/de'),
  'pt-BR': () => import('../locales/pt-BR'),
});

export const { getI18n, getScopedI18n, getStaticParams, getCurrentLocale } =
  i18nServer;
