'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lightning, WhatsappLogo } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';

/**
 * Ações que seguem a pessoa pela página.
 *
 * O WhatsApp fica no canto inferior direito, em todas as telas. O AOG só
 * aparece no celular, onde o botão do topo já saiu de vista — e fica à
 * esquerda, para não disputar o mesmo canto. Os dois só entram depois da
 * primeira dobra, senão competem com os botões do hero.
 *
 * Os dois são compactos de propósito. Botão flutuante fica por cima do que
 * a página tem a dizer, e a versão anterior do AOG era larga o bastante
 * para cobrir o botão de uma seção inteira enquanto se rolava. Ícone mais
 * a sigla basta: quem está com aeronave no solo reconhece "AOG".
 *
 * A margem de baixo respeita a área segura do iPhone, senão os dois ficam
 * debaixo da barra de gestos.
 */
export function FloatingActions({
  whatsappHref,
  aogHref,
}: {
  whatsappHref: string;
  aogHref: string;
}) {
  const t = useTranslations('flutuante');
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > window.innerHeight * 0.6);
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  return (
    <>
      <a
        href={aogHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-4 z-50 flex items-center gap-1.5 rounded-full bg-aog px-4 py-3 text-sm font-bold tracking-wide text-white shadow-[0_14px_36px_-12px_rgb(224_36_48/0.9)] transition-all duration-300 sm:hidden',
          visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0',
        )}
      >
        <Lightning size={18} weight="fill" />
        <span aria-hidden>AOG</span>
        <span className="sr-only">{t('aog')}</span>
      </a>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('whatsapp')}
        title={t('whatsapp')}
        className={cn(
          'group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-50 grid size-13 place-items-center sm:size-14 rounded-full bg-[#1fa855] text-white shadow-[0_14px_36px_-12px_rgb(31_168_85/0.9)] transition-all duration-300 hover:scale-105 hover:bg-[#189547]',
          visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0',
        )}
      >
        <WhatsappLogo size={28} weight="fill" />
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-night-2 px-3 py-2 text-xs font-medium text-mist opacity-0 shadow-lg transition-opacity group-hover:opacity-100 lg:block">
          {t('whatsapp')}
        </span>
      </a>
    </>
  );
}
