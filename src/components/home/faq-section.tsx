import { useTranslations } from 'next-intl';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';

import { Link } from '@/i18n/navigation';
import { Etiqueta, Reveal, Section, SectionTitle } from '@/components/section';
import { FaqList } from '@/components/faq-list';

export function FaqSection() {
  const t = useTranslations('faq');

  return (
    <Section tom="night-2">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <Etiqueta>{t('eyebrow')}</Etiqueta>
          <SectionTitle className="mt-6">{t('title')}</SectionTitle>
          <Link
            href="/faq"
            className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-tag"
          >
            {t('seeAll')}
            <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Reveal atraso={100}>
          <FaqList limit={6} />
        </Reveal>
      </div>
    </Section>
  );
}
