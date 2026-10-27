import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  ChatCircleDots,
  EnvelopeSimple,
  Lightning,
  Phone,
  WhatsappLogo,
} from '@phosphor-icons/react/dist/ssr';

import { Link } from '@/i18n/navigation';
import { Reveal, Section, SectionTitle } from '@/components/section';
import type { Contato } from '@/lib/settings';
import { whatsappUrl } from '@/lib/contact';

/*
  A faixa de AOG é o ponto de maior contraste do site inteiro, porque é o
  momento de maior urgência do cliente: aeronave parada custa por hora.
*/
export function AogBand({ aogHref }: { aogHref: string }) {
  const t = useTranslations('aog');
  const passos = t.raw('steps') as { title: string; text: string }[];

  return (
    <section id="aog" className="relative isolate overflow-hidden bg-aog-deep">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_15%_-20%,rgb(255_255_255/0.18),transparent_60%),radial-gradient(50rem_40rem_at_100%_120%,rgb(0_0_0/0.45),transparent_60%)]"
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-md bg-white/15 px-3 py-1.5 text-sm font-bold tracking-wide text-white">
            <Lightning size={16} weight="fill" />
            {t('tag')}
          </p>

          <SectionTitle className="mt-6">{t('title')}</SectionTitle>

          <p className="measure mt-5 text-base leading-relaxed text-white/85 sm:text-lg">
            {t('text')}
          </p>

          <a
            href={aogHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-9 inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-4 font-bold text-aog-deep transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_rgb(0_0_0/0.6)]"
          >
            <WhatsappLogo size={22} weight="fill" className="transition-transform group-hover:scale-110" />
            {t('cta')}
          </a>

          <p className="mt-5 text-sm text-white/65">{t('support')}</p>
        </Reveal>

        <Reveal atraso={120}>
          <ol className="divide-y divide-white/20 overflow-hidden rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-sm">
            {passos.map((passo, i) => (
              <li key={passo.title} className="flex gap-5 p-5 sm:p-6">
                <span className="pn shrink-0 text-sm font-bold text-white/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-lg text-white">{passo.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-white/80">{passo.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
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
    <Section className="overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_30rem_at_50%_0%,rgb(63_135_245/0.16),transparent_65%)]"
      />

      <Reveal className="relative mx-auto max-w-3xl text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-xl bg-tag/12 text-tag">
          <ChatCircleDots size={28} weight="duotone" />
        </span>

        <SectionTitle className="mt-6">{t('title')}</SectionTitle>
        <p className="measure mx-auto mt-5 text-base leading-relaxed text-mist-soft sm:text-lg">
          {t('text')}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/cotacao"
            className="group inline-flex items-center gap-2 rounded-full bg-tag px-7 py-4 font-semibold text-night transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-12px_rgb(240_173_19/0.7)]"
          >
            {t('primary')}
            <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </Link>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white/60"
          >
            <WhatsappLogo size={20} weight="fill" className="transition-transform group-hover:scale-110" />
            {t('secondary')}
          </a>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-mist-soft">
          <a
            href={`mailto:${contato.email}`}
            className="inline-flex items-center gap-2 transition-colors hover:text-white"
          >
            <EnvelopeSimple size={18} weight="duotone" className="text-tag" />
            {contato.email}
          </a>
          <a
            href={whatsappUrl(contato.whatsapp)}
            className="pn inline-flex items-center gap-2 transition-colors hover:text-white"
          >
            <Phone size={18} weight="duotone" className="text-tag" />
            {contato.telefone_exibicao}
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
