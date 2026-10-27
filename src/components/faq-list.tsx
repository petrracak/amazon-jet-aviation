import { useTranslations } from 'next-intl';
import { Plus } from '@phosphor-icons/react/dist/ssr';

import { cn } from '@/lib/utils';

/*
  <details>/<summary> nativo: abre e fecha sem JavaScript, já vem com o
  comportamento de teclado e de leitor de tela correto.
*/
export function FaqList({ limit, claro = false }: { limit?: number; claro?: boolean }) {
  const t = useTranslations('faq');
  const itens = t.raw('items') as { q: string; a: string }[];
  const mostrados = limit ? itens.slice(0, limit) : itens;

  return (
    <div className="grid gap-3">
      {mostrados.map((item) => (
        <details
          key={item.q}
          className={cn(
            'group rounded-lg border px-5 transition-colors',
            claro
              ? 'border-paper-2 bg-white hover:border-tag/60'
              : 'border-white/10 bg-white/[0.035] hover:border-white/25',
          )}
        >
          <summary className="flex cursor-pointer list-none items-start gap-4 py-4 font-display text-base leading-snug marker:hidden sm:text-lg">
            <span className={cn('flex-1', claro ? 'text-ink' : 'text-white')}>{item.q}</span>
            <span
              aria-hidden
              className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-tag/12 text-tag transition-transform duration-300 group-open:rotate-45"
            >
              <Plus size={16} weight="bold" />
            </span>
          </summary>
          <p
            className={cn(
              'measure pb-5 leading-relaxed',
              claro ? 'text-ink-soft' : 'text-mist-soft',
            )}
          >
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
