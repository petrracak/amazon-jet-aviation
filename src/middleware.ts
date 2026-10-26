import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Só o site público passa pelo roteamento de idioma. O painel (/admin) e o
  // retorno do link de acesso (/auth) ficam de fora: são internos, só em
  // português, e não têm idioma na URL.
  matcher: '/((?!api|admin|auth|_next|_vercel|.*\\..*).*)',
};
