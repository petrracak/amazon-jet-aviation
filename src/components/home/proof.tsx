import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Section, SectionTitle } from '@/components/section';

export function WhyUs() {
  const t = useTranslations('why');
  const items = t.raw('items') as { title: string; text: string }[];

  return (
    <Section tone="mist">
      <SectionTitle className="max-w-2xl">{t('title')}</SectionTitle>

      <div className="mt-12 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="border-t border-ink/20 pt-5">
            <h3 className="font-display text-lg leading-snug">{item.title}</h3>
            <p className="mt-2 leading-relaxed text-ink-soft">{item.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Documentation() {
  const t = useTranslations('docs');
  const items = t.raw('items') as string[];

  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <SectionTitle>{t('title')}</SectionTitle>
          <p className="measure mt-5 text-lg leading-relaxed text-ink-soft">
            {t('text')}
          </p>
        </div>

        <div>
          <ul className="divide-y divide-mist-deep border-y border-mist-deep">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-4 py-4">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 bg-tag"
                />
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
          <p className="measure mt-6 text-sm leading-relaxed text-ink-soft">
            {t('closing')}
          </p>
        </div>
      </div>
    </Section>
  );
}

export function GlobalReach() {
  const t = useTranslations('global');

  return (
    <Section tone="mist">
      <div className="max-w-3xl">
        <SectionTitle>{t('title')}</SectionTitle>
        <p className="measure mt-5 text-lg leading-relaxed text-ink-soft">
          {t('text')}
        </p>
      </div>
    </Section>
  );
}

export function Aircraft() {
  const t = useTranslations('aircraft');
  const rows = t.raw('rows') as { type: string; models: string }[];

  return (
    <Section>
      <SectionTitle className="max-w-2xl">{t('title')}</SectionTitle>
      <p className="measure mt-5 text-lg leading-relaxed text-ink-soft">
        {t('text')}
      </p>

      {/* Dado tabular em tabela de verdade: a estrutura carrega a informação. */}
      <table className="mt-10 w-full border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-ink">
            <th scope="col" className="w-48 py-3 pr-6 font-display text-sm">
              {t('typeHead')}
            </th>
            <th scope="col" className="py-3 font-display text-sm">
              {t('modelsHead')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.type} className="border-b border-mist-deep">
              <th scope="row" className="py-4 pr-6 font-medium">
                {row.type}
              </th>
              <td className="py-4 text-ink-soft">{row.models}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="font-display text-base">{t('clientsTitle')}</h3>
          <p className="mt-2 leading-relaxed text-ink-soft">{t('clients')}</p>
        </div>
        <div>
          <h3 className="font-display text-base">{t('makersTitle')}</h3>
          <p className="mt-2 leading-relaxed text-ink-soft">{t('makers')}</p>
        </div>
      </div>
    </Section>
  );
}

export function Testimonials() {
  const t = useTranslations('testimonials');
  const items = t.raw('items') as {
    quote: string;
    name: string;
    role: string;
  }[];

  return (
    <Section tone="mist">
      <SectionTitle className="max-w-2xl">{t('title')}</SectionTitle>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        {items.map((item) => (
          <figure key={item.name} className="border-l-2 border-tag pl-6">
            <blockquote className="text-lg leading-relaxed">
              {item.quote}
            </blockquote>
            <figcaption className="mt-5 text-sm">
              <span className="font-semibold">{item.name}</span>
              <span className="block text-ink-soft">{item.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

export function WorldTour() {
  const t = useTranslations('world');

  return (
    <Section>
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div className="relative aspect-[16/10] overflow-hidden bg-mist">
          <Image
            src="/blog/voltaaomundo.png"
            alt="Expedição Volta ao Mundo 2026"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <SectionTitle>{t('title')}</SectionTitle>
          <p className="measure mt-5 text-lg leading-relaxed text-ink-soft">
            {t('text')}
          </p>
          <Link
            href="/blog"
            className="mt-7 inline-block border-2 border-ink px-5 py-2.5 font-semibold transition-colors hover:bg-ink hover:text-surface"
          >
            {t('cta')}
          </Link>
        </div>
      </div>
    </Section>
  );
}
