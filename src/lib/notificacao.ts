import 'server-only';

/**
 * O aviso de cotação nova no WhatsApp da equipe.
 *
 * Dois caminhos, porque os dois existem no mundo real e a escolha é de
 * quem opera:
 *
 * - `meta`: a API oficial da Meta (WhatsApp Cloud API). Mensagem que parte
 *   da empresa precisa de um modelo aprovado por eles, daí o template e os
 *   parâmetros numerados. É o caminho que não corre risco de bloqueio.
 * - `webhook`: um POST com `{ phone, message }` para a URL que for. É o
 *   formato do Z-API e serve de ponte para Make, n8n e afins. Mais simples
 *   de ligar, e a responsabilidade pelo número é de quem contrata.
 *
 * Nada aqui pode derrubar o envio da cotação: a cotação já está gravada
 * quando esta função roda. Falha de aviso vira log, nunca erro na tela de
 * quem pediu — o pedido está salvo de qualquer jeito, e o painel mostra.
 */

export type AvisoCotacao = {
  ref: string;
  nome: string;
  empresa: string | null;
  email: string;
  telefone: string;
  aeronave: string;
  destino: string | null;
  aog: boolean;
  itens: { pn: string; quantity: number }[];
};

const TEMPO_LIMITE = 8000;

/** Só dígitos: é como a Meta e os gateways esperam o número. */
const soDigitos = (n: string) => n.replace(/\D/g, '');

function destinos() {
  return (process.env.WHATSAPP_DESTINOS ?? '')
    .split(',')
    .map((n) => soDigitos(n))
    .filter((n) => n.length >= 10);
}

export async function avisarCotacao(aviso: AvisoCotacao) {
  // Por padrão só AOG apita. Quem quiser todas troca para 'todas'.
  const quando = process.env.WHATSAPP_NOTIFICAR ?? 'aog';
  if (quando !== 'todas' && !aviso.aog) return;

  const para = destinos();
  if (para.length === 0) {
    console.info('aviso de cotação não enviado: WHATSAPP_DESTINOS vazio');
    return;
  }

  const driver =
    process.env.WHATSAPP_DRIVER ??
    (process.env.WHATSAPP_TOKEN ? 'meta' : process.env.WHATSAPP_WEBHOOK_URL ? 'webhook' : '');

  try {
    if (driver === 'meta') await porMeta(para, aviso);
    else if (driver === 'webhook') await porWebhook(para, aviso);
    else console.info('aviso de cotação não enviado: nenhum caminho configurado');
  } catch (erro) {
    console.error('aviso de cotação falhou', erro);
  }
}

/* --------------------------------------------------------- o que vai */

const pecas = (aviso: AvisoCotacao) =>
  aviso.itens.map((i) => `${i.quantity}x ${i.pn}`).join(', ') || '—';

const dequem = (aviso: AvisoCotacao) =>
  aviso.empresa ? `${aviso.nome} (${aviso.empresa})` : aviso.nome;

/** Texto corrido, para o caminho do webhook. */
function texto(aviso: AvisoCotacao) {
  const painel = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/cotacoes`;
  return [
    aviso.aog ? '*AOG — AERONAVE NO SOLO*' : '*Nova cotação*',
    `Ref. ${aviso.ref}`,
    `De: ${dequem(aviso)}`,
    `Aeronave: ${aviso.aeronave}`,
    `Peças: ${pecas(aviso)}`,
    aviso.destino ? `Destino: ${aviso.destino}` : null,
    `Contato: ${aviso.telefone} | ${aviso.email}`,
    painel.startsWith('http') ? painel : null,
  ]
    .filter(Boolean)
    .join('\n');
}

/* ------------------------------------------------- API oficial da Meta */

async function porMeta(para: string[], aviso: AvisoCotacao) {
  const token = process.env.WHATSAPP_TOKEN;
  const telefoneId = process.env.WHATSAPP_PHONE_ID;
  const modelo = process.env.WHATSAPP_TEMPLATE ?? 'nova_cotacao';
  const idioma = process.env.WHATSAPP_TEMPLATE_IDIOMA ?? 'pt_BR';

  if (!token || !telefoneId) {
    console.info('aviso de cotação não enviado: faltam WHATSAPP_TOKEN/PHONE_ID');
    return;
  }

  // Parâmetro de modelo não aceita quebra de linha: cada um é uma linha só,
  // e o desenho da mensagem mora no modelo aprovado, não aqui.
  const parametros = [
    aviso.aog ? 'AOG - AERONAVE NO SOLO' : 'Nova cotacao',
    aviso.ref,
    dequem(aviso),
    aviso.aeronave,
    pecas(aviso),
    `${aviso.telefone} | ${aviso.email}`,
  ].map((text) => ({ type: 'text', text: text.slice(0, 900) }));

  await Promise.all(
    para.map(async (numero) => {
      const resposta = await fetch(
        `https://graph.facebook.com/v21.0/${telefoneId}/messages`,
        {
          method: 'POST',
          signal: AbortSignal.timeout(TEMPO_LIMITE),
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: numero,
            type: 'template',
            template: {
              name: modelo,
              language: { code: idioma },
              components: [{ type: 'body', parameters: parametros }],
            },
          }),
        },
      );

      if (!resposta.ok) {
        console.error(
          `aviso de cotação recusado pela Meta (${resposta.status})`,
          await resposta.text(),
        );
      }
    }),
  );
}

/* ------------------------------------------------- gateway por webhook */

async function porWebhook(para: string[], aviso: AvisoCotacao) {
  const url = process.env.WHATSAPP_WEBHOOK_URL;
  if (!url) return;

  const mensagem = texto(aviso);
  const cabecalhos: Record<string, string> = { 'Content-Type': 'application/json' };

  // Alguns gateways pedem o token no cabeçalho, outros já o trazem na URL.
  const token = process.env.WHATSAPP_WEBHOOK_TOKEN;
  if (token) cabecalhos[process.env.WHATSAPP_WEBHOOK_HEADER ?? 'Client-Token'] = token;

  await Promise.all(
    para.map(async (phone) => {
      const resposta = await fetch(url, {
        method: 'POST',
        signal: AbortSignal.timeout(TEMPO_LIMITE),
        headers: cabecalhos,
        body: JSON.stringify({ phone, message: mensagem }),
      });

      if (!resposta.ok) {
        console.error(
          `aviso de cotação recusado pelo gateway (${resposta.status})`,
          await resposta.text(),
        );
      }
    }),
  );
}
