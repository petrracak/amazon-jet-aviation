import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PartSearch } from '@/components/part-search';
import { About, HowItWorks, Services } from '@/components/home/story';
import {
  Aircraft,
  Documentation,
  GlobalReach,
  Testimonials,
  WhyUs,
  WorldTour,
} from '@/components/home/proof';
import { AogBand, FinalCta } from '@/components/home/action';
import { FaqSection } from '@/components/home/faq-section';
import { linkAog, linkWhatsApp } from '@/lib/contact';
import { getConfig } from '@/lib/settings';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Contatos e mensagens dos botões vêm do painel, não do código.
  const { contato, mensagens } = await getConfig();
  const aogHref = linkAog(contato, mensagens);

  return (
    <>
      <Hero aogHref={aogHref} />
      <FactStrip />
      <About />
      <Services />
      <HowItWorks />
      <AogBand aogHref={aogHref} />
      <WhyUs />
      <Documentation />
      <GlobalReach />
      <Aircraft />
      <Testimonials />
      <WorldTour />
      <FaqSection />
      <FinalCta contato={contato} whatsappHref={linkWhatsApp(contato, mensagens)} />
    </>
  );
}

function Hero({ aogHref }: { aogHref: string }) {
  const t = useTranslations('hero');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-mist to-surface">
      {/*
        Ordem no DOM: texto, busca, botões. No celular empilha nessa ordem,
        que é a que serve. No desktop a busca vai para a coluna da direita
        por posicionamento explícito, e os botões sobem para baixo do texto.
      */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-x-16 lg:gap-y-10 lg:py-24">
        <div className="lg:col-start-1 lg:row-start-1">
          <p className="tag">{t('eyebrow')}</p>

          <h1 className="mt-6 font-display text-[clamp(2.1rem,5.2vw,3.6rem)] leading-[1.06]">
            {t('title')}
          </h1>

          <p className="measure mt-6 text-lg leading-relaxed text-ink-soft">
            {t('text')}
          </p>
        </div>

        {/*
          O hero não abre com foto de avião: abre com a busca funcionando,
          que é o que a empresa faz e a ação principal da página. No celular
          ela sobe para logo depois do texto, antes dos botões.
        */}
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:pt-2">
          <PartSearch />
        </div>

        <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href="/cotacao"
              className="bg-ink px-6 py-3.5 text-base font-semibold text-surface transition-colors hover:bg-ink-700"
            >
              {t('primary')}
            </Link>
            <a
              href={aogHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-aog underline decoration-2 underline-offset-4 hover:no-underline"
            >
              {t('secondary')}
            </a>
          </div>

          <p className="measure mt-6 text-sm text-ink-soft">{t('support')}</p>
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
