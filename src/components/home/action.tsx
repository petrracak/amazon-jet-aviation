import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Section, SectionTitle } from '@/components/section';
import type { Contato } from '@/lib/settings';
import { whatsappUrl } from '@/lib/contact';

/*
  Único bloco escuro do miolo da página, com a tarja vermelha reservada ao
  AOG. É o contraste mais alto do site porque é o momento de maior urgência
  do cliente: aeronave parada.
*/
export function AogBand({ aogHref }: { aogHref: string }) {
  const t = useTranslations('aog');
  const steps = t.raw('steps') as { title: string; text: string }[];

  return (
    <Section id="aog" tone="ink">
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <p className="inline-flex items-center gap-2 border-l-4 border-aog bg-aog/15 px-3 py-1 text-sm font-semibold tracking-wide text-white">
            {t('tag')}
          </p>

          <SectionTitle className="mt-6">{t('title')}</SectionTitle>

          <p className="measure mt-5 text-lg leading-relaxed text-white/75">
            {t('text')}
          </p>

          <a
            href={aogHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-block bg-aog px-6 py-3.5 font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t('cta')}
          </a>

          <p className="mt-5 text-sm text-white/55">{t('support')}</p>
        </div>

        <ol className="divide-y divide-white/15 border-y border-white/15 lg:mt-2">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-5 py-6">
              <span className="pn shrink-0 text-sm font-medium text-aog">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-display text-lg">{step.title}</h3>
                <p className="mt-1.5 leading-relaxed text-white/70">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

export function FinalCta({
  contato,
  whatsappHref,
}: {
  contato: Contato;
  whatsappHref: string;
}) {
  const t = useTranslations('final');

  return (
    <Section tone="mist">
      <div className="max-w-3xl">
        <SectionTitle>{t('title')}</SectionTitle>
        <p className="measure mt-5 text-lg leading-relaxed text-ink-soft">
          {t('text')}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/cotacao"
            className="bg-ink px-6 py-3.5 font-semibold text-surface transition-colors hover:bg-ink-700"
          >
            {t('primary')}
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-ink px-6 py-3 font-semibold transition-colors hover:bg-ink hover:text-surface"
          >
            {t('secondary')}
          </a>
        </div>

        <p className="mt-7 text-sm text-ink-soft">
          <a href={`mailto:${contato.email}`} className="underline underline-offset-4">
            {contato.email}
          </a>
          <span className="mx-3 text-mist-deep">|</span>
          <a
            href={whatsappUrl(contato.whatsapp)}
            className="pn underline underline-offset-4"
          >
            {contato.telefone_exibicao}
          </a>
        </p>
      </div>
    </Section>
  );
}
