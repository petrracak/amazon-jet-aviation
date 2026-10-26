import { exigirPerfil } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/** Escapa para CSV e neutraliza fórmulas (=, +, -, @) que o Excel executaria. */
function celula(valor: unknown) {
  const texto = valor == null ? '' : String(valor);
  const seguro = /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto;
  return `"${seguro.replace(/"/g, '""')}"`;
}

const SITUACAO: Record<string, string> = {
  new: 'Sem resposta',
  in_progress: 'Em andamento',
  quoted: 'Proposta enviada',
  won: 'Fechada',
  lost: 'Perdida',
};

export async function GET() {
  await exigirPerfil();

  const supabase = await createClient();
  const { data: cotacoes } = await supabase
    .from('quotes')
    .select(
      'ref, name, email, phone, company, aircraft_model, part_condition, destination, is_aog, status, notes, created_at, itens:quote_items (pn, quantity)',
    )
    .order('created_at', { ascending: false });

  const cabecalho = [
    'Referência',
    'Nome',
    'E-mail',
    'Telefone',
    'Empresa',
    'Aeronave',
    'Condição',
    'Destino',
    'AOG',
    'Situação',
    'Peças',
    'Observações',
    'Recebido em',
  ];

  const linhas = (cotacoes ?? []).map((c) => {
    const itens = (c.itens ?? []) as { pn: string; quantity: number }[];
    return [
      c.ref,
      c.name,
      c.email,
      c.phone,
      c.company,
      c.aircraft_model,
      c.part_condition,
      c.destination,
      c.is_aog ? 'Sim' : 'Não',
      SITUACAO[c.status] ?? c.status,
      itens.map((i) => `${i.pn} (${i.quantity}x)`).join(' | '),
      c.notes,
      new Date(c.created_at).toLocaleString('pt-BR'),
    ]
      .map(celula)
      .join(';');
  });

  // BOM: sem ele o Excel no Windows abre os acentos errados.
  const csv = '﻿' + [cabecalho.map(celula).join(';'), ...linhas].join('\r\n');
  const hoje = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="cotacoes-amazonjet-${hoje}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
