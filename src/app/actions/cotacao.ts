'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * O envio do formulário público de cotação.
 *
 * A gravação é uma função do banco (`criar_cotacao`), não dois inserts
 * daqui: o visitante é anônimo e anônimo não lê a tabela, então só a função
 * consegue devolver a referência da cotação — e ela garante que cotação e
 * itens entrem juntos ou não entrem.
 *
 * A validação é refeita aqui, depois de já existir no formulário, porque
 * nada do que chega do navegador é confiável.
 */

export type ItemCotacao = {
  pn: string;
  name: string | null;
  quantity: number;
  partId: string | null;
  isManual: boolean;
};

export type DadosCotacao = {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  aeronave: string;
  condicao: string;
  destino: string;
  observacoes: string;
  aog: boolean;
  locale: string;
  origem: string;
  itens: ItemCotacao[];
};

export type RespostaCotacao =
  | { ok: true; ref: string }
  | { ok: false; erro: 'campos' | 'itens' | 'envio' };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function enviarCotacao(dados: DadosCotacao): Promise<RespostaCotacao> {
  const nome = dados.nome?.trim() ?? '';
  const email = dados.email?.trim() ?? '';
  const telefone = dados.telefone?.trim() ?? '';
  const aeronave = dados.aeronave?.trim() ?? '';

  if (!nome || !EMAIL.test(email) || telefone.length < 6 || !aeronave) {
    return { ok: false, erro: 'campos' };
  }

  const itens = (Array.isArray(dados.itens) ? dados.itens : [])
    .filter((item) => item?.pn?.trim())
    .slice(0, 40)
    .map((item) => ({
      pn: item.pn.trim(),
      name: item.name?.trim() || null,
      quantity: Number.isFinite(item.quantity) ? Math.round(item.quantity) : 1,
      partId: item.partId || null,
      isManual: Boolean(item.isManual),
    }));

  if (itens.length === 0) return { ok: false, erro: 'itens' };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('criar_cotacao', {
    p_name: nome,
    p_email: email,
    p_phone: telefone,
    p_company: dados.empresa?.trim() || null,
    p_aircraft_model: aeronave,
    p_part_condition: dados.condicao || 'any',
    p_destination: dados.destino?.trim() || null,
    p_notes: dados.observacoes?.trim() || null,
    p_is_aog: Boolean(dados.aog),
    p_locale: dados.locale,
    p_source: { origem: dados.origem || 'direto' },
    p_items: itens,
  });

  if (error || typeof data !== 'string') {
    console.error('cotação não gravada', error);
    return { ok: false, erro: 'envio' };
  }

  return { ok: true, ref: data };
}
