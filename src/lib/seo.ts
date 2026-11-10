import { routing } from '@/i18n/routing';

/**
 * Canônico e alternativas de idioma de cada página.
 *
 * Existem dois motivos para isto. O site responde em dois endereços — o
 * subdomínio e o `.vercel.app` da Vercel — e responde em três idiomas; sem
 * declarar qual é o oficial, o buscador vê o mesmo conteúdo repetido e
 * divide a força entre as cópias em vez de somar.
 *
 * O prefixo segue a regra do roteamento: português fica na raiz, inglês e
 * espanhol ganham `/en` e `/es`. O `x-default` aponta para o português,
 * que é o mercado principal.
 */

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lp.amazonjetaviation.com').replace(
  /\/+$/,
  '',
);

/** `caminho` vem sem idioma e começando com barra. Vazio é a home. */
export function alternativas(locale: string, caminho = '') {
  const endereco = (idioma: string) =>
    idioma === routing.defaultLocale
      ? `${BASE}${caminho || '/'}`
      : `${BASE}/${idioma}${caminho}`;

  const languages: Record<string, string> = {};
  for (const idioma of routing.locales) languages[idioma] = endereco(idioma);
  languages['x-default'] = endereco(routing.defaultLocale);

  return { canonical: endereco(locale), languages };
}
