import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, Lightning, Tag } from '@phosphor-icons/react/dist/ssr';

import { Link } from '@/i18n/navigation';
import { PartSearch } from '@/components/part-search';

/**
 * Primeira dobra.
 *
 * A arte ocupa a tela inteira e manda no enquadramento: no desktop o avião
 * fica à direita e o texto à esquerda; no celular o avião fica em cima e o
 * texto desce para baixo dele. A busca por part number vive num painel de
 * vidro rente ao rodapé da dobra, onde a arte já é só fundo — fica em
 * evidência sem tapar o avião.
 */
export function Hero({ aogHref }: { aogHref: string }) {
  const t = useTranslations('hero');

  return (
    <section className="relative isolate overflow-hidden bg-night">
      <Image
        src="/hero/hero-desktop.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-right lg:block"
      />
      <Image
        src="/hero/hero-mobile.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_top] lg:hidden"
      />

      {/* Véus: um da esquerda, para o texto ter fundo no desktop, e outro de
          baixo, que costura a arte com a seção seguinte. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-night/80 via-night/30 to-night lg:bg-gradient-to-r lg:from-night lg:from-20% lg:via-night/55 lg:via-48% lg:to-transparent lg:to-72%"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-night via-night/70 to-transparent"
      />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-10 pt-[50vh] sm:px-6 lg:min-h-[88svh] lg:pb-12 lg:pt-28">
        <div className="max-w-2xl">
          <p className="tag">
            <Tag size={15} weight="fill" />
            {t('eyebrow')}
          </p>

          <h1 className="mt-6 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-white">
            {t('title')}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-mist-soft sm:text-lg">
            {t('text')}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/cotacao"
              className="group inline-flex items-center gap-2 rounded-full bg-tag px-6 py-3.5 text-[0.9375rem] font-semibold text-night transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-10px_rgb(240_173_19/0.7)]"
            >
              {t('primary')}
              <ArrowRight
                size={18}
                weight="bold"
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <a
              href={aogHref}
              target="_blank"
              rel="noopener noreferrer"
              className="pulso-aog group inline-flex items-center gap-2 rounded-full bg-aog px-6 py-3.5 text-[0.9375rem] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-aog-deep"
            >
              <Lightning
                size={18}
                weight="fill"
                className="transition-transform group-hover:scale-125"
              />
              {t('secondary')}
            </a>
          </div>

          <p className="mt-5 text-sm text-mist-soft/80">{t('support')}</p>
        </div>

        <div className="glass mt-9 rounded-xl p-5 sm:p-6 lg:mt-10 lg:max-w-3xl">
          <PartSearch />
        </div>
      </div>
    </section>
  );
}
