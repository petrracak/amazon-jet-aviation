import type { Metadata, Viewport } from 'next';

import { ThemeProvider } from '@/components/theme-provider';
import { classeFontes } from '@/lib/fonts';
import '../globals.css';

/**
 * Raiz do painel, separada do site: aqui não há idioma na URL nem tradução.
 * O painel é interno e fica só em português.
 */
export const metadata: Metadata = {
  title: { default: 'Painel', template: '%s | Painel Amazon Jet' },
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: 'Painel', statusBarStyle: 'default' },
};

/**
 * viewport-fit=cover deixa o painel ocupar a tela inteira no iPhone; sem
 * ele, env(safe-area-inset-bottom) vale zero e a barra de abas fica por
 * baixo do indicador de início.
 */
export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1b2b' },
  ],
};

export default function AdminRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={classeFontes} suppressHydrationWarning>
      <body className="bg-bg text-fg">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
