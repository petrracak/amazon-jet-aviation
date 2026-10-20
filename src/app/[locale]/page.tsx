import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PartSearch } from '@/components/part-search';
import { aogWhatsappUrl } from '@/lib/contact';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <FactStrip />
    </>
  );
}

function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-mist to-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
        <div>
          <p className="tag">{t('eyebrow')}</p>

          <h1 className="mt-6 font-display text-[clamp(2.1rem,5.2vw,3.6rem)] leading-[1.06]">
            {t('title')}
          </h1>

          <p className="measure mt-6 text-lg leading-relaxed text-ink-soft">
            {t('text')}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href="/cotacao"
              className="bg-ink px-6 py-3.5 text-base font-semibold text-surface transition-colors hover:bg-ink-700"
            >
              {t('primary')}
            </Link>
            <a
              href={aogWhatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-aog underline decoration-2 underline-offset-4 hover:no-underline"
            >
              {t('secondary')}
            </a>
          </div>

          <p className="measure mt-6 text-sm text-ink-soft">{t('support')}</p>
        </div>

        {/*
          O hero não abre com foto de avião: abre com a busca funcionando,
          que é o que a empresa realmente faz e a ação principal da página.
        */}
        <div className="lg:pt-2">
          <PartSearch />
        </div>
      </div>
    </section>
  );
}

function FactStrip() {
  const t = useTranslations('facts');

  const facts = [
    { label: t('floridaLabel'), value: t('floridaValue') },
    { label: t('routeLabel'), value: t('routeValue') },
    { label: t('sinceLabel'), value: t('sinceValue') },
    { label: t('conditionsLabel'), value: t('conditionsValue') },
  ];

  return (
    <section className="border-y border-mist-deep">
      <dl className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-mist-deep px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        {facts.map((fact) => (
          <div key={fact.label} className="py-7 lg:px-7 lg:first:pl-0 lg:last:pr-0">
            <dt className="font-display text-lg font-bold">{fact.label}</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
