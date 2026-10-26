import { Download, FileText } from 'lucide-react';

import { QuoteCard, type Quote } from '@/components/admin/quote-card';
import { Cabecalho, Filtros, Pagina, Vazio, botao } from '@/components/admin/ui';
import { exigirPerfil } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Cotações' };

const FILTROS = [
  { chave: '', rotulo: 'Todas', href: '/admin/cotacoes' },
  { chave: 'aog', rotulo: 'AOG', href: '/admin/cotacoes?aog=1' },
  { chave: 'new', rotulo: 'Sem resposta', href: '/admin/cotacoes?status=new' },
  { chave: 'in_progress', rotulo: 'Em andamento', href: '/admin/cotacoes?status=in_progress' },
  { chave: 'quoted', rotulo: 'Proposta enviada', href: '/admin/cotacoes?status=quoted' },
  { chave: 'won', rotulo: 'Fechadas', href: '/admin/cotacoes?status=won' },
  { chave: 'lost', rotulo: 'Perdidas', href: '/admin/cotacoes?status=lost' },
];

type Params = Promise<Record<string, string | string[] | undefined>>;

export default async function Cotacoes({ searchParams }: { searchParams: Params }) {
  await exigirPerfil();
  const params = await searchParams;

  // searchParams é texto livre; a coluna só aceita estes valores.
  const VALIDOS = ['new', 'in_progress', 'quoted', 'won', 'lost'] as const;
  const bruto = typeof params.status === 'string' ? params.status : '';
  const status = (VALIDOS as readonly string[]).includes(bruto) ? bruto : '';
  const soAog = params.aog === '1';

  const supabase = await createClient();
  let q = supabase
    .from('quotes')
    .select('id, ref, name, phone, email, aircraft_model, is_aog, status, created_at');

  if (status) q = q.eq('status', status);
  if (soAog) q = q.eq('is_aog', true);

  const { data: cotacoes } = await q.order('created_at', { ascending: false }).limit(500);
  const total = cotacoes?.length ?? 0;
  const atual = soAog ? 'aog' : status;

  return (
    <Pagina largura="max-w-4xl">
      <Cabecalho
        titulo="Cotações"
        descricao={`${total} ${total === 1 ? 'pedido' : 'pedidos'}${atual ? ' neste filtro' : ''}`}
        acoes={
          total ? (
            // <a> de propósito: isto baixa um arquivo, não navega. Com Link,
            // o Next tentaria tratar a resposta como página.
            // eslint-disable-next-line @next/next/no-html-link-for-pages
            <a href="/admin/cotacoes/exportar" className={botao.secundario}>
              <Download className="size-5" strokeWidth={1.6} />
              Baixar CSV
            </a>
          ) : null
        }
      />

      <Filtros atual={atual} itens={FILTROS} />

      {total ? (
        <ul className="grid gap-3 lg:grid-cols-2">
          {cotacoes!.map((c) => (
            <QuoteCard key={c.id} cotacao={c as Quote} />
          ))}
        </ul>
      ) : (
        <Vazio
          icone={FileText}
          titulo={atual ? 'Nada neste filtro' : 'Nenhum pedido ainda'}
          texto={
            atual
              ? 'Escolha outro filtro para ver os demais pedidos.'
              : 'Quem pedir cotação pelo site aparece aqui, com as peças, o modelo da aeronave e o WhatsApp pronto.'
          }
        />
      )}
    </Pagina>
  );
}
