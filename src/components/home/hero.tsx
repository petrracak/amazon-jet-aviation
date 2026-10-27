import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, Lightning, Tag } from '@phosphor-icons/react/dist/ssr';

import { Link } from '@/i18n/navigation';
import { PartSearch } from '@/components/part-search';

/**
 * Primeira dobra.
 *
 * A arte é o arquivo já recortado na medida do avião (864x738). No
 * computador ela ocupa a metade direita inteira da dobra, de cima a baixo;
 * no celular vem em cima, no fluxo.
 *
 * Quem passa por cima da arte é só o painel de busca, de propósito. O texto
 * fica preso a 48% da largura, que sempre termina antes de onde a arte
 * começa — é isso que garante que nenhuma palavra caia sobre o avião.
 *
 * O fundo da seção é o mesmo #0f1827 dos cantos do arquivo, então a borda
 * da imagem desaparece e nenhum degradê de costura é preciso. E como ela
 * entra com object-contain, nada é cortado em nenhuma largura de tela.
 */
export function Hero({ aogHref }: { aogHref: string }) {
  const t = useTranslations('hero');

  return (
    <section className="relative isolate overflow-hidden bg-hero">
      <div className="px-4 pt-24 sm:px-6 lg:pointer-events-none lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:px-0 lg:pt-0">
        <Image
          src="/hero/aviao.jpg"
          alt=""
          width={864}
          height={738}
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="mx-auto h-auto w-full max-w-[420px] lg:absolute lg:inset-0 lg:h-full lg:w-full lg:max-w-none lg:object-contain"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:pb-14 lg:pt-28">
        <div className="lg:w-[48%]">
          <p className="tag">
            <Tag size={15} weight="fill" />
            {t('eyebrow')}
          </p>

          <h1 className="mt-5 font-display text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.06] text-white">
            {t('title')}
          </h1>

          <p className="mt-5 text-base leading-relaxed text-mist-soft">{t('text')}</p>

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

          <p className="mt-5 text-sm text-mist-soft/80">{t('support')}</p>
        </div>

        <div className="glass mt-8 rounded-xl p-5 sm:p-6 lg:mt-10 lg:max-w-3xl">
          <PartSearch />
        </div>
      </div>
    </section>
  );
}
