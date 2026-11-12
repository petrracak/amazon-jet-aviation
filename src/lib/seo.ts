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

export const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lp.amazonjetaviation.com'
).replace(/\/+$/, '');

/** Caminhos fixos do site, sem o prefixo de idioma. */
export const PAGINAS = ['', '/cotacao', '/blog', '/faq'] as const;

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

/**
 * Open Graph e Twitter de uma página.
 *
 * Sem isto, link compartilhado no WhatsApp ou no LinkedIn aparece como
 * texto cru — e a primeira impressão de quem recebe a indicação é a de um
 * site que não foi terminado.
 */
export function compartilhamento({
  locale,
  titulo,
  descricao,
  caminho = '',
  imagem = '/og.jpg',
  tipo = 'website',
}: {
  locale: string;
  titulo: string;
  descricao?: string;
  caminho?: string;
  imagem?: string;
  tipo?: 'website' | 'article';
}) {
  const url = alternativas(locale, caminho).canonical;
  const idiomas: Record<string, string> = { pt: 'pt_BR', en: 'en_US', es: 'es_ES' };

  return {
    openGraph: {
      type: tipo,
      url,
      siteName: 'Amazon Jet Aviation',
      title: titulo,
      description: descricao,
      locale: idiomas[locale] ?? 'pt_BR',
      images: [{ url: imagem, width: 1200, height: 630, alt: 'Amazon Jet Aviation' }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: titulo,
      description: descricao,
      images: [imagem],
    },
  };
}

/**
 * A empresa, em dados que uma máquina consegue afirmar.
 *
 * Serve para dois leitores ao mesmo tempo. O buscador usa para montar o
 * cartão de conhecimento; o assistente de IA usa para ter certeza de quem
 * é a empresa, onde fica e o que faz antes de citá-la a alguém. Adjetivo
 * não ajuda nenhum dos dois — fato declarado, sim.
 */
export function organizacao(contato: {
  email: string;
  telefone_exibicao: string;
  instagram: string;
  endereco_miami: string;
  endereco_deerfield: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE}/#organizacao`,
    name: 'Amazon Jet Aviation',
    url: BASE,
    logo: `${BASE}/brand/logo-escura.svg`,
    image: `${BASE}/og.jpg`,
    description:
      'Sourcing e fornecimento de peças e componentes aeronáuticos dos Estados Unidos ' +
      'para o Brasil: novas, overhauled, repaired e serviceable, com atendimento AOG.',
    email: contato.email,
    telephone: contato.telefone_exibicao,
    sameAs: [contato.instagram].filter(Boolean),
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: '200 S Biscayne Blvd, Suite 20-107',
        addressLocality: 'Miami',
        addressRegion: 'FL',
        postalCode: '33131',
        addressCountry: 'US',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: '455 Fairway Drive, Suite 214',
        addressLocality: 'Deerfield Beach',
        addressRegion: 'FL',
        postalCode: '33441',
        addressCountry: 'US',
      },
    ],
    areaServed: [
      { '@type': 'Country', name: 'Brasil' },
      { '@type': 'Country', name: 'Estados Unidos' },
    ],
    knowsLanguage: ['pt-BR', 'en', 'es'],
    knowsAbout: [
      'Peças aeronáuticas',
      'Aircraft parts sourcing',
      'AOG - Aircraft on Ground',
      'Importação de peças de aviação',
      'Componentes new, overhauled, repaired e serviceable',
    ],
  };
}

/** O site em si, para o buscador entender a estrutura e os idiomas. */
export function website() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE}/#site`,
    url: BASE,
    name: 'Amazon Jet Aviation',
    inLanguage: ['pt-BR', 'en', 'es'],
    publisher: { '@id': `${BASE}/#organizacao` },
  };
}
