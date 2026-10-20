import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { EMAIL, WHATSAPP_DISPLAY, whatsappUrl } from '@/lib/contact';

export function SiteFooter() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');

  return (
    <footer className="bg-ink text-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1.2fr]">
          <div>
            <p className="font-display text-xl font-bold">Amazon Jet Aviation</p>
            <p className="measure mt-3 text-sm leading-relaxed text-white/65">
              {t('tagline')}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">{t('navTitle')}</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              <li>
                <Link href="/#sobre" className="hover:text-white">
                  {nav('about')}
                </Link>
              </li>
              <li>
                <Link href="/#servicos" className="hover:text-white">
                  {nav('services')}
                </Link>
              </li>
              <li>
                <Link href="/#como-funciona" className="hover:text-white">
                  {nav('how')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white">
                  {nav('blog')}
                </Link>
              </li>
              <li>
                <Link href="/cotacao" className="hover:text-white">
                  {nav('quote')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">{t('contact')}</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              <li>
                <a href={`mailto:${EMAIL}`} className="hover:text-white">
                  {EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pn hover:text-white"
                >
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li className="pt-2 text-white/50">{t('hours')}</li>
            </ul>

            <h2 className="mt-8 text-sm font-semibold">{t('offices')}</h2>
            <address className="mt-4 space-y-3 text-sm not-italic leading-relaxed text-white/60">
              <p>{t('miami')}</p>
              <p>{t('deerfield')}</p>
            </address>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-white/45">
            {t('legal')}
          </p>
          <p className="mt-6 text-xs text-white/45">
            {t('rights', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
