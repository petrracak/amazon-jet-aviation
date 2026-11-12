import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';
import { listarPosts } from '@/lib/blog';
import { BASE, PAGINAS, alternativas } from '@/lib/seo';

export const revalidate = 3600;

/**
 * O mapa do site, nas três línguas.
 *
 * Cada endereço é listado uma vez por idioma, e cada entrada aponta as
 * outras duas como alternativas. Sem isso o buscador descobre as traduções
 * por acaso, se descobrir — e trata o que achar como páginas separadas em
 * vez de versões da mesma.
 *
 * O painel não entra: não há o que indexar atrás de um login.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entradas: MetadataRoute.Sitemap = [];

  const endereco = (locale: string, caminho: string) =>
    locale === routing.defaultLocale
      ? `${BASE}${caminho || '/'}`
      : `${BASE}/${locale}${caminho}`;

  for (const caminho of PAGINAS) {
    for (const locale of routing.locales) {
      entradas.push({
        url: endereco(locale, caminho),
        lastModified: new Date(),
        changeFrequency: caminho === '/blog' ? 'weekly' : 'monthly',
        priority: caminho === '' ? 1 : caminho === '/cotacao' ? 0.9 : 0.7,
        alternates: { languages: alternativas(locale, caminho).languages },
      });
    }
  }

  // Os textos do blog, com a data de publicação de verdade: é o sinal que
  // o buscador usa para saber se vale revisitar.
  for (const locale of routing.locales) {
    const posts = await listarPosts(locale);
    for (const post of posts) {
      const caminho = `/blog/${post.slug}`;
      entradas.push({
        url: endereco(locale, caminho),
        lastModified: post.published_at ? new Date(post.published_at) : new Date(),
        changeFrequency: 'yearly',
        priority: 0.6,
        alternates: { languages: alternativas(locale, caminho).languages },
      });
    }
  }

  return entradas;
}
