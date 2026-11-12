import { useTranslations } from 'next-intl';
import { ArrowRight, Lightning, Tag } from '@phosphor-icons/react/dist/ssr';

import { Link } from '@/i18n/navigation';
import { PartSearch } from '@/components/part-search';
import { BrilhoCursor } from '@/components/home/brilho-cursor';
import { VideoFundo } from '@/components/home/video-fundo';

/**
 * Primeira dobra.
 *
 * São dois arranjos, não um arranjo que encolhe.
 *
 * No computador, a imagem é fundo de tela cheia e o texto vai centralizado
 * por cima — como era no site antigo, que foi o que o cliente preferiu.
 *
 * No celular, a imagem é uma faixa no topo e o texto vem abaixo dela, em
 * fundo sólido. Texto sobre foto numa tela de 375px obriga a escurecer
 * tanto a imagem que ela deixa de valer a pena, e ainda assim as linhas
 * ficam difíceis. Separados, a foto aparece inteira e o texto lê limpo.
 *
 * Também muda o alinhamento: centralizado no computador, à esquerda no
 * celular. Linha centralizada em coluna estreita vira serrilha de bordas,
 * e o olho perde o ponto de retorno a cada quebra.
 *
 * Nada da primeira dobra entra com animação de aparecer. O que está na
 * primeira tela precisa estar lá quando a tela acende — animar isso
 * atrasa a leitura e, de quebra, é exatamente o que o Speed Index mede.
 */
export function Hero({ aogHref }: { aogHref: string }) {
  const t = useTranslations('hero');

  return (
    <section className="relative isolate flex flex-col overflow-hidden bg-hero lg:min-h-[min(92svh,48rem)] lg:justify-center">
      {/*
        O pôster é o maior elemento da primeira tela, ou seja, é ele que o
        navegador cronometra como LCP. Sem este aviso ele só é descoberto
        quando o HTML da seção é analisado; com ele, a busca começa junto
        com a do CSS. São dois porque cada formato de tela recebe um
        arquivo diferente.
      */}
      <link
        rel="preload"
        as="image"
        href="/hero/voo-mobile.webp"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/hero/voo.webp"
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      {/* A mídia: faixa no fluxo no celular, fundo absoluto no computador. */}
      <div className="relative h-[26svh] min-h-[11rem] w-full shrink-0 lg:absolute lg:inset-0 lg:h-full">
        <VideoFundo
          poster="/hero/voo.webp"
          posterMobile="/hero/voo-mobile.webp"
          src="/hero/voo.mp4"
        />

        {/*
          No celular o véu é leve e só fecha embaixo, onde a faixa encontra
          o texto. No computador ele cobre a dobra inteira, porque lá o
          texto passa por cima da imagem.
        */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_21_36/0.30)_0%,rgb(10_21_36/0.10)_45%,rgb(15_24_39/0.96)_88%,var(--color-hero)_100%)] lg:bg-[linear-gradient(180deg,rgb(10_21_36/0.80)_0%,rgb(10_21_36/0.58)_34%,rgb(10_21_36/0.62)_62%,rgb(10_21_36/0.94)_100%)]"
        />

        <div
          aria-hidden
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              'radial-gradient(60rem 32rem at 50% 42%, rgb(10 21 36 / 0.55), rgb(10 21 36 / 0) 72%)',
          }}
        />
      </div>

      {/* O brilho vem depois dos véus: pintado antes, ficaria escondido. */}
      <BrilhoCursor />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:pb-16 lg:pt-20">
        <div className="mx-auto max-w-3xl lg:text-center">
          <p className="tag text-[0.6875rem] leading-tight sm:text-xs lg:leading-normal">
            <Tag size={14} weight="fill" className="shrink-0" />
            {t('eyebrow')}
          </p>

          <h1 className="mt-3 font-display text-[clamp(1.75rem,7.4vw,3.25rem)] leading-[1.07] text-white sm:mt-5 lg:text-[clamp(2.2rem,4.6vw,3.25rem)] lg:leading-[1.05] lg:[text-shadow:0_2px_24px_rgb(10_21_36/0.55)]">
            {t('title')}
          </h1>

          {/*
            Duas versões do mesmo recado. A longa descreve o serviço inteiro
            e cabe bem a partir do tablet; no celular ela ocupava cinco
            linhas e empurrava o buscador para fora da primeira tela.
            Cortar com reticências pareceria defeito, então a tela pequena
            recebe uma frase escrita para ela.
          */}
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-mist-soft sm:hidden">
            {t('textMobile')}
          </p>
          <p className="mt-3 hidden text-[0.9375rem] leading-relaxed text-mist-soft sm:block sm:text-base lg:mx-auto lg:mt-5 lg:max-w-2xl lg:text-mist">
            {t('text')}
          </p>

          {/*
            No celular os botões ocupam a largura toda e ficam empilhados:
            alvo de toque maior e nenhuma quebra de linha estranha quando o
            rótulo é comprido. No computador voltam a ficar lado a lado.
          */}
          <div className="mt-5 flex flex-col gap-2.5 sm:mt-7 lg:flex-row lg:flex-wrap lg:justify-center lg:gap-3">
            <Link
              href="/cotacao"
              className="group inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-full bg-tag px-6 text-base font-semibold text-night transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-10px_rgb(240_173_19/0.7)] lg:min-h-0 lg:py-3.5 lg:text-[0.9375rem]"
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
              className="pulso-aog group inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-full bg-aog px-6 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-aog-deep lg:min-h-0 lg:py-3.5 lg:text-[0.9375rem]"
            >
              <Lightning
                size={18}
                weight="fill"
                className="transition-transform group-hover:scale-125"
              />
              {t('secondary')}
            </a>
          </div>

          <p className="mt-5 hidden text-sm text-mist-soft sm:block">{t('support')}</p>
        </div>

        <div className="glass mx-auto mt-5 max-w-3xl rounded-xl p-4 text-left sm:mt-8 sm:p-6">
          <PartSearch />
        </div>
      </div>
    </section>
  );
}
