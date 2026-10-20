'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { locales } from '@/i18n/routing';
import { aogWhatsappUrl } from '@/lib/contact';

const localeNames: Record<string, string> = { pt: 'PT', en: 'EN', es: 'ES' };

export function SiteHeader() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/#sobre', label: t('about') },
    { href: '/#servicos', label: t('services') },
    { href: '/#como-funciona', label: t('how') },
    { href: '/blog', label: t('blog') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-ink text-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Amazon Jet Aviation">
          <Image
            src="/brand/logo-wordmark-white.png"
            alt="Amazon Jet Aviation"
            width={160}
            height={45}
            priority
            className="h-7 w-auto"
          />
        </Link>

        <nav className="hidden flex-1 items-center gap-6 text-sm lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/75 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ul className="hidden items-center gap-1 text-xs sm:flex" aria-label={t('language')}>
            {locales.map((l) => (
              <li key={l}>
                <Link
                  href={pathname}
                  locale={l}
                  aria-current={l === locale ? 'true' : undefined}
                  className={
                    l === locale
                      ? 'px-1.5 py-1 font-semibold text-tag'
                      : 'px-1.5 py-1 text-white/55 transition-colors hover:text-white'
                  }
                >
                  {localeNames[l]}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/cotacao"
            className="hidden border border-white/30 px-3.5 py-2 text-sm font-medium transition-colors hover:border-white/70 sm:inline-block"
          >
            {t('quote')}
          </Link>

          <a
            href={aogWhatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-aog px-3.5 py-2 text-sm font-semibold tracking-wide transition-opacity hover:opacity-90"
          >
            {t('aog')}
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            className="-mr-1 p-2 lg:hidden"
          >
            <span className="sr-only">{open ? t('close') : t('menu')}</span>
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
              {open ? (
                <path
                  d="M5 5l12 12M17 5L5 17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              ) : (
                <path
                  d="M3 6h16M3 11h16M3 16h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="menu-mobile"
          className="border-t border-white/10 px-4 pb-5 pt-2 lg:hidden"
        >
          <ul className="flex flex-col">
            {[...links, { href: '/cotacao', label: t('quote') }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/10 py-3 text-base"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-4 flex gap-3 text-sm" aria-label={t('language')}>
            {locales.map((l) => (
              <li key={l}>
                <Link
                  href={pathname}
                  locale={l}
                  onClick={() => setOpen(false)}
                  className={l === locale ? 'font-semibold text-tag' : 'text-white/60'}
                >
                  {localeNames[l]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
