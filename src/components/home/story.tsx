import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  AirplaneLanding,
  AirplaneTilt,
  ArrowRight,
  ArrowsClockwise,
  ArrowsLeftRight,
  CalendarCheck,
  Lightning,
  MagnifyingGlass,
  MapPin,
  Package,
  PaperPlaneTilt,
  Receipt,
  Tag,
  Wrench,
} from '@phosphor-icons/react/dist/ssr';

/** O que a entrada /ssr do Phosphor devolve: um componente de ícone. */
type Icon = React.ComponentType<{
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
}>;

import { Link } from '@/i18n/navigation';
import { Reveal, Section, SectionTitle } from '@/components/section';

/* ------------------------------------------------------- faixa de fatos */

const ICONES_FATOS: Icon[] = [MapPin, ArrowsLeftRight, CalendarCheck, Tag];

/**
 * Segunda dobra: os quatro fatos da operação.
 *
 * São fatos, não números de marketing — a copy não tem métrica verificada,
 * e inventar uma foi justamente o problema do site antigo.
 */
export function FactStrip() {
  const t = useTranslations('facts');

  const fatos = [
    { rotulo: t('floridaLabel'), valor: t('floridaValue') },
    { rotulo: t('routeLabel'), valor: t('routeValue') },
    { rotulo: t('sinceLabel'), valor: t('sinceValue') },
    { rotulo: t('conditionsLabel'), valor: t('conditionsValue') },
  ];

  return (
    <Section tom="night-2" className="!py-0">
      <div className="grid gap-px overflow-hidden rounded-xl bg-night-line sm:grid-cols-2 lg:grid-cols-4">
        {fatos.map((fato, i) => {
          const Icone = ICONES_FATOS[i];
          return (
            <Reveal
              key={fato.rotulo}
              atraso={i * 70}
              className="group bg-night-2 p-6 transition-colors hover:bg-night-3"
            >
              <span className="grid size-11 place-items-center rounded-md bg-tag/12 text-tag transition-transform duration-300 group-hover:-translate-y-1">
                <Icone size={22} weight="duotone" />
              </span>
              <p className="mt-4 font-display text-lg text-white">{fato.rotulo}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-mist-soft">{fato.valor}</p>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- sobre */

export function About() {
  const t = useTranslations('about');

  return (
    <Section id="sobre">
      <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <Reveal className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src="/fotos/pecas-hangar.jpg"
              alt="Peças aeronáuticas separadas sobre a mesa, ao lado da aeronave no hangar"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/60 to-transparent"
            />
          </div>
        </Reveal>

        <Reveal atraso={100}>
          <SectionTitle>{t('title')}</SectionTitle>

          <p className="measure mt-5 text-base leading-relaxed text-mist-soft sm:text-lg">
            {t('text1')}
          </p>
          <p className="measure mt-4 text-base leading-relaxed text-mist-soft">{t('text2')}</p>

          <div className="mt-8 rounded-lg border-l-[3px] border-tag bg-white/[0.04] p-5">
            <h3 className="font-display text-lg text-white">{t('subtitle')}</h3>
            <p className="measure mt-2 leading-relaxed text-mist-soft">{t('subtext')}</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ serviços */

const ICONES_SERVICOS: Icon[] = [
  MagnifyingGlass,
  Wrench,
  Lightning,
  AirplaneTilt,
  ArrowsClockwise,
];

export function Services() {
  const t = useTranslations('services');
  const itens = t.raw('items') as { title: string; text: string }[];

  return (
    <Section id="servicos" tom="night-2">
      <Reveal className="max-w-3xl">
        <SectionTitle>{t('title')}</SectionTitle>
        <p className="measure mt-5 text-base leading-relaxed text-mist-soft sm:text-lg">
          {t('intro')}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {itens.map((item, i) => {
          const Icone = ICONES_SERVICOS[i] ?? MagnifyingGlass;
          const destaque = i === 2; // AOG
          return (
            <Reveal
              key={item.title}
              atraso={i * 70}
              className={`group rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                destaque
                  ? 'border-aog/35 bg-aog/[0.07] hover:border-aog/70'
                  : 'border-white/10 bg-white/[0.035] hover:border-white/25'
              }`}
            >
              <span
                className={`grid size-12 place-items-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${
                  destaque ? 'bg-aog/15 text-aog' : 'bg-tag/12 text-tag'
                }`}
              >
                <Icone size={24} weight="duotone" />
              </span>
              <h3 className="mt-5 font-display text-lg leading-snug text-white">{item.title}</h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-mist-soft">{item.text}</p>
            </Reveal>
          );
        })}

        <Reveal
          atraso={itens.length * 70}
          className="flex flex-col justify-between rounded-xl bg-tag p-6 text-night"
        >
          <p className="font-display text-xl leading-snug">{t('ctaTitulo')}</p>
          <Link
            href="/cotacao"
            className="group mt-6 inline-flex items-center gap-2 self-start rounded-full bg-night px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            {t('cta')}
            <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------- como funciona */

const ICONES_PASSOS: Icon[] = [
  PaperPlaneTilt,
  MagnifyingGlass,
  Receipt,
  Package,
  AirplaneLanding,
];

export function HowItWorks() {
  const t = useTranslations('how');
  const passos = t.raw('steps') as { title: string; text: string }[];

  return (
    <Section id="como-funciona">
      <Reveal className="max-w-3xl">
        <SectionTitle>{t('title')}</SectionTitle>
      </Reveal>

      {/* A linha que costura os passos existe porque isto é uma sequência
          de verdade: do part number à chegada no hangar. */}
      <ol className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
        <span
          aria-hidden
          className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-night-line to-transparent lg:block"
        />

        {passos.map((passo, i) => {
          const Icone = ICONES_PASSOS[i] ?? PaperPlaneTilt;
          return (
            <Reveal key={passo.title} atraso={i * 90} as="li" className="relative">
              <span className="relative grid size-12 place-items-center rounded-lg border border-night-line bg-night text-tag transition-colors duration-300 hover:border-tag">
                <Icone size={22} weight="duotone" />
              </span>
              <span className="pn mt-4 block text-xs font-medium text-tag">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-1.5 font-display text-base leading-snug text-white">
                {passo.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-soft">{passo.text}</p>
            </Reveal>
          );
        })}
      </ol>

      <Reveal className="mt-14 rounded-xl border border-night-line bg-white/[0.03] p-6 sm:p-7">
        <h3 className="font-display text-base text-white">{t('deadlinesTitle')}</h3>
        <p className="measure mt-2 leading-relaxed text-mist-soft">{t('deadlines')}</p>
      </Reveal>
    </Section>
  );
}
