import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/**
 * Endereços dos textos no WordPress antigo. Sem isto, todo link já
 * compartilhado desses artigos cairia em 404 depois da virada.
 */
const LEGADO: Record<string, string> = {
  '/voltaaomundo': '/blog/voltaaomundo',
  '/a-importancia-da-revisao-periodica-em-motores-turboelice':
    '/blog/a-importancia-da-revisao-periodica-em-motores-turboelice',
  '/amazon-jet-expande-rede-de-distribuicao-nos-estados-unidos-com-hub-na-florida':
    '/blog/amazon-jet-expande-rede-de-distribuicao-nos-estados-unidos-com-hub-na-florida',
  '/como-superar-os-desafios-de-importacao-de-pecas-aog-no-brasil':
    '/blog/como-superar-os-desafios-de-importacao-de-pecas-aog-no-brasil',
  '/teste': '/blog/o-que-verificar-ao-comprar-pecas-revisadas',
};

const nextConfig: NextConfig = {
  images: {
    /*
      Sem o otimizador da Vercel: a cota da conta está esgotada e ele passou
      a devolver 402, o que quebrava toda imagem do site. Servimos os
      arquivos como estão — por isso eles entram no repositório já
      redimensionados e comprimidos.

      Para voltar a otimizar, basta remover esta linha depois de resolver a
      cota no plano da Vercel.
    */
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'avvaovmpuoojoiodinow.supabase.co' },
    ],
  },
  async redirects() {
    return Object.entries(LEGADO).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default withNextIntl(nextConfig);
