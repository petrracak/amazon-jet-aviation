import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { FaqList } from '@/components/faq-list';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });
  return { title: `${t('title')} | Amazon Jet Aviation` };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FaqPageContent />;
}

function FaqPageContent() {
  const t = useTranslations('faq');

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
      <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight">
        {t('title')}
      </h1>
      <div className="mt-10">
        <FaqList />
      </div>
    </div>
  );
}
