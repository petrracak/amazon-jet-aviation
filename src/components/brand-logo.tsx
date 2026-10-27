import Link from 'next/link';

import { cn } from '@/lib/utils';

const ALTURAS = { sm: 'h-6', md: 'h-7', lg: 'h-11' } as const;

/**
 * Marca da Amazon Jet, em vetor.
 *
 * `tom="branca"` é para fundo escuro, que é o caso do site inteiro e da
 * tela de login. `tom="auto"` troca sozinho conforme o tema do painel: a
 * versão escura no tema claro e a branca no escuro.
 *
 * As duas versões são renderizadas e uma é escondida por CSS, em vez de
 * escolher no JavaScript: assim não há troca visível depois que a página
 * carrega.
 */
export function BrandLogo({
  href,
  tamanho = 'md',
  tom = 'branca',
  className,
}: {
  href?: string;
  tamanho?: keyof typeof ALTURAS;
  tom?: 'branca' | 'auto';
  className?: string;
}) {
  const altura = cn('w-auto', ALTURAS[tamanho], className);

  const marca =
    tom === 'branca' ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/brand/logo-branca.svg" alt="Amazon Jet Aviation" className={altura} />
    ) : (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-escura.svg"
          alt="Amazon Jet Aviation"
          className={cn(altura, 'dark:hidden')}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-branca.svg"
          alt=""
          aria-hidden
          className={cn(altura, 'hidden dark:block')}
        />
      </>
    );

  if (!href) return marca;

  return (
    <Link href={href} aria-label="Amazon Jet Aviation" className="inline-flex shrink-0">
      {marca}
    </Link>
  );
}
