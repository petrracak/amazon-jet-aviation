import { useTranslations } from 'next-intl';
import { ArrowRight, Lightning, Tag } from '@phosphor-icons/react/dist/ssr';

import { Link } from '@/i18n/navigation';
import { PartSearch } from '@/components/part-search';
import { BrilhoCursor } from '@/components/home/brilho-cursor';
import { VideoFundo } from '@/components/home/video-fundo';
import { Reveal } from '@/components/reveal';

/**
 * Primeira dobra.
 *
 * O fundo é vídeo, não arte: um monomotor em voo, em loop e mudo. A
 * ilustração do avião com as bandeiras saiu daqui — avião filmado atrás e
 * avião desenhado na frente competiam, e a dobra ficava barulhenta.
 *
 * Com fundo fotográfico o texto passa a ser centralizado, como era no site
 * antigo que o cliente preferiu. O resto do site segue alinhado à
 * esquerda; aqui o eixo central é o que sustenta imagem de tela cheia.
 *
 * Sobre o vídeo vão três camadas, nesta ordem: o brilho que segue o cursor,
 * o véu que garante o contraste do texto e o conteúdo. O véu não é cinza —
 * é o próprio azul-noite da marca, então o vídeo escurece para dentro da
 * paleta em vez de apagar.
 *
 * No celular a conta é a mesma de antes: o botão vermelho de AOG e o começo
 * do buscador precisam caber na primeira tela, então os espaçamentos
 * encurtam e a linha de horário sai de cena — ela continua na dobra de AOG.
 */
export function Hero({ aogHref }: { aogHref: string }) {
  const t = useTranslations('hero');

  return (
    <section className="relative isolate flex min-h-[34rem] items-center overflow-hidden bg-hero lg:min-h-[min(92svh,48rem)]">
      <VideoFundo
        poster="/hero/voo.webp"
        posterMobile="/hero/voo-mobile.webp"
        src="/hero/voo.mp4"
      />

      {/*
        O véu. Mais fechado em cima, onde fica o menu, e embaixo, onde a
        dobra encontra a próxima seção; mais aberto no meio, onde o avião
        passa. Assim o vídeo respira sem nunca comer o texto.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgb(10 21 36 / 0.80) 0%, rgb(10 21 36 / 0.58) 34%,' +
            ' rgb(10 21 36 / 0.62) 62%, rgb(10 21 36 / 0.94) 100%)',
        }}
      />

      {/*
        Um segundo véu, radial e centrado onde o título cai. O gradiente de
        cima resolve a dobra como um todo; este resolve o caso específico de
        o avião passar exatamente atrás das letras.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60rem 32rem at 50% 42%, rgb(10 21 36 / 0.55), rgb(10 21 36 / 0) 72%)',
        }}
      />

      {/* O brilho vem DEPOIS dos véus de propósito: pintado antes, ficaria
          escondido debaixo deles. Aqui ele clareia o vídeo já escurecido,
          que é onde o efeito aparece. */}
      <BrilhoCursor />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12 lg:pb-16 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="tag mx-auto">
              <Tag size={15} weight="fill" />
              {t('eyebrow')}
            </p>
          </Reveal>

          <Reveal atraso={90}>
            <h1 className="mt-5 font-display text-[clamp(1.85rem,4.6vw,3.25rem)] leading-[1.05] text-white [text-shadow:0_2px_24px_rgb(10_21_36/0.55)]">
              {t('title')}
            </h1>
          </Reveal>

          <Reveal atraso={180}>
            <p className="mx-auto mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-mist sm:text-base">
              {t('text')}
            </p>
          </Reveal>

          <Reveal atraso={270}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              <Link
                href="/cotacao"
                className="group inline-flex items-center gap-2 rounded-full bg-tag px-6 py-3 text-[0.9375rem] font-semibold text-night transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-10px_rgb(240_173_19/0.7)] sm:py-3.5"
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
                className="pulso-aog group inline-flex items-center gap-2 rounded-full bg-aog px-6 py-3 text-[0.9375rem] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-aog-deep sm:py-3.5"
              >
                <Lightning
                  size={18}
                  weight="fill"
                  className="transition-transform group-hover:scale-125"
                />
                {t('secondary')}
              </a>
            </div>
          </Reveal>

          <Reveal atraso={340}>
            <p className="mt-5 hidden text-sm text-mist-soft sm:block">{t('support')}</p>
          </Reveal>
        </div>

        <Reveal atraso={420}>
          <div className="glass mx-auto mt-7 max-w-3xl rounded-xl p-5 text-left sm:mt-9 sm:p-6">
            <PartSearch />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
