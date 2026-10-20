import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Section, SectionTitle } from '@/components/section';
import { FaqList } from '@/components/faq-list';

export function FaqSection() {
  const t = useTranslations('faq');

  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <SectionTitle>{t('title')}</SectionTitle>
          <Link
            href="/faq"
            className="mt-5 inline-block font-semibold underline decoration-tag decoration-2 underline-offset-4"
          >
            {t('seeAll')}
          </Link>
        </div>

        <FaqList limit={6} />
      </div>
    </Section>
  );
}
