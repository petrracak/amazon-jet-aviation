import { MessageCircle } from 'lucide-react';
import { notFound } from 'next/navigation';

import { Cabecalho, Cartao, Pagina, Selo, botao } from '@/components/admin/ui';
import { OPCOES } from '@/components/admin/quote-card';
import { exigirPerfil } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { dataHora, whatsappLink } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const CONDICAO: Record<string, string> = {
  new: 'Nova',
  overhauled: 'Overhauled',
  repaired: 'Repaired',
  serviceable: 'Serviceable',
  any: 'Qualquer condição',
};

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3">
      <dt className="shrink-0 text-sm text-fg-muted">{rotulo}</dt>
      <dd className="min-w-0 break-words text-right">{children}</dd>
    </div>
  );
}

export default async function Cotacao({ params }: { params: Promise<{ id: string }> }) {
  await exigirPerfil();
  const { id } = await params;

  const supabase = await createClient();
  const { data: cotacao } = await supabase
    .from('quotes')
    .select('*, itens:quote_items (id, pn, name, quantity, is_manual)')
    .eq('id', id)
    .maybeSingle();

  if (!cotacao) notFound();

  const situacao = OPCOES.find((o) => o.valor === cotacao.status) ?? OPCOES[0];
  const itens = (cotacao.itens ?? []) as {
    id: string;
    pn: string;
    name: string | null;
    quantity: number;
    is_manual: boolean;
  }[];

  return (
    <Pagina largura="max-w-3xl">
      <Cabecalho
        voltar={{ href: '/admin/cotacoes', rotulo: 'Cotações' }}
        titulo={cotacao.name}
        descricao={
          <span className="flex flex-wrap items-center gap-2">
            <span className="pn">{cotacao.ref}</span>
            <Selo tom={situacao.tom}>{situacao.rotulo}</Selo>
            {cotacao.is_aog ? <Selo tom="vermelho">AOG</Selo> : null}
          </span>
        }
        acoes={
          <a
            href={whatsappLink(
              cotacao.phone,
              `Olá, ${cotacao.name.split(' ')[0]}! Aqui é da Amazon Jet Aviation, sobre a sua cotação ${cotacao.ref}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={botao.primario}
          >
            <MessageCircle className="size-5" strokeWidth={1.8} />
            WhatsApp
          </a>
        }
      />

      <Cartao titulo="Peças pedidas" descricao={`${itens.length} ${itens.length === 1 ? 'item' : 'itens'}`}>
        {itens.length ? (
          <ul className="divide-y divide-border-base">
            {itens.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <span className="pn w-36 shrink-0 font-medium">{item.pn}</span>
                <span className="min-w-0 flex-1 text-sm">
                  {item.name ?? '—'}
                  {item.is_manual ? (
                    <span className="mt-0.5 block text-xs text-fg-subtle">
                      Fora do catálogo, digitado pela pessoa
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-sm text-fg-muted">{item.quantity}x</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fg-muted">
            Nenhuma peça na lista. O pedido veio só com as observações abaixo.
          </p>
        )}
      </Cartao>

      <Cartao titulo="Quem pediu">
        <dl className="divide-y divide-border-base">
          <Linha rotulo="E-mail">
            <a href={`mailto:${cotacao.email}`} className="text-accent underline-offset-4 hover:underline">
              {cotacao.email}
            </a>
          </Linha>
          <Linha rotulo="Telefone">
            <span className="pn">{cotacao.phone}</span>
          </Linha>
          {cotacao.company ? <Linha rotulo="Empresa">{cotacao.company}</Linha> : null}
          <Linha rotulo="Aeronave">{cotacao.aircraft_model}</Linha>
          <Linha rotulo="Condição">{CONDICAO[cotacao.part_condition] ?? cotacao.part_condition}</Linha>
          {cotacao.destination ? <Linha rotulo="Destino">{cotacao.destination}</Linha> : null}
          <Linha rotulo="Recebido em">
            <span className="pn">{dataHora(cotacao.created_at)}</span>
          </Linha>
        </dl>
      </Cartao>

      {cotacao.notes ? (
        <Cartao titulo="Observações">
          <p className="whitespace-pre-wrap text-pretty leading-relaxed">{cotacao.notes}</p>
        </Cartao>
      ) : null}
    </Pagina>
  );
}
