'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Identificação de part number, para quando o catálogo não tem a peça.
 *
 * Quem responde é o mesmo worker que o site antigo já usava, na conta da
 * Cloudflare da própria empresa: a capacidade já existe e já está paga.
 *
 * Duas diferenças em relação ao site antigo, e as duas importam.
 *
 * A primeira é que a resposta fica guardada. O modelo não é estável — no
 * teste, o mesmo 4004508-0001 voltou ora como filtro de combustível de
 * 737, ora como conjunto de freio de Bonanza, e a resposta errada veio com
 * a confiança mais alta. Guardando a primeira, pelo menos o site diz
 * sempre a mesma coisa, e a equipe vê no painel o que ele andou dizendo.
 *
 * A segunda é que o número de confiança não é exibido. Ele é o modelo
 * opinando sobre si mesmo, e não acompanha o acerto. Aqui ele só serve de
 * corte: palpite fraco não vira sugestão na tela.
 */

export type Identificacao = {
  pn: string;
  name: string;
  manufacturer: string | null;
  category: string | null;
  aircraft: string | null;
};

const WORKER = 'https://super-violet-3308amazon-jet-ai.amazonjetaviation.workers.dev/';

/** Abaixo disso o palpite não aparece para o visitante. */
const CORTE = 50;

const TEMPO_LIMITE = 9000;

const texto = (v: unknown, max: number) =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;

export async function identificarPn(termo: string): Promise<Identificacao | null> {
  const pn = (termo ?? '').trim();
  // Descrição em palavras não é part number: mandar "bomba hidráulica"
  // para o identificador só rende palpite solto.
  if (pn.length < 3 || pn.length > 60 || !/\d/.test(pn)) return null;

  const supabase = await createClient();

  const { data: guardada } = await supabase.rpc('identificacao_guardada', { p_pn_norm: pn });
  const achada = Array.isArray(guardada) ? guardada[0] : null;
  if (achada?.name) {
    return {
      pn: achada.pn,
      name: achada.name,
      manufacturer: achada.manufacturer ?? null,
      category: achada.category ?? null,
      aircraft: achada.aircraft ?? null,
    };
  }

  let bruto: Record<string, unknown>;
  try {
    const resposta = await fetch(WORKER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partNumber: pn }),
      signal: AbortSignal.timeout(TEMPO_LIMITE),
    });
    if (!resposta.ok) return null;
    bruto = (await resposta.json()) as Record<string, unknown>;
  } catch {
    // Identificação é um extra: se falhar, a busca segue oferecendo a
    // cotação do part number digitado, que é o que importa.
    return null;
  }

  const confianca = typeof bruto.confidence === 'number' ? bruto.confidence : 0;
  const nome = texto(bruto.name, 200);
  if (bruto.found !== true || !nome || confianca < CORTE) return null;

  const identificacao: Identificacao = {
    pn: texto(bruto.pn, 80) ?? pn,
    name: nome,
    manufacturer: texto(bruto.mfr, 160),
    category: texto(bruto.cat, 80),
    aircraft: texto(bruto.aircraft, 200),
  };

  await supabase.rpc('guardar_identificacao', {
    p_pn: identificacao.pn,
    p_name: identificacao.name,
    p_manufacturer: identificacao.manufacturer,
    p_category: identificacao.category,
    p_aircraft: identificacao.aircraft,
    p_confidence: confianca,
  });

  return identificacao;
}
