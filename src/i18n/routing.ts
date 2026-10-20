import { defineRouting } from 'next-intl/routing';

export const locales = ['pt', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'pt',
  // Português fica na raiz, porque é o mercado principal. Inglês e espanhol
  // ganham prefixo: /en, /es.
  localePrefix: 'as-needed',
});
