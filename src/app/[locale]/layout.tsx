import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Pixels } from '@/components/site/pixels';
import { FloatingActions } from '@/components/site/floating-actions';
import { linkAog, linkWhatsApp } from '@/lib/contact';
import { classeFontes } from '@/lib/fonts';
import { getConfig } from '@/lib/settings';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amazonjetaviation.com',
  ),
  title: 'Amazon Jet Aviation | Peças aeronáuticas EUA e Brasil',
  description:
    'Sourcing de peças aeronáuticas dos EUA para o Brasil: novas, overhauled, repaired e serviceable. Cotação com documentação clara e AOG com prioridade.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const { contato, mensagens, pixels } = await getConfig();

  return (
    <html lang={locale} className={classeFontes}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-surface"
          >
            Ir para o conteúdo
          </a>
          <SiteHeader aogHref={linkAog(contato, mensagens)} />
          <main id="conteudo" className="flex-1">
            {children}
          </main>
          <SiteFooter contato={contato} />
          <FloatingActions
            whatsappHref={linkWhatsApp(contato, mensagens)}
            aogHref={linkAog(contato, mensagens)}
          />
        </NextIntlClientProvider>
        <Pixels pixels={pixels} />
      </body>
    </html>
  );
}
