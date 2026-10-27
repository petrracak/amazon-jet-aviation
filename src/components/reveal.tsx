'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Entrada da seção quando ela chega à tela: sobe um pouco e aparece.
 *
 * Observa uma vez e desliga. Quem pediu menos movimento no sistema já é
 * atendido pelo `prefers-reduced-motion` no CSS, que zera a transição.
 */
export function Reveal({
  children,
  className,
  atraso = 0,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  /** Atraso em milissegundos, para escalonar itens de uma lista. */
  atraso?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setVisivel(true);
        observer.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={atraso ? { transitionDelay: `${atraso}ms` } : undefined}
      className={cn('reveal', visivel && 'reveal-in', className)}
    >
      {children}
    </Tag>
  );
}
