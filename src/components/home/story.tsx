import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Section, SectionTitle } from '@/components/section';

export function About() {
  const t = useTranslations('about');

  return (
    <Section id="sobre">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <SectionTitle>{t('title')}</SectionTitle>

        <div>
          <p className="measure text-lg leading-relaxed">{t('text1')}</p>
          <p className="measure mt-5 text-lg leading-relaxed">{t('text2')}</p>

          <div className="mt-10 border-l-2 border-tag pl-6">
            <h3 className="font-display text-xl">{t('subtitle')}</h3>
            <p className="measure mt-2.5 leading-relaxed text-ink-soft">
              {t('subtext')}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function Services() {
  const t = useTranslations('services');
  const items = t.raw('items') as { title: string; text: string }[];

  return (
    <Section id="servicos" tone="mist">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <SectionTitle>{t('title')}</SectionTitle>
          <p className="measure mt-5 text-lg leading-relaxed text-ink-soft">
            {t('intro')}
          </p>
        </div>

        {/*
          Lista com fios, não cinco cards iguais: os serviços não são uma
          sequência, e card para tudo é o atalho que faz a página virar
          template. Também não há "Saiba mais" por item, porque não existe
          página de serviço — e botão que não leva a lugar nenhum foi um dos
          problemas apontados no diagnóstico.
        */}
        <div>
          <dl className="divide-y divide-mist-deep border-t border-mist-deep">
            {items.map((item) => (
              <div
                key={item.title}
                className="grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[0.8fr_1.2fr]"
              >
                <dt className="font-display text-lg leading-snug">
                  {item.title}
                </dt>
                <dd className="leading-relaxed text-ink-soft">{item.text}</dd>
              </div>
            ))}
          </dl>

          <Link
            href="/cotacao"
            className="mt-10 inline-block bg-ink px-6 py-3.5 font-semibold text-surface transition-colors hover:bg-ink-700"
          >
            {t('cta')}
          </Link>
        </div>
      </div>
    </Section>
  );
}

export function HowItWorks() {
  const t = useTranslations('how');
  const steps = t.raw('steps') as { title: string; text: string }[];

  return (
    <Section id="como-funciona">
      <SectionTitle className="max-w-3xl">{t('title')}</SectionTitle>

      {/* Aqui a numeração é informação: isto é uma sequência de verdade. */}
      <ol className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="border-t-2 border-ink pt-5">
            <span className="pn text-sm font-medium text-tag">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-2 font-display text-lg">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-ink-soft">{step.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 max-w-3xl border-l-2 border-mist-deep pl-6">
        <h3 className="font-display text-base">{t('deadlinesTitle')}</h3>
        <p className="mt-2 leading-relaxed text-ink-soft">{t('deadlines')}</p>
      </div>
    </Section>
  );
}
