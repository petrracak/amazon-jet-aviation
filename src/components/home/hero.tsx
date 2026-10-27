import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, Lightning, Tag } from '@phosphor-icons/react/dist/ssr';

import { Link } from '@/i18n/navigation';
import { PartSearch } from '@/components/part-search';

/**
 * Primeira dobra.
 *
 * Texto e arte não se sobrepõem em nenhum tamanho de tela: no computador
 * ficam lado a lado, no celular a arte vem em cima e o texto embaixo. Não
 * há véu nem sombra sobre o avião.
 *
 * O fundo da seção é exatamente o mesmo #0f1827 dos quatro cantos do
 * arquivo, então a borda da imagem desaparece e ela parece desenhada na
 * página. É isso que dispensa qualquer degradê de costura.
 *
 * O enquadramento vem medido do próprio arquivo: o avião ocupa de 46% a
 * 89% da largura e de 6% a 81% da altura, com centro em 68%/43%. É esse
 * ponto que o object-position persegue, para a arte chegar cheia ao
 * quadro em qualquer proporção.
 */
export function Hero({ aogHref }: { aogHref: string }) {
  const t = useTranslations('hero');

  return (
    <section className="bg-hero">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:pb-14 lg:pt-28">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          {/* No celular a arte vem primeiro, logo abaixo do cabeçalho. */}
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/3] w-full lg:aspect-[5/4]">
              <Image
                src="/hero/hero-desktop.webp"
                alt="Monomotor PS-BZR da Amazon Jet Aviation em voo, com as bandeiras dos Estados Unidos e do Brasil"
                fill
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover object-[68%_43%]"
              />
            </div>
          </div>

          <div className="order-2 lg:order-1">
            <p className="tag">
              <Tag size={15} weight="fill" />
              {t('eyebrow')}
            </p>

            <h1 className="mt-5 font-display text-[clamp(1.9rem,4.4vw,3.1rem)] leading-[1.06] text-white">
              {t('title')}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-mist-soft">
              {t('text')}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
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

            <p className="mt-5 max-w-lg text-sm text-mist-soft/80">{t('support')}</p>
          </div>
        </div>

        {/* A busca fica abaixo das duas colunas: em evidência, e sem
            encostar na arte. */}
        <div className="glass mt-8 rounded-xl p-5 sm:p-6 lg:mt-10">
          <PartSearch />
        </div>
      </div>
    </section>
  );
}
