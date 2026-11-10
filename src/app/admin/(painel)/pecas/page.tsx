import { Bot, PackageSearch, SearchX } from 'lucide-react';

import { PartsImport } from '@/components/admin/parts-import';
import { Cabecalho, Cartao, Pagina, Selo, Vazio } from '@/components/admin/ui';
import { exigirPerfil } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Peças' };

type Falha = { term: string; term_norm: string; created_at: string };

export default async function Pecas() {
  await exigirPerfil();

  const supabase = await createClient();

  const [{ count: total }, { data: recentes }, { data: falhas }, { data: palpites }] =
    await Promise.all([
    supabase.from('parts').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('parts')
      .select('id, pn, name, manufacturer, category')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('part_search_misses')
      .select('term, term_norm, created_at')
      .order('created_at', { ascending: false })
      .limit(300),
    supabase
      .from('part_identifications')
      .select('pn_norm, pn, name, manufacturer, aircraft, created_at')
      .order('created_at', { ascending: false })
      .limit(25),
  ]);

  // Agrupar pelo part number sem pontuação: quem procurou "4004508-0001" e
  // quem procurou "40045080001" procurou a mesma coisa, e separados os dois
  // parecem menos procurados do que são.
  const procuradas = new Map<string, { termo: string; vezes: number; ultima: string }>();
  for (const f of (falhas ?? []) as Falha[]) {
    const atual = procuradas.get(f.term_norm);
    if (atual) atual.vezes += 1;
    else procuradas.set(f.term_norm, { termo: f.term, vezes: 1, ultima: f.created_at });
  }
  const maisProcuradas = [...procuradas.values()]
    .sort((a, b) => b.vezes - a.vezes || b.ultima.localeCompare(a.ultima))
    .slice(0, 20);

  return (
    <Pagina>
      <Cabecalho
        titulo="Peças"
        descricao="O catálogo que responde a busca do site. Quanto mais part number aqui, mais perguntas o site resolve sozinho."
        acoes={<Selo tom={total && total > 100 ? 'verde' : 'ambar'}>{total ?? 0} no catálogo</Selo>}
      />

      <PartsImport />

      <Cartao
        titulo="Procuradas e não encontradas"
        descricao="Part numbers que alguém buscou no site e o catálogo não soube responder. É a lista do que vale carregar primeiro."
      >
        {maisProcuradas.length === 0 ? (
          <Vazio
            icone={SearchX}
            titulo="Nada por aqui ainda"
            texto="Quando alguém buscar uma peça que não está no catálogo, o termo aparece nesta lista."
          />
        ) : (
          <ul className="divide-y divide-border-base">
            {maisProcuradas.map((p) => (
              <li key={p.termo} className="flex items-center gap-3 py-2.5 first:pt-0">
                <span className="min-w-0 flex-1 truncate font-mono text-sm">{p.termo}</span>
                <Selo tom={p.vezes > 1 ? 'ambar' : 'cinza'}>
                  {p.vezes}x
                </Selo>
              </li>
            ))}
          </ul>
        )}
      </Cartao>

      <Cartao
        titulo="O que o site respondeu sozinho"
        descricao="Quando o catálogo não tem a peça, o site identifica o part number pelo padrão do número e mostra como palpite, sem afirmar. A primeira resposta fica guardada para não variar. Vale conferir: o que estiver certo pode virar peça do catálogo."
      >
        {palpites && palpites.length > 0 ? (
          <ul className="divide-y divide-border-base">
            {palpites.map((p) => (
              <li key={p.pn_norm} className="py-2.5 first:pt-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono text-sm text-accent">{p.pn}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                  {p.manufacturer ? (
                    <span className="text-xs text-fg-muted">{p.manufacturer}</span>
                  ) : null}
                </div>
                {p.aircraft ? (
                  <p className="mt-0.5 truncate text-xs text-fg-muted">{p.aircraft}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <Vazio
            icone={Bot}
            titulo="Nenhuma identificação ainda"
            texto="Quando alguém buscar um part number que não está no catálogo, o palpite do site aparece aqui."
          />
        )}
      </Cartao>

      <Cartao
        titulo="Últimas carregadas"
        descricao="As dez peças mais recentes, só para conferir se o arquivo entrou como você esperava."
      >
        {recentes && recentes.length > 0 ? (
          <ul className="divide-y divide-border-base">
            {recentes.map((peca) => (
              <li key={peca.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 first:pt-0">
                <span className="font-mono text-sm text-accent">{peca.pn}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{peca.name}</span>
                {peca.manufacturer ? (
                  <span className="text-xs text-fg-muted">{peca.manufacturer}</span>
                ) : null}
                {peca.category ? <Selo tom="cinza">{peca.category}</Selo> : null}
              </li>
            ))}
          </ul>
        ) : (
          <Vazio
            icone={PackageSearch}
            titulo="Catálogo vazio"
            texto="Carregue um CSV acima e as peças aparecem aqui."
          />
        )}
      </Cartao>
    </Pagina>
  );
}
