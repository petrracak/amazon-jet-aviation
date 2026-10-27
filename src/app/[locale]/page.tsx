import { setRequestLocale } from 'next-intl/server';

import { Hero } from '@/components/home/hero';
import { About, FactStrip, HowItWorks, Services } from '@/components/home/story';
import { Brands, Comandante } from '@/components/home/partnership';
import {
  Aircraft,
  Documentation,
  GlobalReach,
  Testimonials,
  WhyUs,
} from '@/components/home/proof';
import { AogBand, FinalCta } from '@/components/home/action';
import { FaqSection } from '@/components/home/faq-section';
import { AogPopup } from '@/components/site/aog-popup';
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
      <AogPopup aogHref={aogHref} />

      <Hero aogHref={aogHref} />
      <FactStrip />
      {/* O patrocínio sobe para a terceira dobra, como credencial de
          capacidade, logo depois de os fatos da operação. */}
      <Comandante />
      <About />
      <Services />
      <HowItWorks />
      <AogBand aogHref={aogHref} />
      <WhyUs />
      <Documentation />
      <Aircraft />
      <Brands />
      <Testimonials />
      <GlobalReach />
      <FaqSection />
      <FinalCta contato={contato} whatsappHref={linkWhatsApp(contato, mensagens)} />
    </>
  );
}
