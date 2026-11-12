import type { MetadataRoute } from 'next';

import { BASE } from '@/lib/seo';

/**
 * O robots.txt.
 *
 * Os robôs de IA entram liberados de propósito. A empresa quer ser citada
 * quando alguém pergunta a um assistente onde comprar peça aeronáutica nos
 * Estados Unidos — e assistente só cita o que leu. Bloqueá-los seria
 * escolher sair do mapa justamente onde a busca está indo parar.
 *
 * O painel fica de fora: é área de login, não tem o que indexar, e páginas
 * de administração em resultado de busca só rendem tentativa de invasão.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/auth', '/api'],
      },
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-User',
          'anthropic-ai',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
          'meta-externalagent',
        ],
        allow: '/',
        disallow: ['/admin', '/auth', '/api'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
