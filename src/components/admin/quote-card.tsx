'use client';

import { ChevronDown, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { mudarStatusCotacao, type StatusCotacao } from '@/app/actions/quotes';
import { Selo } from '@/components/admin/ui';
import { cn, dataHora, whatsappLink } from '@/lib/utils';

export const OPCOES: {
  valor: StatusCotacao;
  rotulo: string;
  tom: 'ambar' | 'azul' | 'verde' | 'cinza';
}[] = [
  { valor: 'new', rotulo: 'Sem resposta', tom: 'ambar' },
  { valor: 'in_progress', rotulo: 'Em andamento', tom: 'azul' },
  { valor: 'quoted', rotulo: 'Proposta enviada', tom: 'azul' },
  { valor: 'won', rotulo: 'Fechada', tom: 'verde' },
  { valor: 'lost', rotulo: 'Perdida', tom: 'cinza' },
];

export type Quote = {
  id: string;
  ref: string;
  name: string;
  phone: string;
  email: string;
  aircraft_model: string;
  is_aog: boolean;
  status: StatusCotacao;
  created_at: string;
};

/** Mostra o número como a pessoa digitou, só limpando o que não é dígito. */
function formatarTelefone(bruto: string) {
  const d = bruto.replace(/\D/g, '');
  if (d.length === 11 && !d.startsWith('1')) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 13 && d.startsWith('55')) {
    return `+55 (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  }
  return bruto;
}

export function QuoteCard({ cotacao }: { cotacao: Quote }) {
  const router = useRouter();
  const [pendente, startTransition] = useTransition();
  const atual = OPCOES.find((o) => o.valor === cotacao.status) ?? OPCOES[0];

  const digitos = cotacao.phone.replace(/\D/g, '');

  return (
    <li
      className={cn(
        'min-w-0 rounded-2xl border bg-bg-elevated p-4 shadow-[var(--shadow-card)] transition-opacity',
        cotacao.is_aog ? 'border-aog/40' : 'border-border-base',
        pendente && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/cotacoes/${cotacao.id}`}
              className="truncate text-base font-medium hover:text-accent"
            >
              {cotacao.name}
            </Link>
            {cotacao.is_aog ? <Selo tom="vermelho">AOG</Selo> : null}
          </div>
          <p className="pn truncate text-sm text-fg-muted">
            {formatarTelefone(cotacao.phone)}
          </p>
          <p className="mt-0.5 truncate text-xs text-fg-subtle">
            <span className="pn">{cotacao.ref}</span> · {cotacao.aircraft_model}
          </p>
          <p className="truncate text-xs text-fg-subtle">{dataHora(cotacao.created_at)}</p>
        </div>

        {/* O selo é só desenho; o <select> transparente por cima recebe o
            toque e abre o seletor nativo do aparelho, em 16px. */}
        <label className="relative shrink-0">
          <Selo tom={atual.tom} className="min-h-8 pl-3 pr-2">
            {atual.rotulo}
            <ChevronDown className="size-3.5" strokeWidth={2} />
          </Selo>
          <select
            value={cotacao.status}
            disabled={pendente}
            onChange={(e) =>
              startTransition(async () => {
                await mudarStatusCotacao(cotacao.id, e.target.value as StatusCotacao);
                router.refresh();
              })
            }
            aria-label={`Situação da cotação de ${cotacao.name}`}
            className="absolute inset-0 size-full cursor-pointer text-base opacity-0"
          >
            {OPCOES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={whatsappLink(
            cotacao.phone,
            `Olá, ${cotacao.name.split(' ')[0]}! Aqui é da Amazon Jet Aviation, sobre a sua cotação ${cotacao.ref}.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#1a9f52] px-5 text-[0.9375rem] font-medium text-white transition-colors hover:bg-[#158a46] active:scale-[0.98]"
        >
          <MessageCircle className="size-5" strokeWidth={1.8} />
          Chamar no WhatsApp
        </a>
        <a
          href={`tel:+${digitos}`}
          aria-label={`Ligar para ${cotacao.name}`}
          className="grid size-12 shrink-0 place-items-center rounded-full border border-border-strong text-fg transition-colors hover:border-accent hover:text-accent active:scale-95"
        >
          <Phone className="size-5" strokeWidth={1.7} />
        </a>
      </div>
    </li>
  );
}
