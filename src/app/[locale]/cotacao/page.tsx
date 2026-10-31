import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Package } from '@phosphor-icons/react/dist/ssr';

import { FormularioCotacao } from '@/components/cotacao/formulario';
import { linkAog, linkWhatsApp } from '@/lib/contact';
import { getConfig } from '@/lib/settings';
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
  const t = await getTranslations({ locale, namespace: 'quote' });
  return { title: `${t('title')} | Amazon Jet Aviation`, description: t('lead') };
}

export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pn?: string | string[] }>;
}) {
  const [{ locale }, consulta] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const [t, { contato, mensagens }] = await Promise.all([
    getTranslations({ locale, namespace: 'quote' }),
    getConfig(),
  ]);

  // Quem chega pela busca do hero traz ?pn= na URL.
  const bruto = Array.isArray(consulta.pn) ? consulta.pn[0] : consulta.pn;
  const pn = bruto?.slice(0, 80).trim() || undefined;

  return (
    <div className="relative isolate overflow-hidden bg-night">
      <div aria-hidden className="malha-pontos absolute inset-0" />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(60rem_26rem_at_50%_0%,rgb(63_135_245/0.18),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <header className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-xl bg-tag/12 text-tag">
            <Package size={28} weight="duotone" />
          </span>
          <h1 className="mt-6 font-display text-4xl leading-tight text-white sm:text-5xl">
            {t('title')}
          </h1>
          <p className="measure mx-auto mt-5 text-base leading-relaxed text-mist-soft sm:text-lg">
            {t('lead')}
          </p>
        </header>

        <div className="mt-10 sm:mt-12">
          <FormularioCotacao
            pnInicial={pn}
            whatsappHref={linkWhatsApp(contato, mensagens)}
            aogHref={linkAog(contato, mensagens)}
          />
        </div>
      </div>
    </div>
  );
}
