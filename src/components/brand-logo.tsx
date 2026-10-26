import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const ALTURAS = { sm: 'h-6', md: 'h-7', lg: 'h-11' } as const;

/**
 * A única arte que a marca tem hoje é o wordmark branco em PNG. Em fundo
 * claro ele some, então invertemos: branco puro vira preto. Quando o cliente
 * mandar o vetor com as duas versões, isto some daqui.
 */
export function BrandLogo({
  href,
  tamanho = 'md',
  inverterNoClaro = false,
  className,
}: {
  href?: string;
  tamanho?: keyof typeof ALTURAS;
  inverterNoClaro?: boolean;
  className?: string;
}) {
  const img = (
    <Image
      src="/brand/logo-wordmark-white.png"
      alt="Amazon Jet Aviation"
      width={320}
      height={89}
      priority
      className={cn(
        'w-auto',
        ALTURAS[tamanho],
        inverterNoClaro && 'invert dark:invert-0',
        className,
      )}
    />
  );

  if (!href) return img;

  return (
    <Link href={href} aria-label="Amazon Jet Aviation" className="inline-flex shrink-0">
      {img}
    </Link>
  );
}
