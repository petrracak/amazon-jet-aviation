import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

export const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-archivo',
  display: 'swap',
});

export const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-sans',
  display: 'swap',
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

/** Classe com as três variáveis, para o <html> de cada layout raiz. */
export const classeFontes = `${archivo.variable} ${plexSans.variable} ${plexMono.variable}`;
