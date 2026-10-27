import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, GlobeHemisphereWest, InstagramLogo } from '@phosphor-icons/react/dist/ssr';

import { Link } from '@/i18n/navigation';
import { Etiqueta, Reveal, Section, SectionTitle } from '@/components/section';

const MARCAS = [
  'CESSNA',
  'PIPER',
  'BEECHCRAFT',
  'LYCOMING',
  'CONTINENTAL',
  'PRATT & WHITNEY',
  'GARMIN',
  'HARTZELL',
  'CIRRUS',
];

/**
 * Dobra do Comandante, na terceira posição da home.
 *
 * Mantém a estrutura do site antigo — logo da expedição em destaque, foto
 * dele e uma imagem de fundo — com acabamento novo: a foto entra numa
 * moldura de vidro levemente inclinada e os números da expedição viram
 * dado, não adjetivo.
 */
export function Comandante() {
  const t = useTranslations('world');

  return (
    <section id="comandante" className="relative isolate overflow-hidden bg-night">
      <Image
        src="/fotos/volta-ao-mundo-fundo.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-30"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-night via-night/75 to-night"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <Reveal>
          <Etiqueta>
            <GlobeHemisphereWest size={15} weight="fill" />
            {t('eyebrow')}
          </Etiqueta>

          <Image
            src="/blog/voltaaomundo.png"
            alt="Volta ao Mundo 2026"
            width={520}
            height={180}
            className="mt-7 h-auto w-[min(100%,22rem)] drop-shadow-[0_0_40px_rgb(63_135_245/0.35)]"
          />

          <SectionTitle className="mt-7">{t('title')}</SectionTitle>

          <p className="measure mt-5 text-base leading-relaxed text-mist-soft sm:text-lg">
            {t('text')}
          </p>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
            {(t.raw('numeros') as { valor: string; rotulo: string }[]).map((n) => (
              <div key={n.rotulo}>
                <dt className="font-display text-3xl text-tag">{n.valor}</dt>
                <dd className="mt-1 text-sm text-mist-soft">{n.rotulo}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-[0.9375rem] font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-tag hover:text-tag"
            >
              {t('cta')}
              <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="https://instagram.com/ocomandante"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-mist-soft transition-colors hover:text-white"
            >
              <InstagramLogo size={20} weight="fill" />
              @ocomandante
            </a>
          </div>
        </Reveal>

        <Reveal atraso={120} className="relative">
          <div className="glass relative rotate-[1.5deg] rounded-xl p-3 transition-transform duration-500 hover:rotate-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
              <Image
                src="/fotos/comandante-asa.jpg"
                alt="Comandante Mário Jorge ao lado da asa com a marca da Amazon Jet Aviation"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="px-2 py-3 text-sm text-mist-soft">{t('legenda')}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Fabricantes e distribuidores.
 *
 * Duas faixas correndo em sentidos opostos, com os nomes em contorno que se
 * preenche no hover. É texto de propósito: usar o logo de terceiro sugere
 * parceria oficial, e isso ainda não está confirmado. Quando os arquivos
 * chegarem, troca-se o texto pela imagem sem refazer a seção.
 */
export function Brands() {
  const t = useTranslations('brands');
  const metade = Math.ceil(MARCAS.length / 2);
  const linhas = [MARCAS.slice(0, metade), MARCAS.slice(metade)];

  return (
    <Section tom="night-2" className="overflow-hidden">
      <Reveal className="text-center">
        <SectionTitle>{t('title')}</SectionTitle>
        <p className="measure mx-auto mt-4 text-base leading-relaxed text-mist-soft">
          {t('text')}
        </p>
      </Reveal>

      <div className="mascara-lateral mt-14 space-y-6">
        {linhas.map((linha, i) => (
          <div key={i} className="group flex overflow-hidden">
            <div
              style={{ ['--duracao' as string]: i === 0 ? '46s' : '54s' }}
              className={`flex shrink-0 items-center gap-12 pr-12 group-hover:[animation-play-state:paused] ${
                i === 0 ? 'marquee-track' : 'marquee-track-reverso'
              }`}
            >
              {[...linha, ...linha, ...linha, ...linha].map((marca, j) => (
                <span
                  key={`${marca}-${j}`}
                  className="texto-contorno whitespace-nowrap font-display text-[clamp(1.75rem,4vw,3.25rem)] font-bold"
                >
                  {marca}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-xs text-mist-soft/70">{t('aviso')}</p>
    </Section>
  );
}
