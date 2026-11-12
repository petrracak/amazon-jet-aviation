import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { FaqList } from '@/components/faq-list';
import { routing } from '@/i18n/routing';
import { DadosEstruturados } from '@/components/dados-estruturados';
import { alternativas, compartilhamento } from '@/lib/seo';

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
  const titulo = `${t('title')} | Amazon Jet Aviation`;
  return {
    title: titulo,
    alternates: alternativas(locale, '/faq'),
    ...compartilhamento({ locale, titulo, caminho: '/faq' }),
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // As mesmas perguntas da tela, em formato de dado.
  //
  // É a peça que mais rende nesta frente: buscador usa para montar o
  // resultado expansível, e assistente de IA usa como resposta pronta,
  // com a fonte junto. Pergunta e resposta já escritas pela empresa valem
  // mais do que qualquer parágrafo de marketing.
  const t = await getTranslations({ locale, namespace: 'faq' });
  const itens = t.raw('items') as { q: string; a: string }[];

  const perguntas = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: itens.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <>
      <DadosEstruturados dados={perguntas} />
      <FaqPageContent />
    </>
  );
}

function FaqPageContent() {
  const t = useTranslations('faq');

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-24">
      <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight">
        {t('title')}
      </h1>
      <div className="mt-10">
        <FaqList />
      </div>
    </div>
  );
}
