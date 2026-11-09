'use server';

import { revalidatePath } from 'next/cache';

import { exigirPerfil } from '@/lib/auth';
import { lerCsv, mapearColunas } from '@/lib/csv';
import { createClient } from '@/lib/supabase/server';

/**
 * A carga do catálogo de peças por planilha.
 *
 * O catálogo é o coração da busca do site, e ninguém vai digitar milhares
 * de part numbers numa tela. O caminho realista é a exportação que a
 * empresa já tem — do ERP, do fornecedor, de uma planilha de cotações
 * antigas — e isso chega como CSV.
 *
 * A gravação é `upsert` pelo part number: rodar o mesmo arquivo duas vezes
 * não duplica nada, e mandar o arquivo novo do fornecedor atualiza o que
 * mudou. Assim a carga pode ser repetida sem medo, que é o que faz dela
 * uma rotina em vez de um evento.
 */

export type RelatorioImportacao = {
  ok: boolean;
  lidas: number;
  gravadas: number;
  ignoradas: number;
  erros: string[];
};

const limite = (v: string | undefined, max: number) => {
  const t = (v ?? '').trim();
  return t ? t.slice(0, max) : null;
};

export async function importarPecas(csv: string): Promise<RelatorioImportacao> {
  await exigirPerfil();

  const erros: string[] = [];
  const linhas = lerCsv(csv ?? '');

  if (linhas.length < 2) {
    return {
      ok: false,
      lidas: 0,
      gravadas: 0,
      ignoradas: 0,
      erros: ['O arquivo precisa de uma linha de cabeçalho e pelo menos uma peça.'],
    };
  }

  const onde = mapearColunas(linhas[0]);

  if (onde.pn === undefined) {
    return {
      ok: false,
      lidas: 0,
      gravadas: 0,
      ignoradas: 0,
      erros: [
        `Não achei a coluna do part number. O cabeçalho veio como: ${linhas[0].join(' | ')}. ` +
          'Renomeie a coluna para "pn" ou "part number".',
      ],
    };
  }

  // Part number repetido dentro do próprio arquivo: fica o último, e o
  // upsert do Postgres recusaria o lote inteiro se os dois fossem juntos.
  const porPn = new Map<string, Record<string, string | null>>();
  let ignoradas = 0;

  for (let i = 1; i < linhas.length; i += 1) {
    const l = linhas[i];
    const pn = limite(l[onde.pn], 80);

    if (!pn) {
      ignoradas += 1;
      continue;
    }

    porPn.set(pn.toUpperCase(), {
      pn,
      name: limite(onde.name !== undefined ? l[onde.name] : undefined, 200) ?? pn,
      description: limite(onde.description !== undefined ? l[onde.description] : undefined, 1000),
      manufacturer: limite(onde.manufacturer !== undefined ? l[onde.manufacturer] : undefined, 120),
      category: limite(onde.category !== undefined ? l[onde.category] : undefined, 80),
    });
  }

  const pecas = [...porPn.values()];
  if (pecas.length === 0) {
    return { ok: false, lidas: 0, gravadas: 0, ignoradas, erros: ['Nenhuma linha tinha part number.'] };
  }

  const supabase = await createClient();
  let gravadas = 0;

  // Lotes de 500: arquivo de fornecedor passa fácil de dez mil linhas, e
  // mandar tudo num POST só estoura o limite da requisição.
  for (let i = 0; i < pecas.length; i += 500) {
    const lote = pecas.slice(i, i + 500);
    const { error } = await supabase.from('parts').upsert(lote, { onConflict: 'pn' });

    if (error) {
      erros.push(`Linhas ${i + 2} a ${i + lote.length + 1}: ${error.message}`);
      continue;
    }
    gravadas += lote.length;
  }

  revalidatePath('/admin/pecas');

  return { ok: gravadas > 0, lidas: pecas.length, gravadas, ignoradas, erros };
}

export async function alternarPeca(id: string, ativa: boolean) {
  await exigirPerfil();
  const supabase = await createClient();
  const { error } = await supabase.from('parts').update({ is_active: ativa }).eq('id', id);
  revalidatePath('/admin/pecas');
  return { ok: !error, mensagem: error ? 'Não consegui mudar agora.' : '' };
}
