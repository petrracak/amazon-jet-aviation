import type { ReactNode } from 'react';

import { Reveal } from '@/components/reveal';
import { cn } from '@/lib/utils';

/**
 * Tom da seção. O site é escuro por base; `paper` é o respiro claro que
 * entra nas seções de leitura densa, para a página não virar um paredão.
 */
type Tom = 'night' | 'night-2' | 'paper';

const TONS: Record<Tom, string> = {
  night: 'bg-night text-mist',
  'night-2': 'bg-night-2 text-mist',
  paper: 'bg-paper text-ink',
};

export function Section({
  id,
  tom = 'night',
  className = '',
  children,
}: {
  id?: string;
  tom?: Tom;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn('relative', TONS[tom], className)}>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">{children}</div>
    </section>
  );
}

export function SectionTitle({
  children,
  className = '',
  claro = false,
}: {
  children: ReactNode;
  className?: string;
  /** true quando a seção é clara: o título vira tinta. */
  claro?: boolean;
}) {
  return (
    <h2
      className={cn(
        'font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.12]',
        claro ? 'text-ink' : 'text-white',
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** Etiqueta de seção, no lugar do rótulo em caixa alta espaçada. */
export function Etiqueta({
  children,
  claro = false,
}: {
  children: ReactNode;
  claro?: boolean;
}) {
  return <p className={cn('tag', claro && 'tag-ink')}>{children}</p>;
}

export { Reveal };
