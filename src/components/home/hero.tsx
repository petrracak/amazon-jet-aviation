import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, Lightning, Tag } from '@phosphor-icons/react/dist/ssr';

import { Link } from '@/i18n/navigation';
import { PartSearch } from '@/components/part-search';

/**
 * Primeira dobra.
 *
 * A arte é o arquivo já recortado na medida do avião (864x738), e entra com
 * largura e altura próprias, sem object-fit. Isso tira o enquadramento da
 * conta: não existe janela que possa cortar asa, cauda ou a ponta da marca,
 * em nenhuma largura de tela.
 *
 * O fundo da seção é o mesmo #0f1827 dos cantos do arquivo, então a borda
 * da imagem desaparece e nenhum degradê de costura é preciso.
 *
 * Texto e arte ficam em colunas separadas no computador e empilhados no
 * celular, então um nunca cobre o outro.
 */
export function Hero({ aogHref }: { aogHref: string }) {
  const t = useTranslations('hero');

  return (
    <section className="bg-hero">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:pb-14 lg:pt-28">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* No celular a arte vem primeiro, logo abaixo do cabeçalho. */}
          <div className="order-1 lg:order-2">
            <Image
              src="/hero/aviao.jpg"
              alt="Monomotor PS-BZR da Amazon Jet Aviation em voo, com as bandeiras dos Estados Unidos e do Brasil"
              width={864}
              height={738}
              priority
              sizes="(min-width: 1024px) 480px, 100vw"
              className="mx-auto h-auto w-full max-w-[420px] lg:mr-0 lg:max-w-[480px]"
            />
          </div>

          <div className="order-2 lg:order-1">
            <p className="tag">
              <Tag size={15} weight="fill" />
              {t('eyebrow')}
            </p>

            <h1 className="mt-5 font-display text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.06] text-white">
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

        {/* A busca volta à largura que tinha: um painel contido, não uma
            faixa de ponta a ponta. */}
        <div className="glass mt-8 rounded-xl p-5 sm:p-6 lg:mt-10 lg:max-w-3xl">
          <PartSearch />
        </div>
      </div>
    </section>
  );
}
