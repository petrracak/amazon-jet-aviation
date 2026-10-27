import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  Barcode,
  Certificate,
  Eye,
  FileText,
  GlobeHemisphereWest,
  Infinity as InfinityIcon,
  Lightning,
  Notebook,
  Quotes,
  SealCheck,
  Translate,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';

/** O que a entrada /ssr do Phosphor devolve: um componente de ícone. */
type Icon = React.ComponentType<{
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
}>;

import { Reveal, Section, SectionTitle } from '@/components/section';
import { MapaRota } from '@/components/home/mapa-rota';

/* ------------------------------------------------------- diferenciais */

const ICONES_DIFERENCIAIS: Icon[] = [
  UsersThree,
  InfinityIcon,
  Lightning,
  FileText,
  Eye,
  Translate,
];

export function WhyUs() {
  const t = useTranslations('why');
  const itens = t.raw('items') as { title: string; text: string }[];

  return (
    <Section>
      <Reveal className="max-w-2xl">
        <SectionTitle>{t('title')}</SectionTitle>
      </Reveal>

      <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((item, i) => {
          const Icone = ICONES_DIFERENCIAIS[i] ?? UsersThree;
          return (
            <Reveal key={item.title} atraso={i * 60} className="group flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-md bg-white/[0.06] text-tag transition-all duration-300 group-hover:bg-tag group-hover:text-night">
                <Icone size={22} weight="duotone" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-lg leading-snug text-white">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-mist-soft">{item.text}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ------------------------------------------------- documentação (claro) */

const ICONES_DOCS: Icon[] = [Certificate, SealCheck, FileText, Barcode, Notebook];

export function Documentation() {
  const t = useTranslations('docs');
  const itens = t.raw('items') as string[];

  return (
    <Section tom="paper">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <Reveal>
          <SectionTitle claro>
            {t('title')}
          </SectionTitle>
          <p className="measure mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
            {t('text')}
          </p>

          <ul className="mt-8 grid gap-3">
            {itens.map((item, i) => {
              const Icone = ICONES_DOCS[i] ?? Certificate;
              return (
                <li
                  key={item}
                  className="group flex items-center gap-3 rounded-md border border-paper-2 bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-tag"
                >
                  <Icone
                    size={22}
                    weight="duotone"
                    className="shrink-0 text-tag transition-transform group-hover:scale-110"
                  />
                  <span className="font-medium text-ink">{item}</span>
                </li>
              );
            })}
          </ul>

          <p className="measure mt-6 text-sm leading-relaxed text-ink-soft">{t('closing')}</p>
        </Reveal>

        <Reveal atraso={100}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-[0_30px_80px_-40px_rgb(11_27_43/0.6)]">
            <Image
              src="/fotos/peca-etiqueta.jpg"
              alt="Bomba de combustível com a etiqueta de identificação da peça"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* --------------------------------------------------- atendimento global */

export function GlobalReach() {
  const t = useTranslations('global');

  return (
    <Section tom="night-2">
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <span className="grid size-14 place-items-center rounded-xl bg-tag/12 text-tag">
            <GlobeHemisphereWest size={28} weight="duotone" />
          </span>
          <SectionTitle className="mt-6">{t('title')}</SectionTitle>
          <p className="measure mt-5 text-base leading-relaxed text-mist-soft sm:text-lg">
            {t('text')}
          </p>
        </Reveal>

        <Reveal atraso={120}>
          <MapaRota origem={t('origem')} destino={t('destino')} />
        </Reveal>
      </div>
    </Section>
  );
}

/* ----------------------------------------------------- aeronaves (claro) */

export function Aircraft() {
  const t = useTranslations('aircraft');
  const linhas = t.raw('rows') as { type: string; models: string }[];

  return (
    <Section tom="paper">
      <Reveal className="max-w-3xl">
        <SectionTitle claro>
          {t('title')}
        </SectionTitle>
        <p className="measure mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
          {t('text')}
        </p>
      </Reveal>

      <Reveal className="mt-10 overflow-hidden rounded-xl border border-paper-2 bg-white">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-paper-2 bg-paper">
              <th scope="col" className="w-48 px-5 py-4 font-display text-sm text-ink">
                {t('typeHead')}
              </th>
              <th scope="col" className="px-5 py-4 font-display text-sm text-ink">
                {t('modelsHead')}
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr
                key={linha.type}
                className="border-b border-paper-2 transition-colors last:border-0 hover:bg-paper"
              >
                <th scope="row" className="px-5 py-4 font-medium text-ink">
                  {linha.type}
                </th>
                <td className="px-5 py-4 text-ink-soft">{linha.models}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Reveal className="rounded-lg border border-paper-2 bg-white p-5">
          <h3 className="font-display text-base text-ink">{t('clientsTitle')}</h3>
          <p className="mt-2 leading-relaxed text-ink-soft">{t('clients')}</p>
        </Reveal>
        <Reveal atraso={80} className="rounded-lg border border-paper-2 bg-white p-5">
          <h3 className="font-display text-base text-ink">{t('makersTitle')}</h3>
          <p className="mt-2 leading-relaxed text-ink-soft">{t('makers')}</p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------- depoimentos */

export function Testimonials() {
  const t = useTranslations('testimonials');
  const itens = t.raw('items') as { quote: string; name: string; role: string }[];

  return (
    <Section>
      <Reveal className="max-w-2xl">
        <SectionTitle>{t('title')}</SectionTitle>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {itens.map((item, i) => (
          <Reveal
            key={item.name}
            atraso={i * 80}
            as="figure"
            className="group rounded-xl border border-white/10 bg-white/[0.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-tag/40"
          >
            <Quotes
              size={30}
              weight="fill"
              className="text-tag/60 transition-transform duration-300 group-hover:scale-110"
            />
            <blockquote className="mt-4 leading-relaxed text-mist">{item.quote}</blockquote>
            <figcaption className="mt-5 border-t border-white/10 pt-4 text-sm">
              <span className="font-semibold text-white">{item.name}</span>
              <span className="block text-mist-soft">{item.role}</span>
            </figcaption>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
