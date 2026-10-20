import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import pt from '../../messages/pt.json';

type Messages = Record<string, unknown>;

/**
 * Completa o idioma pedido com o português.
 *
 * A copy nasce em português e a tradução entra por etapas. Sem isto, uma
 * chave ainda não traduzida quebraria /en e /es. Com isto, a página aparece
 * em português naquele trecho até a tradução chegar.
 */
function withFallback(target: Messages, fallback: Messages): Messages {
  const merged: Messages = { ...fallback };

  for (const [key, value] of Object.entries(target)) {
    const base = fallback[key];
    merged[key] =
      isPlainObject(value) && isPlainObject(base)
        ? withFallback(value, base)
        : value;
  }

  return merged;
}

function isPlainObject(value: unknown): value is Messages {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages =
    locale === 'pt'
      ? pt
      : withFallback(
          (await import(`../../messages/${locale}.json`)).default,
          pt as Messages,
        );

  return { locale, messages: messages as Messages };
});
