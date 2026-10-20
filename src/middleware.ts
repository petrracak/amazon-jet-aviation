import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Tudo menos API, arquivos estáticos e assets.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
