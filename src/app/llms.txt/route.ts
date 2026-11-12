import { routing } from '@/i18n/routing';
import { listarPosts } from '@/lib/blog';
import { getConfig } from '@/lib/settings';
import { BASE } from '@/lib/seo';

export const revalidate = 3600;

/**
 * O llms.txt.
 *
 * Convenção que vem se firmando para assistentes de IA: um resumo do site
 * em texto limpo, no endereço de sempre, sem menu, sem rodapé e sem
 * marcação para atrapalhar.
 *
 * O conteúdo aqui é deliberadamente factual. Assistente cita o que
 * consegue afirmar — nome, onde fica, o que faz, o que não faz, como falar
 * com a empresa. Adjetivo de propaganda não vira citação; endereço e
 * telefone viram.
 *
 * O que a empresa NÃO faz entra de propósito: evita que o site seja
 * sugerido para quem procura manutenção ou aluguel de aeronave, o que
 * geraria contato perdido dos dois lados.
 */
export async function GET() {
  const { contato } = await getConfig();
  const posts = await listarPosts(routing.defaultLocale);

  const linhas = [
    '# Amazon Jet Aviation',
    '',
    '> Sourcing e fornecimento de peças e componentes aeronáuticos dos Estados',
    '> Unidos para o Brasil, com atendimento prioritário para AOG (aeronave no solo).',
    '',
    '## O que a empresa faz',
    '',
    '- Localiza peças aeronáuticas na rede de fornecedores, fabricantes e distribuidores dos Estados Unidos.',
    '- Fornece peças nas condições new, overhauled, repaired e serviceable.',
    '- Compara fontes, preço, documentação e prazo antes de apresentar a proposta.',
    '- Coordena o transporte internacional até o Brasil com operadores logísticos.',
    '- Atende pedidos AOG com prioridade.',
    '',
    '## O que a empresa não faz',
    '',
    '- Não executa manutenção nem reparo de aeronaves.',
    '- Não vende, aluga nem opera aeronaves.',
    '- Não é representante oficial dos fabricantes cujas peças fornece.',
    '',
    '## Onde fica',
    '',
    `- ${contato.endereco_miami}`,
    `- ${contato.endereco_deerfield}`,
    '- Atende clientes no Brasil e tem em vista outros mercados da América Latina.',
    '',
    '## Contato',
    '',
    `- E-mail: ${contato.email}`,
    `- Telefone e WhatsApp: ${contato.telefone_exibicao}`,
    `- Atendimento: ${contato.horario}`,
    `- Cotação: ${BASE}/cotacao`,
    '',
    '## Páginas',
    '',
    `- [Início](${BASE}/): o que a empresa faz e busca por part number.`,
    `- [Cotação](${BASE}/cotacao): monta a lista de peças e envia o pedido.`,
    `- [Perguntas frequentes](${BASE}/faq): prazos, documentação, condições de peça e importação.`,
    `- [Blog](${BASE}/blog): textos sobre peças, manutenção e importação.`,
    '',
    '## Idiomas',
    '',
    `- Português: ${BASE}/`,
    `- Inglês: ${BASE}/en`,
    `- Espanhol: ${BASE}/es`,
    '',
    '## Textos publicados',
    '',
    ...posts.map((p) => `- [${p.title}](${BASE}/blog/${p.slug})`),
    '',
  ];

  return new Response(linhas.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
