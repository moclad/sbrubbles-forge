'use client';
import { createI18nClient } from 'next-international/client';

type CreateI18nClientReturn = ReturnType<typeof createI18nClient>;

const i18nClient: CreateI18nClientReturn = createI18nClient({
  en: () => import('../locales/en'),
  de: () => import('../locales/de'),
  'pt-BR': () => import('../locales/pt-BR'),
});

export const {
  useI18n,
  useScopedI18n,
  I18nProviderClient,
  useChangeLocale,
  useCurrentLocale,
} = i18nClient;
